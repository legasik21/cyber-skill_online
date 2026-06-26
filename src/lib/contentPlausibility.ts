// Content-plausibility scoring — the method-agnostic core of the order anti-spam.
//
// The order-form bots we see submit a CORRECTLY computed price with fully-filled
// calculator fields but GARBAGE free-text: a random-token "Discord handle"
// (e.g. "zmHspUicVxsLCTkCoRN"), a high-entropy "message" (e.g.
// "rlShRBGGzHCChjcizjXuhcCM"), and a structurally-implausible email
// (e.g. "u.b.ox.omew.u.vu.t74@gmail.com"). The signed-token / honeypot / timing
// checks can't catch this because the bot drives the real form (or just fetches
// a fresh token per submit), so the only robust signal is the CONTENT itself —
// and it stays robust no matter HOW the request is sent.
//
// Design principle: there is no human to catch false positives, so we REJECT
// only when at least two INDEPENDENT strong signals agree (score >= threshold).
// A normal order — "john.smith@gmail.com" / "CoolGamer#1234" / "boost my Obj 260
// to 3 marks please" — scores 0. Every score is logged for tuning, and the
// threshold is env-tunable (FORM_CONTENT_REJECT_SCORE) without code changes.

const VOWELS = new Set('aeiouAEIOU');

function isAsciiLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

