// FAQ / support knowledge base for the AI chat assistant (answer_faq tool source).
//
// Every entry is grounded VERBATIM in the live site: the /guarantee, /terms, and
// /privacy pages and the homepage trust section. Do NOT invent policy — if a
// customer asks something not covered here, the assistant should say it will check
// with a manager (escalate) rather than guess.
//
// NOTE (flagged to owner): the three policy pages cite three different contact
// emails (guarantee: cyberskill@gmail.com, terms: cyberskillwot@gmail.com,
// privacy: privacy@cyberskill.com). These are reproduced as-is per source; the
// owner should confirm the canonical support address before go-live.

export type FaqTopic =
  | "account-safety"
  | "2fa"
  | "refunds"
  | "payment"
  | "privacy"
  | "vpn"
  | "delivery"
  | "eligibility-risk"
  | "service-quality"
  | "support"
  | "contact"

export type FaqEntry = {
  id: string
  question: string
  answer: string
  topic: FaqTopic
  /** Page the fact is sourced from. */
  source: "guarantee" | "terms" | "privacy" | "homepage"
}

export const FAQ: FaqEntry[] = [
  // --- Account safety & 2FA ---
  {
    id: "account-safety-measures",
    question: "Is my account safe during boosting, and what do you require to keep it secure?",
    answer:
      "Your account safety is our top priority. We always insist on changing your password before and after the order, and on linking your account to your personal phone number. We strongly recommend enabling two-step verification (2FA) on the World of Tanks website — with 2FA, you enter a code from an app on your phone at every login, so no one but you can access your account, change your password, or change your email.",
    topic: "2fa",
    source: "guarantee",
  },
  {
    id: "staff-never-ask-recovery",
    question: "Will your staff ask for my account recovery information?",
    answer:
      "No. Our employees never request the personal data needed to recover access to your account. That information must remain confidential and should only ever be known to you.",
    topic: "account-safety",
    source: "guarantee",
  },
  {
    id: "how-booster-accesses",
    question: "How does the booster access my account?",
    answer:
      "The assigned player logs into your account in the WoT client using your password to complete the order. Account credentials are encrypted and stored securely, and are deleted immediately after the service is completed.",
    topic: "account-safety",
    source: "privacy",
  },
  {
    id: "no-login-during-service",
    question: "Can I log into my account while the service is being performed?",
    answer:
      "Please don't log in while a service is in progress without coordinating with our support team first. Concurrent sessions from different locations significantly increase the risk of the account being flagged.",
    topic: "account-safety",
    source: "terms",
  },

  // --- VPN & privacy ---
  {
    id: "vpn-protection",
    question: "Do you use VPN protection?",
    answer:
      "Yes. We use VPN protection matched to your location during service delivery to minimize risk and protect your privacy. Your data is treated as encrypted and confidential.",
    topic: "vpn",
    source: "privacy",
  },
  {
    id: "data-sharing",
    question: "Do you sell or share my personal information?",
    answer:
      "We do not sell, trade, or rent your personal information. We share data only with trusted service providers who help run our operations, with the professional booster assigned to your order (limited to the game credentials they need), and with law enforcement where required by law.",
    topic: "privacy",
    source: "privacy",
  },
  {
    id: "data-retention",
    question: "How long do you keep my data?",
    answer:
      "We keep personal information only as long as necessary to provide the service and meet legal obligations. Account credentials are deleted immediately after the order is completed.",
    topic: "privacy",
    source: "privacy",
  },
  {
    id: "data-rights",
    question: "What rights do I have over my data?",
    answer:
      "You can request access to your personal information, ask us to correct inaccurate data, request deletion of your data, and opt out of marketing communications.",
    topic: "privacy",
    source: "privacy",
  },

  // --- Refunds ---
  {
    id: "refund-when",
    question: "When can I request a refund?",
    answer:
      "You can request a refund if the work did not meet your stated requirements, if you change your mind about using our service, if there's a disagreement about the terms or a payment was made to the wrong details, or if the agreed result wasn't achieved. Refunds are handled case by case.",
    topic: "refunds",
    source: "guarantee",
  },
  {
    id: "refund-after-start",
    question: "What if I ask for a refund after the work has started?",
    answer:
      "If a refund is requested after the service has already started, we reserve the right to deduct a prorated amount for the work already completed.",
    topic: "refunds",
    source: "terms",
  },

  // --- Payment ---
  {
    id: "payment-timing",
    question: "When do I pay, and can prices change?",
    answer:
      "Payment is made in full before the service is delivered. Payments are processed securely through third-party providers. Prices are subject to change.",
    topic: "payment",
    source: "terms",
  },

  // --- Delivery / quality / support ---
  {
    id: "delivery-speed",
    question: "How quickly do you start my order?",
    answer:
      "We start as soon as possible after your order is confirmed — delivery is fast, and the team typically reaches out shortly after you place an order to confirm details.",
    topic: "delivery",
    source: "homepage",
  },
  {
    id: "who-completes-orders",
    question: "Who actually completes the boosting?",
    answer:
      "Orders are completed by Unicum players — top ~0.1% World of Tanks players acting as experienced independent contractors.",
    topic: "service-quality",
    source: "homepage",
  },
  {
    id: "support-availability",
    question: "Is support available, and when?",
    answer: "Yes — expert support is available 24/7 to assist you before, during, and after your order.",
    topic: "support",
    source: "homepage",
  },
  {
    id: "mission-class-glossary",
    question: "What do mission codes like \"HT-15\" mean, and what are LT, MT, HT, TD, and SPG?",
    answer:
      "In World of Tanks campaign missions, the class abbreviations are: LT = Light Tank, MT = Medium Tank, HT = Heavy Tank, TD = Tank Destroyer, and SPG = artillery (self-propelled gun). A code like \"HT-15\" means the Heavy-branch mission #15. A mission is fully specified by its class, its number, and its reward tank — together those three things identify exactly which mission you mean.",
    topic: "service-quality",
    source: "homepage",
  },
  {
    id: "campaign-branches-reward-tanks",
    question: "How are the campaigns and their mission branches organized, and how does the reward tank identify the campaign?",
    answer:
      "Each Personal Missions campaign has its own set of mission branches. Campaign 1.0 uses the branches lt/mt/ht/td/spg; Campaign 2.0 uses union/bloc/alliance/coalition; Campaign 3.0 uses vanguard/ambush/assistance. The reward tank's name identifies both the branch (track) and the campaign: Campaign 1.0 awards the Stug IV, T-28 Concept, T-55A, and Object 260; Campaign 2.0 awards the Excalibur, Chimera, and Object 279 (e); Campaign 3.0 awards the Windhund, Dravec, and Black Rock. So if you tell us a reward tank, we already know which campaign and track you mean.",
    topic: "service-quality",
    source: "homepage",
  },

  // --- Eligibility / risk ---
  {
    id: "eula-risk",
    question: "Is boosting against the game's rules?",
    answer:
      "Using boosting services is a violation of Wargaming's End User License Agreement (EULA). We take strong precautions (VPN, 2FA guidance, no concurrent logins), but we cannot be held responsible for penalties, temporary bans, or account suspensions — you use the service at your own risk. Our total liability is limited to the amount paid for the specific service in question.",
    topic: "eligibility-risk",
    source: "terms",
  },
]

/** Quick topic index for retrieval / grouping. */
export const FAQ_TOPICS: FaqTopic[] = [
  "account-safety",
  "2fa",
  "refunds",
  "payment",
  "privacy",
  "vpn",
  "delivery",
  "eligibility-risk",
  "service-quality",
  "support",
  "contact",
]

/** Trust signals advertised on the homepage (for sales context, not policy). */
export const TRUST_SIGNALS = {
  ordersCompleted: "5,000+",
  averageRating: "4.9/5",
  support: "24/7",
  security: "100% Secure & Safe — VPN protected, encrypted & confidential",
}
