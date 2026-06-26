import { describe, it, expect } from 'vitest';
import {
  scoreOrderContent,
  gibberishSignals,
  emailSuspicious,
  isPlausibleDiscord,
  normalizeEmail,
} from '@/lib/contentPlausibility';

// The exact spam sample the owner reported.
const REAL_SAMPLE = {
  discordTag: 'zmHspUicVxsLCTkCoRN',
  email: 'u.b.ox.omew.u.vu.t74@gmail.com',
  message: 'rlShRBGGzHCChjcizjXuhcCM',
};

// A realistic spread of GENUINE orders. NONE of these may be rejected — there is
// no human to catch a false positive, so a single regression here is a real
// customer silently lost.
const LEGIT_ORDERS = [
  { email: 'john.smith@gmail.com', discordTag: 'CoolGamer#1234', message: 'Please boost my Obj 260 to 3 marks, thanks!' },
  { email: 'maria.ivanova@outlook.com', discordTag: 'maria_tanks', message: 'Need it done by Friday if possible' },
  { email: 'j.s.bach@gmail.com', discordTag: 'shadow.wolf', message: 'wn8 2800 please' },
  { email: 'a.b.c.d@gmail.com', discordTag: 'xX_ProGamer_Xx', message: '' },
  { email: 'the.real.slim.shady@gmail.com', discordTag: 'Destroyer_GG', message: 'asap' },
  { email: 'user2024@yahoo.com', discordTag: 'blitzkrieg88', message: 'tier 10 only' },
  { email: 'firstname.lastname@gmail.com', discordTag: 'tank.commander', message: 'can you do credits farm to 10kk' },
  { email: 'pavel.k@protonmail.com', discordTag: 'WoT_Legend', message: 'спасибо, нужно к выходным' },
  { email: 'kebabmaster@gmail.com', discordTag: 'kebab_master', message: 'mark of excellence on the 279e' },
  { email: 'l.martin@company.co.uk', discordTag: 'lucasm', message: 'Hello, I would like the battle pass completed.' },
  { email: 'newplayer@gmail.com', discordTag: 'NewPlayer2024', message: 'first time ordering, is it safe?' },
  { email: 'gamer.pro.99@gmail.com', discordTag: 'ghost', message: 'onslaught to gold league' },
  { email: 'anna@web.de', discordTag: 'Anna#0007', message: 'brauche das bis morgen bitte' },
  { email: 'mike99@gmail.com', discordTag: 'mike_the_tanker', message: 'urgentplease' },
  { email: 'tomato.farmer@gmail.com', discordTag: 'tomato.farmer.42', message: 'exp farm on tier 8 prems' },
];

// Bot-shaped orders (random-token handles, high-entropy messages, gmail dot abuse).
const BOT_ORDERS = [
  REAL_SAMPLE,
  { discordTag: 'XkQvWzPLmNbHsTdRfG', email: 'x.q.z.k.p.f.t.r@gmail.com', message: 'qWzKpFldJmXnVbCtRsHg' },
  { discordTag: 'BcDfGhJkLmNpQrStVw', email: 'a.b.c.d.e.f.g@gmail.com', message: 'zxcvbnmasdfghjklqwrt' },
  { discordTag: 'pLkMnBvCxZqWeRtYuI', email: 'r.t.y.u.i.o.p@googlemail.com', message: 'mNbVcXzLkJhGfDsApOiU' },
];

describe('content scoring — the reported spam is rejected', () => {
  it('rejects the exact real sample with a large margin', () => {
    const r = scoreOrderContent(REAL_SAMPLE);
    expect(r.reject).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(r.threshold);
    expect(r.signals).toContain('discord_gibberish');
    expect(r.signals).toContain('message_gibberish');
  });

  it('rejects all bot-shaped variants', () => {
    for (const bot of BOT_ORDERS) {
      const r = scoreOrderContent(bot);
      expect(r.reject, `expected reject for ${JSON.stringify(bot)} -> ${JSON.stringify(r)}`).toBe(true);
    }
  });
});

