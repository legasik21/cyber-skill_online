
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star, ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import { cn } from "@/lib/utils";

const rawReviews = {
  "review_1": {
    "date": "2024-11-22",
    "name": "Anonym",
    "review": "Ordered Front Line farm. The driver actually hit 100 million credits in 10 days. 100kk... THX!!!.",
    "stars": 5.0
  },
  "review_2": {
    "date": "2024-12-03",
    "name": "James",
    "review": "Unlocked the whole new branch from tier 1 to 11. It took exactly one week as they said.",
    "stars": 5.0
  },
  "review_3": {
    "date": "2024-11-29",
    "name": "Anonym",
    "review": "Needed to fix my stats on the Tier 10 heavy. Booster averaged 5200 damage. Insane...",
    "stars": 5.0
  },
  "review_4": {
    "date": "2025-01-04",
    "name": "Tank_God_77",
    "review": "My WN8 was low, but the driver played at 4800 WN8 for 200 battles. Stats rose before my eyes",
    "stars": 5.0
  },
  "review_5": {
    "date": "2024-12-15",
    "name": "Anonym",
    "review": "Standard credit farming. Driver got 20kk just in few days. As bonus he raised my stats, lol.",
    "stars": 4.8
  },
  "review_6": {
    "date": "2024-11-18",
    "name": "Daniel",
    "review": "Good winrate boost. Ordered 50 battles, he won 37 of them. Over 70% winrate.",
    "stars": 4.7
  },
  "review_7": {
    "date": "2024-12-20",
    "name": "Anonym",
    "review": "Farmed 60 million credits via Front Line. Finished in 5 days. Efficient.",
    "stars": 5.0
  },
  "review_8": {
    "date": "2024-12-10",
    "name": "Eric",
    "review": "Driver did 4k WN8. Started two days later we agreed... but in general it was good",
    "stars": 4.0
  },
  "review_9": {
    "date": "2025-01-02",
    "name": "Anonym",
    "review": "Tier 11 damage boost. The numbers are crazy, almost 5500 average. Recommended.",
    "stars": 5.0
  },
  "review_10": {
    "date": "2024-11-25",
    "name": "SteelWarrior",
    "review": "Full tech tree grind. Done in 6 days. Now I can play the top tier immediately.",
    "stars": 4.9
  },
  "review_11": {
    "date": "2024-12-08",
    "name": "Anonym",
    "review": "Cheap credit farm. Took a while to finish 50m because it's 5m daily cap, but reliable.",
    "stars": 4.0
  },
  "review_12": {
    "date": "2024-12-30",
    "name": "Michael",
    "review": "Booster kept the winrate above 75% on tier 9. Solid performance.",
    "stars": 5.0
  },
  "review_13": {
    "date": "2024-11-27",
    "name": "Anonym",
    "review": "Asked for 4k+ WN8 on my medium tank. Driver delivered 4500. Happy with the result.",
    "stars": 4.8
  },
  "review_14": {
    "date": "2024-12-22",
    "name": "Chris",
    "review": "Damage boost on Tier 10. Averaged 4700 dmg. Good communication with the driver.",
    "stars": 5.0
  },
  "review_15": {
    "date": "2024-12-05",
    "name": "Anonym",
    "review": "Front Line farming is the best option here. 80m credits in week is huge.",
    "stars": 4.0
  }
};

const reviews = Object.entries(rawReviews).map(([key, value]) => ({
  id: key,
  ...value
}));

interface ReviewCardProps {
  review: typeof reviews[0];
}

function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Truncate at ~120 chars which roughly corresponds to 4 lines
  const CHAR_LIMIT = 120;
  const shouldTruncate = review.review.length > CHAR_LIMIT;
  
  return (
    <Card className="h-full border-border/50 bg-card/50 flex flex-col snap-center min-w-[300px] md:min-w-[350px] mx-2 transition-all hover:bg-card hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                 <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">{review.name}</div>
                <div className="text-xs text-muted-foreground">{review.date}</div>
              </div>
           </div>
           <div className="flex items-center bg-primary/5 px-2 py-1 rounded-full">
               <Star className="h-3 w-3 fill-primary text-primary mr-1" />
               <span className="text-sm font-bold">{review.stars}</span>
           </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="relative">
           <Quote className="h-6 w-6 text-primary/20 absolute -top-2 -left-1 transform -scale-x-100" />
           <p className={cn(
             "text-sm text-muted-foreground pt-4 px-2 italic leading-relaxed min-h-[5rem]",
             !isExpanded && shouldTruncate && "line-clamp-4"
           )}>
             "{review.review}"
           </p>
        </div>
        
        {shouldTruncate && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary font-semibold mt-3 self-start hover:underline"
          >
            {isExpanded ? "Show less" : "Read more..."}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // buffer
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350; // card width + margin
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Allow scroll animation to finish before checking
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative group">
       {/* Controls */}
       <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 hidden md:block">
          <Button
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg disabled:opacity-50"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
       </div>
       
       <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 hidden md:block">
          <Button
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg disabled:opacity-50"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
       </div>

       {/* Slider */}
       <div 
         ref={scrollRef}
         className="flex overflow-x-auto snap-x snap-mandatory py-4 px-2 no-scrollbar gap-4 mask-fade-sides"
         onScroll={checkScroll}
         style={{
           scrollbarWidth: 'none',  /* Firefox */
           msOverflowStyle: 'none',  /* IE and Edge */
         }}
       >
         {reviews.map((review) => (
           <ReviewCard key={review.id} review={review} />
         ))}
       </div>
       
       {/* Mobile Scroll Hint */}
       <div className="md:hidden flex justify-center mt-4 gap-2">
         {/* Simple indicators */}
         <div className="text-xs text-muted-foreground animate-pulse">
           Swipe to see more &rarr;
         </div>
       </div>
    </div>
  );
}
