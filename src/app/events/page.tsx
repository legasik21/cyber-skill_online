"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar, Trophy, ArrowLeft, Clock, Gift } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { ACCENTS, ACTIVE_EVENTS, UPCOMING_EVENTS, PAST_EVENTS, type FeatureEvent, type PastEvent } from "@/lib/events"

function FeatureEventCard({ ev }: { ev: FeatureEvent }) {
  const a = ACCENTS[ev.accent]
  return (
    <div className="mb-8">
      <Card className={`border-2 ${a.border} bg-gradient-to-br ${a.grad} to-card overflow-hidden`}>
        <div className="relative">
          <div className={`absolute top-0 right-0 ${a.badge} text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10`}>
            {ev.badge}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl mb-2 pr-28">{ev.emoji} {ev.title}</CardTitle>
            <CardDescription className="text-lg">{ev.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-semibold mb-3 ${a.text}`}>Event Details</h4>
                <ul className="space-y-2 text-sm">
                  {ev.details.map((d, i) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2">{d.icon}</span>
                      <span>{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={`font-semibold mb-3 ${a.text}`}>{ev.boostTitle}</h4>
                <div className="space-y-3">
                  {ev.offers.map((o, i) => (
                    <div key={i} className="bg-card/50 p-3 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{o.label}</span>
                        <span className={`${a.text} font-bold`}>{o.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{o.note}</p>
                    </div>
                  ))}
                  <Link href={ev.ctaHref}>
                    <Button className={`w-full mt-2 ${a.btn}`} size="lg">
                      {ev.ctaLabel}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

function PastEventCard({ ev }: { ev: PastEvent }) {
  return (
    <Card className="border-border/50 bg-card/50 opacity-75">
      <CardHeader>
        <div className="text-sm text-muted-foreground mb-2 font-semibold">PAST EVENT</div>
        <CardTitle className="text-xl">{ev.emoji} {ev.title}</CardTitle>
        <CardDescription>{ev.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ended:</span>
            <span className="font-medium">{ev.ended}</span>
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
  )
}

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
                Track what&apos;s live, what&apos;s coming, and what just wrapped. Get professional boosting for every limited-time mode, season and special event.
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

              {ACTIVE_EVENTS.length > 0 ? (
                ACTIVE_EVENTS.map((ev) => <FeatureEventCard key={ev.title} ev={ev} />)
              ) : (
                <p className="text-center text-muted-foreground">No events are running right now — check back soon for the next season.</p>
              )}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
                <p className="text-muted-foreground text-lg">Announced and on the horizon — get a head start</p>
              </div>

              {UPCOMING_EVENTS.length > 0 ? (
                UPCOMING_EVENTS.map((ev) => <FeatureEventCard key={ev.title} ev={ev} />)
              ) : (
                <p className="text-center text-muted-foreground">No upcoming events announced yet. We&apos;ll add them here the moment Wargaming reveals what&apos;s next.</p>
              )}
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
                {PAST_EVENTS.map((ev) => <PastEventCard key={ev.title} ev={ev} />)}
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
                  <h3 className="text-xl font-semibold mb-2">Don&apos;t Miss Out</h3>
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
                    We&apos;ll help you unlock all available rewards, including rare premium tanks and exclusive customizations.
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
