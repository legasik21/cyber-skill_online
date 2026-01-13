"use client";

import Link from "next/link";

export default function EventBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-900/95 via-orange-900/95 to-red-900/95 border-b border-red-500/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
          <span className="text-sm md:text-base font-semibold text-red-300">
            🐉 Season of the Crimson Dragon
          </span>
          <span className="hidden sm:inline text-xs md:text-sm text-muted-foreground">
            Jan 14 - Feb 22, 2026
          </span>
          <span className="bg-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-red-500/50">
            ACTIVE NOW
          </span>
          <Link 
            href="/services/onslaught" 
            className="text-xs md:text-sm text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors font-medium"
          >
            Read more...
          </Link>
        </div>
      </div>
    </div>
  );
}
