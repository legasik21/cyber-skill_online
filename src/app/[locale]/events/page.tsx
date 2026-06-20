"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar, Trophy, ArrowLeft, Clock, Gift } from "lucide-react"
import type { ComponentType } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { ACCENTS, useEvents, type FeatureEvent, type PastEvent } from "@/lib/events"

function FeatureEventCard({ ev }: { ev: FeatureEvent }) {
  const t = useTranslations("events.card")
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
                <h4 className={`font-semibold mb-3 ${a.text}`}>{t("eventDetails")}</h4>
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
  const t = useTranslations("events.card")
  return (
    <Card className="border-border/50 bg-card/50 opacity-75">
      <CardHeader>
        <div className="text-sm text-muted-foreground mb-2 font-semibold">{t("badgePast")}</div>
        <CardTitle className="text-xl">{ev.emoji} {ev.title}</CardTitle>
        <CardDescription>{ev.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("ended")}</span>
            <span className="font-medium">{ev.ended}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("status")}</span>
            <span className="font-medium text-muted-foreground">{t("completed")}</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" disabled>
          {t("eventEnded")}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function EventsPage() {
  const t = useTranslations("events")
  const { active, upcoming, past } = useEvents()
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
                {t("backToHome")}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Active Events Section */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("active.heading")}</h2>
                <p className="text-muted-foreground text-lg">{t("active.subheading")}</p>
              </div>

              {active.length > 0 ? (
                active.map((ev, i) => <FeatureEventCard key={i} ev={ev} />)
              ) : (
                <p className="text-center text-muted-foreground">{t("active.empty")}</p>
              )}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("upcoming.heading")}</h2>
                <p className="text-muted-foreground text-lg">{t("upcoming.subheading")}</p>
              </div>

              {upcoming.length > 0 ? (
                upcoming.map((ev, i) => <FeatureEventCard key={i} ev={ev} />)
              ) : (
                <p className="text-center text-muted-foreground">{t("upcoming.empty")}</p>
              )}
            </div>
          </div>
        </section>

        {/* Past Events Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("past.heading")}</h2>
                <p className="text-muted-foreground text-lg">{t("past.subheading")}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((ev, i) => <PastEventCard key={i} ev={ev} />)}
              </div>
            </div>
          </div>
        </section>

        {/* Why Boost With Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("why.heading")}</h2>
                <p className="text-muted-foreground text-lg">{t("why.subheading")}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {(t.raw("why.items") as { title: string; desc: string }[]).map((item, i) => {
                  const icons: ComponentType<{ className?: string }>[] = [Clock, Trophy, Gift]
                  const Icon = icons[i] ?? Clock
                  return (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  )
                })}
              </div>

              <div className="text-center mt-12">
                <Link href="/#contact">
                  <Button size="lg" className="text-lg px-8">
                    {t("why.cta")}
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
