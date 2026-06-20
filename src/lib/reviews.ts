import { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];

export type Review = {
  id: string;
  date: string;
  name: string;
  /**
   * Localized review body. German translations are machine-assisted and MUST be
   * proofread by a native speaker before going live (see the i18n report).
   */
  body: Record<Locale, string>;
  stars: number;
};

// Single source of truth for customer reviews. Consumed by the on-page
// ReviewsSlider and by the homepage Review/AggregateRating JSON-LD so the
// structured data always matches what is actually shown to users.
export const reviews: Review[] = [
  {
    id: "review_1",
    date: "2024-11-22",
    name: "Anonym",
    body: {
      en: "Ordered Front Line farm. The driver actually hit 100 million credits in 10 days. 100kk... THX!!!.",
      de: "Front-Line-Farm bestellt. Der Booster hat tatsächlich 100 Millionen Credits in 10 Tagen geholt. 100kk... DANKE!!!.",
    },
    stars: 5.0,
  },
  {
    id: "review_2",
    date: "2024-12-03",
    name: "James",
    body: {
      en: "Unlocked the whole new branch from tier 1 to 11. It took exactly one week as they said.",
      de: "Den kompletten neuen Forschungsbaum von Stufe 1 bis 11 freigespielt. Hat genau eine Woche gedauert, wie versprochen.",
    },
    stars: 5.0,
  },
  {
    id: "review_3",
    date: "2024-11-29",
    name: "Anonym",
    body: {
      en: "Needed to fix my stats on the Tier 10 heavy. Booster averaged 5200 damage. Insane...",
      de: "Musste meine Stats auf dem Stufe-10-Schweren aufbessern. Der Booster hat im Schnitt 5200 Schaden gemacht. Wahnsinn...",
    },
    stars: 5.0,
  },
  {
    id: "review_4",
    date: "2025-01-04",
    name: "Tank_God_77",
    body: {
      en: "My WN8 was low, but the driver played at 4800 WN8 for 200 battles. Stats rose before my eyes",
      de: "Mein WN8 war niedrig, aber der Booster hat über 200 Gefechte mit 4800 WN8 gespielt. Die Stats sind vor meinen Augen gestiegen",
    },
    stars: 5.0,
  },
  {
    id: "review_5",
    date: "2024-12-15",
    name: "Anonym",
    body: {
      en: "Standard credit farming. Driver got 20kk just in few days. As bonus he raised my stats, lol.",
      de: "Standard-Credit-Farming. Der Booster hat 20kk in nur wenigen Tagen geholt. Als Bonus hat er noch meine Stats verbessert, lol.",
    },
    stars: 4.8,
  },
  {
    id: "review_6",
    date: "2024-11-18",
    name: "Daniel",
    body: {
      en: "Good winrate boost. Ordered 50 battles, he won 37 of them. Over 70% winrate.",
      de: "Guter Winrate-Boost. 50 Gefechte bestellt, 37 davon gewonnen. Über 70 % Siegrate.",
    },
    stars: 4.7,
  },
  {
    id: "review_7",
    date: "2024-12-20",
    name: "Anonym",
    body: {
      en: "Farmed 60 million credits via Front Line. Finished in 5 days. Efficient.",
      de: "60 Millionen Credits über Front Line gefarmt. In 5 Tagen fertig. Effizient.",
    },
    stars: 5.0,
  },
  {
    id: "review_8",
    date: "2024-12-10",
    name: "Eric",
    body: {
      en: "Driver did 4k WN8. Started two days later we agreed... but in general it was good",
      de: "Der Booster hat 4k WN8 gemacht. Hat zwei Tage später angefangen als vereinbart... aber insgesamt war es gut",
    },
    stars: 4.0,
  },
  {
    id: "review_9",
    date: "2025-01-02",
    name: "Anonym",
    body: {
      en: "Tier 11 damage boost. The numbers are crazy, almost 5500 average. Recommended.",
      de: "Schadens-Boost auf Stufe 11. Die Zahlen sind verrückt, fast 5500 im Schnitt. Empfehlenswert.",
    },
    stars: 5.0,
  },
  {
    id: "review_10",
    date: "2024-11-25",
    name: "SteelWarrior",
    body: {
      en: "Full tech tree grind. Done in 6 days. Now I can play the top tier immediately.",
      de: "Kompletter Forschungsbaum-Grind. In 6 Tagen erledigt. Jetzt kann ich sofort die Top-Stufe spielen.",
    },
    stars: 4.9,
  },
  {
    id: "review_11",
    date: "2024-12-08",
    name: "Anonym",
    body: {
      en: "Cheap credit farm. Took a while to finish 50m because it's 5m daily cap, but reliable.",
      de: "Günstige Credit-Farm. Hat etwas gedauert, die 50 Mio. fertigzustellen wegen des 5-Mio.-Tageslimits, aber zuverlässig.",
    },
    stars: 4.0,
  },
  {
    id: "review_12",
    date: "2024-12-30",
    name: "Michael",
    body: {
      en: "Booster kept the winrate above 75% on tier 9. Solid performance.",
      de: "Der Booster hat die Siegrate auf Stufe 9 über 75 % gehalten. Solide Leistung.",
    },
    stars: 5.0,
  },
  {
    id: "review_13",
    date: "2024-11-27",
    name: "Anonym",
    body: {
      en: "Asked for 4k+ WN8 on my medium tank. Driver delivered 4500. Happy with the result.",
      de: "Habe 4k+ WN8 auf meinem mittleren Panzer angefragt. Der Booster hat 4500 geliefert. Bin zufrieden mit dem Ergebnis.",
    },
    stars: 4.8,
  },
  {
    id: "review_14",
    date: "2024-12-22",
    name: "Chris",
    body: {
      en: "Damage boost on Tier 10. Averaged 4700 dmg. Good communication with the driver.",
      de: "Schadens-Boost auf Stufe 10. Im Schnitt 4700 Schaden. Gute Kommunikation mit dem Booster.",
    },
    stars: 5.0,
  },
  {
    id: "review_15",
    date: "2024-12-05",
    name: "Anonym",
    body: {
      en: "Front Line farming is the best option here. 80m credits in week is huge.",
      de: "Front-Line-Farming ist hier die beste Option. 80 Mio. Credits in einer Woche sind enorm.",
    },
    stars: 4.0,
  },
];

// Honest aggregate derived from the reviews actually displayed on-page
// (not the marketing "4.9/5000" figures) — keeps the AggregateRating schema
// defensible under Google's review-snippet policy.
export const reviewStats = {
  count: reviews.length,
  average:
    Math.round(
      (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length) * 10,
    ) / 10,
};