describe('content scoring — NO false positives on genuine orders', () => {
  it('accepts every legit order in the corpus', () => {
    const failures = LEGIT_ORDERS.map((o) => ({ o, r: scoreOrderContent(o) })).filter((x) => x.r.reject);
    expect(
      failures,
      `false positives: ${JSON.stringify(failures, null, 2)}`,
    ).toHaveLength(0);
  });

  it('a single garbage field alone never rejects (requires 2 independent signals)', () => {
    // Gibberish message but a perfectly normal email + discord -> must pass.
    expect(scoreOrderContent({ email: 'john.smith@gmail.com', discordTag: 'CoolGamer#1234', message: 'rlShRBGGzHCChjcizjXuhcCM' }).reject).toBe(false);
    // Gibberish discord but normal email + message -> must pass.
    expect(scoreOrderContent({ email: 'john.smith@gmail.com', discordTag: 'zmHspUicVxsLCTkCoRN', message: 'please boost my account' }).reject).toBe(false);
    // Suspicious email but normal discord + message -> must pass.
    expect(scoreOrderContent({ email: 'u.b.ox.omew.u.vu.t74@gmail.com', discordTag: 'CoolGamer#1234', message: 'please boost my account' }).reject).toBe(false);
  });
});

describe('gibberishSignals', () => {
  it('flags random tokens', () => {
    expect(gibberishSignals('zmHspUicVxsLCTkCoRN').gibberish).toBe(true);
    expect(gibberishSignals('rlShRBGGzHCChjcizjXuhcCM').gibberish).toBe(true);
    expect(gibberishSignals('XkQvWzPLmNbHsTdRfG').gibberish).toBe(true);
  });
  it('does not flag real handles / words / sentences', () => {
    for (const s of ['CoolGamer123', 'shadow_wolf', 'xX_ProGamer_Xx', 'Destroyer_GG', 'tank_commander', 'NewPlayer2024', 'urgentplease', 'kebab_master', 'please boost my account to 3 marks']) {
      expect(gibberishSignals(s).gibberish, `${s} should not be gibberish`).toBe(false);
    }
  });
});

describe('emailSuspicious', () => {
  it('flags gmail dot-abuse', () => {
    expect(emailSuspicious('u.b.ox.omew.u.vu.t74@gmail.com').suspicious).toBe(true);
  });
  it('does not flag ordinary dotted gmail or other providers', () => {
    for (const e of ['john.smith@gmail.com', 'j.s.bach@gmail.com', 'a.b.c.d@gmail.com', 'firstname.lastname@gmail.com', 'user@yahoo.com', 'l.martin@company.co.uk']) {
      expect(emailSuspicious(e).suspicious, `${e} should not be suspicious`).toBe(false);
    }
  });
});

describe('isPlausibleDiscord', () => {
  it('accepts legacy and new formats', () => {
    expect(isPlausibleDiscord('CoolGamer#1234')).toBe(true);
    expect(isPlausibleDiscord('shadow.wolf')).toBe(true);
    expect(isPlausibleDiscord('@tank_commander')).toBe(true);
  });
  it('rejects clearly invalid handles', () => {
    expect(isPlausibleDiscord('zmHspUicVxsLCTkCoRN')).toBe(false); // caps, no #digits
  });
});

describe('normalizeEmail', () => {
  it('collapses gmail dots and +tags to one identity', () => {
    expect(normalizeEmail('u.b.ox.omew@gmail.com')).toBe(normalizeEmail('uboxomew@gmail.com'));
    expect(normalizeEmail('John.Smith+wot@gmail.com')).toBe('johnsmith@gmail.com');
    expect(normalizeEmail('a.b.c@yahoo.com')).toBe('a.b.c@yahoo.com'); // non-gmail keeps dots
  });
});
