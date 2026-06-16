"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Gamepad2, ArrowLeft, Zap, Trophy, ChevronRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function ArcadeCabinetPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">

        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="h-10 w-10 text-amber-400" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Arcade Cabinet: Equalize!
                </h1>
              </div>

              {/* Limited Event Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕹️</span>
                  <span className="text-amber-400 font-bold">Live now · June 12 – 21, 2026 — ends June 21</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A limited-time special battle mode. Once it&apos;s gone, the equalized credits, bonds and Free XP go with it — don&apos;t wait until the last day.
                </p>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                Arcade Cabinet: Equalize! drops every tank into equalized all-tier arcade battles, balancing vehicles across Tiers I–X so skill decides the match. Each fight rains down credits, bonds, Battle Pass Points, Free XP and WoT Premium Account time — and our boosters can farm it all for you before the cabinet powers down.
              </p>
              <Button asChild size="lg" className="text-lg px-8 bg-amber-600 hover:bg-amber-700">
                <Link href="/services/credit-farm">
                  <Zap className="mr-2 h-5 w-5" />
                  Farm the Rewards
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Rewards + Boost Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">

              {/* Left Column - Event Rewards */}
              <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-card">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-2xl">Event Rewards</CardTitle>
                  </div>
                  <CardDescription>What the Arcade Cabinet pays out</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">📅</span>
                      <span>Duration: June 12 – 21, 2026 — a short window, ends June 21.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">⚔️</span>
                      <span>Equalized all-tier battles — every tank balanced across Tiers I–X.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🏆</span>
                      <span>Up to 350K credits &amp; ~5,250 bonds across the event.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎟️</span>
                      <span>Battle Pass Points, Free XP &amp; WoT Premium Account time.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Right Column - Boost Services */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-2xl">Boost Services</CardTitle>
                  </div>
                  <CardDescription>The closest boosts to grab every reward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* Credit & Bonds Farming */}
                  <div>
                    <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Credit &amp; Bonds Farming</span>
                        <span className="text-amber-400 font-bold">From $4.5/M credits · $7 / 100 bonds</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Cash in the equalized battles for credits and bonds without the grind.</p>
                    </div>
                    <Button asChild className="w-full mt-2 bg-amber-600 hover:bg-amber-700">
                      <Link href="/services/credit-farm">Order Credit &amp; Bonds Farm</Link>
                    </Button>
                  </div>

                  {/* Exp Farm */}
                  <div>
                    <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Exp Farm</span>
                        <span className="text-amber-400 font-bold">From $3</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Convert the event&apos;s Free XP into unlocked modules and new tanks.</p>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link href="/services/exp-farm">Order Exp Farm</Link>
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Why Boost This Event */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Why Boost This Event</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Limited Window</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      The cabinet only runs June 12 – 21. Once June 21 passes, the equalized rewards are gone for good.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Max Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      We push for the full haul — up to 350K credits, ~5,250 bonds, Battle Pass Points and Free XP.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Equalized Pros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Our players know the equalized all-tier meta and farm the cabinet efficiently on your account.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
