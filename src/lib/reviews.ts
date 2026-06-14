export type Review = {
  id: string;
  date: string;
  name: string;
  review: string;
  stars: number;
};

// Single source of truth for customer reviews. Consumed by the on-page
// ReviewsSlider and by the homepage Review/AggregateRating JSON-LD so the
// structured data always matches what is actually shown to users.
export const reviews: Review[] = [
  { id: "review_1", date: "2024-11-22", name: "Anonym", review: "Ordered Front Line farm. The driver actually hit 100 million credits in 10 days. 100kk... THX!!!.", stars: 5.0 },
  { id: "review_2", date: "2024-12-03", name: "James", review: "Unlocked the whole new branch from tier 1 to 11. It took exactly one week as they said.", stars: 5.0 },
  { id: "review_3", date: "2024-11-29", name: "Anonym", review: "Needed to fix my stats on the Tier 10 heavy. Booster averaged 5200 damage. Insane...", stars: 5.0 },
  { id: "review_4", date: "2025-01-04", name: "Tank_God_77", review: "My WN8 was low, but the driver played at 4800 WN8 for 200 battles. Stats rose before my eyes", stars: 5.0 },
  { id: "review_5", date: "2024-12-15", name: "Anonym", review: "Standard credit farming. Driver got 20kk just in few days. As bonus he raised my stats, lol.", stars: 4.8 },
  { id: "review_6", date: "2024-11-18", name: "Daniel", review: "Good winrate boost. Ordered 50 battles, he won 37 of them. Over 70% winrate.", stars: 4.7 },
  { id: "review_7", date: "2024-12-20", name: "Anonym", review: "Farmed 60 million credits via Front Line. Finished in 5 days. Efficient.", stars: 5.0 },
  { id: "review_8", date: "2024-12-10", name: "Eric", review: "Driver did 4k WN8. Started two days later we agreed... but in general it was good", stars: 4.0 },
  { id: "review_9", date: "2025-01-02", name: "Anonym", review: "Tier 11 damage boost. The numbers are crazy, almost 5500 average. Recommended.", stars: 5.0 },
  { id: "review_10", date: "2024-11-25", name: "SteelWarrior", review: "Full tech tree grind. Done in 6 days. Now I can play the top tier immediately.", stars: 4.9 },
  { id: "review_11", date: "2024-12-08", name: "Anonym", review: "Cheap credit farm. Took a while to finish 50m because it's 5m daily cap, but reliable.", stars: 4.0 },
  { id: "review_12", date: "2024-12-30", name: "Michael", review: "Booster kept the winrate above 75% on tier 9. Solid performance.", stars: 5.0 },
  { id: "review_13", date: "2024-11-27", name: "Anonym", review: "Asked for 4k+ WN8 on my medium tank. Driver delivered 4500. Happy with the result.", stars: 4.8 },
  { id: "review_14", date: "2024-12-22", name: "Chris", review: "Damage boost on Tier 10. Averaged 4700 dmg. Good communication with the driver.", stars: 5.0 },
  { id: "review_15", date: "2024-12-05", name: "Anonym", review: "Front Line farming is the best option here. 80m credits in week is huge.", stars: 4.0 },
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
