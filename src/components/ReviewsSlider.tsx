
"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star, ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviews, type Locale } from "@/lib/reviews";

interface ReviewCardProps {
  review: typeof reviews[0];
}

function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("reviews");
  const locale = useLocale() as Locale;
  const body = review.body[locale] ?? review.body.en;

  // Truncate at ~120 chars which roughly corresponds to 4 lines
  const CHAR_LIMIT = 120;
  const shouldTruncate = body.length > CHAR_LIMIT;

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
             &ldquo;{body}&rdquo;
           </p>
        </div>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary font-semibold mt-3 self-start hover:underline"
          >
            {isExpanded ? t("showLess") : t("readMore")}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsSlider() {
  const t = useTranslations("reviews");
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
           {t("swipeHint")}
         </div>
       </div>
    </div>
  );
}
