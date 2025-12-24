"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar, Trophy, Zap, ArrowLeft, Clock, Gift } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function EventsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  World of Tanks Events
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Stay updated with current and upcoming events. Get professional boosting services for limited-time game modes and special events.
              </p>
            </div>
          </div>
        </section>

        {/* Active Events Section */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Active Events</h2>
                <p className="text-muted-foreground text-lg">Events currently running in-game</p>
              </div>

              {/* Featured Event - Holiday Ops 2026 */}
              <div className="mb-8">
                <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                      ACTIVE NOW
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-3xl mb-2">� Holiday Ops 2026</CardTitle>
                          <CardDescription className="text-lg">
                            Festive bonuses and special rewards! Celebrate the holidays with exclusive content.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-primary">Event Details</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <span className="mr-2">📅</span>
                              <span>Duration: 5 Dec - 12 Jan</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">🏆</span>
                              <span>Rewards: Premium Tanks, Credits, Decorations</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">🎁</span>
                              <span>Type: Seasonal Collection Event</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">⭐</span>
                              <span>Special: Holiday Styles & Crew</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-primary">Boost Services Available</h4>
                          <div className="space-y-3">
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Full Completion</span>
                                <span className="text-primary font-bold">$80+</span>
                              </div>
                              <p className="text-xs text-muted-foreground">All decorations and rewards unlocked</p>
                            </div>
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Premium Tank Unlock</span>
                                <span className="text-primary font-bold">Custom</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Get exclusive Holiday tanks</p>
                            </div>
                            <Button className="w-full mt-2" size="lg">
                              Order Holiday Ops Boost
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>

              {/* Battle Pass Event */}
              <div className="mb-8">
                <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                      ACTIVE NOW
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-3xl mb-2">🎖️ Battle Pass: Holiday Havoc</CardTitle>
                          <CardDescription className="text-lg">
                            Complete challenges and unlock exclusive Battle Pass rewards this season.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-primary">Event Details</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <span className="mr-2">📅</span>
                              <span>Duration: 19 Dec - 12 Jan</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">🏆</span>
                              <span>Rewards: Tanks, Styles, Bonds, Credits</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">⚡</span>
                              <span>Levels: 50 Progressive Stages</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">⭐</span>
                              <span>Premium: Enhanced Rewards Track</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-primary">Boost Services Available</h4>
                          <div className="space-y-3">
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Level Boost</span>
                                <span className="text-primary font-bold">$2.5/lvl</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Fast progression with discounts</p>
                            </div>
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Full Pass (50 levels)</span>
                                <span className="text-primary font-bold">$250+</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Complete all stages with discounts</p>
                            </div>
                            <Link href="/services/battle-pass">
                              <Button className="w-full mt-2" size="lg">
                                Order Battle Pass Boost
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>



        {/* Past Events Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Past Events</h2>
                <p className="text-muted-foreground text-lg">Archive of previous events</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-border/50 bg-card/50 opacity-75">
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2 font-semibold">PAST EVENT</div>
                    <CardTitle className="text-xl">🎯 Frontline Event</CardTitle>
                    <CardDescription>Epic 30v30 battles with exclusive rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ended:</span>
                        <span className="font-medium">Dec 15, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-muted-foreground">Completed</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Event Ended
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 opacity-75">
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2 font-semibold">PAST EVENT</div>
                    <CardTitle className="text-xl">🔥 Black Market</CardTitle>
                    <CardDescription>Rare tanks for gold and credits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ended:</span>
                        <span className="font-medium">Nov 15, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-muted-foreground">Completed</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Event Ended
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 opacity-75">
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2 font-semibold">PAST EVENT</div>
                    <CardTitle className="text-xl">🎃 Halloween Event</CardTitle>
                    <CardDescription>Spooky battles and exclusive rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ended:</span>
                        <span className="font-medium">Nov 3, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-muted-foreground">Completed</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Event Ended
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 opacity-75">
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2 font-semibold">PAST EVENT</div>
                    <CardTitle className="text-xl">⚔️ Waffenträger</CardTitle>
                    <CardDescription>Hunt the legendary tank destroyer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ended:</span>
                        <span className="font-medium">Oct 15, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-muted-foreground">Completed</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Event Ended
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Boost With Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Our Event Boosting?</h2>
                <p className="text-muted-foreground text-lg">Professional help for limited-time events</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Don't Miss Out</h3>
                  <p className="text-muted-foreground">
                    Limited-time events have exclusive rewards. Our boosters ensure you get everything before the event ends.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert Players</h3>
                  <p className="text-muted-foreground">
                    Our team has extensive experience with all World of Tanks events and knows the most efficient strategies.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">All Rewards</h3>
                  <p className="text-muted-foreground">
                    We'll help you unlock all available rewards, including rare premium tanks and exclusive customizations.
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <Link href="/#contact">
                  <Button size="lg" className="text-lg px-8">
                    Get Started with Event Boosting
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