function isUpper(ch: string): boolean {
  return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

interface LetterStats {
  letters: number;
  vowels: number;
  vowelRatio: number;
  maxConsonantRun: number;
  caseFlips: number;
  caseFlipRatio: number;
}

function letterStats(s: string): LetterStats {
  let letters = 0;
  let vowels = 0;
  let maxRun = 0;
  let run = 0;
  let caseFlips = 0;
  let prevLetter: string | null = null;
  for (const ch of s) {
    if (isAsciiLetter(ch)) {
      letters++;
      if (VOWELS.has(ch)) {
        vowels++;
        run = 0;
      } else {
        run++;
        if (run > maxRun) maxRun = run;
      }
      // Case flips only count WITHIN a contiguous run of letters, so "x_X" or
      // "a b" don't inflate the signal.
      if (prevLetter !== null && isUpper(prevLetter) !== isUpper(ch)) caseFlips++;
      prevLetter = ch;
    } else {
      run = 0;
      prevLetter = null;
    }
  }
  return {
    letters,
    vowels,
    vowelRatio: letters ? vowels / letters : 0,
    maxConsonantRun: maxRun,
    caseFlips,
    caseFlipRatio: letters > 1 ? caseFlips / (letters - 1) : 0,
  };
}

function shannonEntropyPerChar(s: string): number {
  const freq = new Map<string, number>();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  const n = s.length;
  let h = 0;
  for (const c of freq.values()) {
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

export interface GibberishResult {
  gibberish: boolean;
  hits: number;
  reasons: string[];
}

/**
 * Judge whether a SINGLE token looks like a randomly generated string.
 *
 * Only single tokens (no internal whitespace) of meaningful length are judged —
 * a real free-text message has spaces and never reaches the gibberish branches.
 * Flag as gibberish only when >= 3 independent structural signals agree. Random
 * bot tokens ("zmHspUicVxsLCTkCoRN") trip 4-5; an ordinary or decorated handle
 * ("xX_ProGamer_Xx", "Destroyer_GG") trips at most 2, so it is never flagged.
 */
export function gibberishSignals(raw: string): GibberishResult {
  const s = (raw ?? '').trim();
  if (!s || /\s/.test(s) || s.length < 8) return { gibberish: false, hits: 0, reasons: [] };
  const st = letterStats(s);
  // Mostly non-letters (e.g. a phone number) — not the random-token shape we target.
  if (st.letters < 6) return { gibberish: false, hits: 0, reasons: [] };

  const entropy = shannonEntropyPerChar(s);
  const uniq = new Set(s.toLowerCase()).size;
  const reasons: string[] = [];

  if (st.vowelRatio < 0.28 || st.vowelRatio > 0.66) reasons.push('vowel_ratio');
  if (st.maxConsonantRun >= 5) reasons.push('consonant_run');
  if (st.caseFlipRatio >= 0.4) reasons.push('case_flips');
  if (entropy >= 3.7 && s.length >= 12) reasons.push('entropy');
  if (s.length >= 14 && uniq / s.length >= 0.72) reasons.push('uniqueness');

  return { gibberish: reasons.length >= 3, hits: reasons.length, reasons };
}

/**
 * Collapse an email to a canonical identity for rate limiting: lowercase, drop
 * a "+tag" suffix, and for Gmail drop the dots Gmail ignores — so
 * "u.b.ox.omew@gmail.com" and "uboxomew@gmail.com" map to one identity.
 */
export function normalizeEmail(email: string): string {
  const e = (email ?? '').trim().toLowerCase();
  const at = e.indexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at);
  const domain = e.slice(at + 1);
  local = local.split('+')[0];
  if (domain === 'gmail.com' || domain === 'googlemail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

export interface EmailResult {
  suspicious: boolean;
  reasons: string[];
}

/**
 * An email is "suspicious" only when at least two independent reasons agree, so
 * an ordinary dotted Gmail ("john.doe@gmail.com", "a.b.c.d@gmail.com") is never
 * flagged. The sample "u.b.ox.omew.u.vu.t74@gmail.com" trips both `many_dots`
 * and `tiny_segments`.
 */
export function emailSuspicious(email: string): EmailResult {
  const e = (email ?? '').trim().toLowerCase();
  const at = e.indexOf('@');
  if (at < 1) return { suspicious: false, reasons: [] };
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';
  const reasons: string[] = [];

  if (isGmail) {
    const dots = (local.match(/\./g) ?? []).length;
    const tinySegments = local.split('.').filter((seg) => seg.length === 1).length;
    if (dots >= 4) reasons.push('many_dots');
    if (tinySegments >= 3) reasons.push('tiny_segments');
  }
  // High-entropy / random local part (after collapsing the dots Gmail ignores).
  const collapsed = isGmail ? local.replace(/\./g, '') : local;
  if (gibberishSignals(collapsed).gibberish) reasons.push('gibberish_local');

  return { suspicious: reasons.length >= 2, reasons };
}

const LEGACY_DISCORD = /^.{2,32}#\d{4}$/; // OldName#1234
const NEW_DISCORD = /^[a-z0-9._]{2,32}$/; // new lowercase usernames

/** Plausible if it matches either real Discord username format (a leading "@" is tolerated). */
export function isPlausibleDiscord(tag: string): boolean {
  const t = (tag ?? '').trim().replace(/^@/, '');
  if (!t) return false;
  if (LEGACY_DISCORD.test(t)) return true;
  if (NEW_DISCORD.test(t) && !t.includes('..') && !t.startsWith('.') && !t.endsWith('.')) return true;
  return false;
}

export interface ContentScore {
  score: number;
  threshold: number;
  signals: string[];
  reject: boolean;
}

export interface OrderContentInput {
  email?: string;
  discordTag?: string;
  message?: string;
  name?: string;
}

/**
 * Combine per-field signals into a single conservative decision. Weights are
 * chosen so a reject requires roughly two INDEPENDENT strong signals (e.g. a
 * gibberish Discord handle AND a suspicious email): one weird field alone never
 * rejects. Default threshold 5; tune via FORM_CONTENT_REJECT_SCORE.
 */
export function scoreOrderContent(input: OrderContentInput): ContentScore {
  const signals: string[] = [];
  let score = 0;

  const discord = (input.discordTag ?? '').trim();
  if (discord) {
    if (gibberishSignals(discord).gibberish) {
      score += 3;
      signals.push('discord_gibberish');
    } else if (!isPlausibleDiscord(discord)) {
      score += 1;
      signals.push('discord_format');
    }
  }

  const email = (input.email ?? '').trim();
  if (email) {
    const e = emailSuspicious(email);
    if (e.suspicious) {
      score += 3;
      signals.push(`email_suspicious(${e.reasons.join('+')})`);
    }
  }

  const message = (input.message ?? '').trim();
  if (message && gibberishSignals(message).gibberish) {
    score += 3;
    signals.push('message_gibberish');
  }

  const name = (input.name ?? '').trim();
  if (name && gibberishSignals(name).gibberish) {
    score += 2;
    signals.push('name_gibberish');
  }

  const threshold = Number(process.env.FORM_CONTENT_REJECT_SCORE || 5);
  return { score, threshold, signals, reject: score >= threshold };
}
