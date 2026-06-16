/* ------------------------------------------------------------------ *
 *  Shared World of Tanks event data — single source of truth.          *
 *                                                                      *
 *  Verified against official WoT EU/NA news (worldoftanks.eu / .com).  *
 *  Current as of 2026-06-16. Both the /events page and the homepage    *
 *  "Current Events" section read from this module so the two can       *
 *  never drift apart. Update events HERE only.                          *
 * ------------------------------------------------------------------ */

// Full literal class strings per accent so Tailwind can statically detect them.
export const ACCENTS = {
  red: { border: "border-red-500/50", grad: "from-red-500/10", badge: "bg-red-500", text: "text-red-400", btn: "bg-red-600 hover:bg-red-700" },
  cyan: { border: "border-cyan-500/50", grad: "from-cyan-500/10", badge: "bg-cyan-500", text: "text-cyan-400", btn: "bg-cyan-600 hover:bg-cyan-700" },
  amber: { border: "border-amber-500/50", grad: "from-amber-500/10", badge: "bg-amber-500", text: "text-amber-400", btn: "bg-amber-600 hover:bg-amber-700" },
  emerald: { border: "border-emerald-500/50", grad: "from-emerald-500/10", badge: "bg-emerald-500", text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700" },
} as const

export type Accent = keyof typeof ACCENTS

export type FeatureEvent = {
  emoji: string
  title: string
  description: string
  accent: Accent
  badge: string
  details: { icon: string; text: string }[]
  boostTitle: string
  offers: { label: string; price: string; note: string }[]
  ctaLabel: string
  ctaHref: string
}

export type PastEvent = {
  emoji: string
  title: string
  description: string
  ended: string
}

export const ACTIVE_EVENTS: FeatureEvent[] = [
  {
    emoji: "🏜️",
    title: "Battle Pass Season XX: Searching the Sands",
    description: "The summer Battle Pass is live. Push through three desert-themed chapters and claim the exclusive KB-52 with your Tokens.",
    accent: "cyan",
    badge: "ACTIVE NOW",
    details: [
      { icon: "📅", text: "Duration: Jun 3 – Sep 2, 2026" },
      { icon: "🏆", text: "Reward Tank: KB-52 (Tier IX, 28 Tokens)" },
      { icon: "🎨", text: "Tier X styles: WZ-113G FT, Bat.-Châtillon 25 t, CS-63" },
      { icon: "📚", text: "Three chapters · Tokens, Bonds, Crew & more" },
    ],
    boostTitle: "Boost Services Available",
    offers: [
      { label: "Level Boost", price: "$2.5/lvl", note: "Fast progression through every Battle Pass stage" },
      { label: "Full Pass (50 levels)", price: "$125", note: "Complete all chapters and bank the KB-52 Tokens" },
    ],
    ctaLabel: "Order Battle Pass Boost",
    ctaHref: "/services/battle-pass",
  },
  {
    emoji: "🕹️",
    title: "Arcade Cabinet: Equalize!",
    description: "A limited-time arcade mode where every tank is equalized across Tiers I–X. Pure skill, big progression rewards — but only until June 21.",
    accent: "amber",
    badge: "ACTIVE NOW",
    details: [
      { icon: "📅", text: "Duration: Jun 12 – 21, 2026" },
      { icon: "⚔️", text: "Mode: Equalized all-tier arcade battles (I–X)" },
      { icon: "🏆", text: "Up to 350K credits, 5,250 bonds & Free XP" },
      { icon: "🎟️", text: "Battle Pass Points & Premium Account time" },
    ],
    boostTitle: "Boost Services Available",
    offers: [
      { label: "Credit Farm", price: "From $4.5/M", note: "Bank millions of credits while the mode is live" },
      { label: "Bond Farm", price: "$7/100", note: "Stack bonds from the equalized battles" },
    ],
    ctaLabel: "Order Arcade Boost",
    ctaHref: "/services/arcade-cabinet",
  },
]

export const UPCOMING_EVENTS: FeatureEvent[] = [
  {
    emoji: "🏆",
    title: "Tankfest 2026",
    description: "The Tank Museum's legendary weekend returns. Grind the Road to Tankfest missions for the Tiger 131, then tune in to the Online stream for Mystery Drops.",
    accent: "emerald",
    badge: "UPCOMING",
    details: [
      { icon: "📅", text: "Road to Tankfest: from Jun 22 · Online Stream: Jun 26 – 28" },
      { icon: "🎖️", text: "Mission Reward: VI Tiger 131 (German Premium)" },
      { icon: "🎁", text: "Mystery Drops: 3D styles & Premium vehicles" },
      { icon: "📺", text: "Tankfest Token Store: free Premium tank" },
    ],
    boostTitle: "Boost Services Available",
    offers: [
      { label: "Tiger 131 Missions", price: "Custom", note: "We complete the Road to Tankfest missions for the Tiger 131" },
      { label: "Mission Bundle", price: "Get a quote", note: "Stack rewards across the Tankfest weekend" },
    ],
    ctaLabel: "Order Mission Boost",
    ctaHref: "/services/campaign-missions",
  },
]

// Archive — most recently ended first.
export const PAST_EVENTS: PastEvent[] = [
  { emoji: "🔫", title: "Steel Hunter Summer 2026", description: "Battle royale survival — Survival of the Fittest.", ended: "Jun 15, 2026" },
  { emoji: "🔄", title: "Trade-In: Try Something New", description: "Trade Tier VI–VIII Premiums for 50% gold value toward a new tank.", ended: "Jun 12, 2026" },
  { emoji: "🎖️", title: "D-Day: 82nd Anniversary", description: "Commemorative missions, D-Day Tokens and the 'Turning the Tide' style.", ended: "Jun 12, 2026" },
  { emoji: "🧊", title: "Battle Pass Season XIX: Operation Borealis", description: "Arctic season — reward tank Saryuda plus three Tier X 3D styles.", ended: "Jun 3, 2026" },
  { emoji: "🐉", title: "Onslaught: Season of the Jade Dragon", description: "Year of the Dragon finale — annual reward, the Ashbringer.", ended: "Jun 1, 2026" },
  { emoji: "🕊️", title: "VE Day: 81st Anniversary", description: "Victory in Europe missions and the M4-85 reward tank.", ended: "May 14, 2026" },
  { emoji: "🖖", title: "Star Trek Collaboration", description: "The AAT60 tank and the U.S.S. Enterprise crew.", ended: "May 8, 2026" },
  { emoji: "🎂", title: "World of Tanks 15th Birthday", description: "Anniversary gifts, Cupcake Tokens and the T26E3 Eagle 7.", ended: "Apr 20, 2026" },
  { emoji: "☘️", title: "Glorious in Green (Steel Hunter: Shamrock)", description: "St. Patrick's festival with the Shamrock Showdown battle royale.", ended: "Mar 20, 2026" },
  { emoji: "🌸", title: "Girls und Panzer (5th Collaboration)", description: "StuG III Ausf. F Kabasan and the Team-Kabasan crew.", ended: "Mar 12, 2026" },
  { emoji: "🌱", title: "Spring Token Store", description: "Twitch Drops tokens for Premium tanks VK 45.03 & Heavy Tank No. VI.", ended: "Mar 30, 2026" },
  { emoji: "🐉", title: "Onslaught: Season of the Crimson Dragon", description: "Year of the Dragon, Season 2 — progress toward the Ashbringer.", ended: "Feb 23, 2026" },
  { emoji: "🤖", title: "Battle Pass Special: RoboCop", description: "The RoboCop collaboration and the OCP Peacekeeper tank.", ended: "Jan 29, 2026" },
  { emoji: "🎄", title: "Holiday Ops 2026", description: "Festive bonuses, the Festive Tree and special rewards.", ended: "Jan 12, 2026" },
  { emoji: "🎁", title: "Battle Pass: Holiday Havoc", description: "Winter special pass — Santa & Krampowski crew commanders.", ended: "Jan 12, 2026" },
]
