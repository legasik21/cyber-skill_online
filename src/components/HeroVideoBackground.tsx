"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

// navigator.connection is not in the standard TS lib; define a minimal interface
interface NetworkInformation {
  saveData?: boolean
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
}

export default function HeroVideoBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    // Runs only in the browser (client component + useEffect), so window/navigator exist.
    // Respect user / network preferences: keep the poster only, never fetch the video.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const conn = (navigator as NavigatorWithConnection).connection
    if (conn?.saveData === true) return
    if (
      conn?.effectiveType === "slow-2g" ||
      conn?.effectiveType === "2g" ||
      conn?.effectiveType === "3g"
    ) return

    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return

    let started = false
    let idleHandle: number | undefined
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    const beginPlayback = () => {
      // Attach the listener BEFORE load() so a synchronous canplay can't be missed.
      video.addEventListener(
        "canplay",
        () => {
          setVideoReady(true)
          video.play().catch(() => {})
        },
        { once: true }
      )
      video.preload = "auto"
      video.load()
    }

    const start = () => {
      if (started) return
      started = true
      // Defer the actual fetch until the browser is idle (after first paint).
      if (typeof requestIdleCallback !== "undefined") {
        idleHandle = requestIdleCallback(beginPlayback)
      } else {
        timeoutHandle = setTimeout(beginPlayback, 200)
      }
    }

    // The hero is above the fold, so this fires on the first tick; the observer
    // also handles the case where the hero starts off-screen.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(root)

    return () => {
      observer.disconnect()
      if (idleHandle !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Poster image — the intended LCP element */}
      <Image
        src="/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Video — loaded lazily via IntersectionObserver; cross-fades over poster */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.webp"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-bg.webm" type="video/webm" />
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
