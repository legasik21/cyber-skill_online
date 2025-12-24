"use client"

import { motion } from "framer-motion"

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Dark Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-background/80 z-10" 
           style={{ background: 'radial-gradient(circle at center, transparent 0%, hsl(var(--background)) 100%)' }} 
      />

      {/* Animated Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ y: 0 }}
            animate={{ y: 64 }} // One grid unit (4rem = 64px)
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
            style={{
              backgroundImage: 'inherit',
              backgroundSize: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Floating Orbs / Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
    </div>
  )
}
