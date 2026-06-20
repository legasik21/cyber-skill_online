"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Shield, Target, Zap, Trophy, ChevronRight, Star, ChevronsUp, BookOpen, Swords, Medal, Users, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroBackground from "@/components/HeroBackground"
import HeroVideoBackground from "@/components/HeroVideoBackground"
import { useRouter } from "@/i18n/navigation"
import ReviewsSlider from "@/components/ReviewsSlider"
import { JsonLd } from "@/components/JsonLd"
import { boostingReviewsJsonLd } from "@/lib/seo"
import { ACCENTS, useEvents, type FeatureEvent, type PastEvent } from "@/lib/events"
import { useLocale } from "next-intl"
import type { Locale } from "@/i18n/routing"

// Homepage "Current Events" cards — same event data as /events (single source of
// truth in @/lib/events), rendered in the homepage's compact side-by-side style.
function HomeEventCard({ ev }: { ev: FeatureEvent }) {
  const t = useTranslations("events.card")
  const a = ACCENTS[ev.accent]
  const offer = ev.offers[0]
  return (
    <Card className={`h-full border-2 ${a.border} bg-gradient-to-br ${a.grad} to-card overflow-hidden flex flex-col`}>
      <div className="relative flex-grow">
        <div className={`absolute top-0 right-0 ${a.badge} text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10`}>
          {ev.badge}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2 pr-24">{ev.emoji} {ev.title}</CardTitle>
              <CardDescription>{ev.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className={`font-semibold mb-3 ${a.text}`}>{t("eventDetails")}</h4>
              <ul className="space-y-2 text-sm">
                {ev.details.slice(0, 3).map((d, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2">{d.icon}</span>
                    <span>{d.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${a.text}`}>{t("boostServices")}</h4>
              <div className="space-y-3">
                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{offer.label}</span>
                    <span className={`${a.text} font-bold`}>{offer.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{offer.note}</p>
                </div>
                <Button className={`w-full mt-2 ${a.btn}`} size="lg" asChild>
                  <Link href={ev.ctaHref}>{ev.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function HomePastCard({ ev }: { ev: PastEvent }) {
  const t = useTranslations("events.card")
  return (
    <Card className="border-border/50 bg-card/50 opacity-75">
      <CardHeader>
        <div className="text-sm text-muted-foreground mb-2">{t("badgePast")}</div>
        <CardTitle className="text-xl">{ev.emoji} {ev.title}</CardTitle>
        <CardDescription>{ev.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("ended")}</span>
            <span className="font-medium">{ev.ended}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("status")}</span>
            <span className="font-medium text-muted-foreground">{t("completed")}</span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" disabled>
          {t("eventEnded")}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const t = useTranslations("home")
  const tn = useTranslations("serviceNav")
  const locale = useLocale() as Locale
  const router = useRouter()
  const { active, past } = useEvents()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("contact.errors.email") }),
        discordTag: z.string().min(3, { message: t("contact.errors.discord") }),
        service: z.string().min(1, { message: t("contact.errors.service") }),
        message: z.string().optional(),
      }),
    [t],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      service: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          page: 'Home Page - Contact Form',
        }),
      })

      const data = await response.json()

      if (data.redirect) {
        router.push(data.redirect)
      } else if (data.success) {
        router.push('/order/success')
      } else {
        router.push('/order/error')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      router.push('/order/error?reason=server')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Service ids/links stay stable; titles come from serviceNav, copy from home.
  const services = [
    { navKey: "wn8Boost", descKey: "wn8", icon: <Target className="h-10 w-10 text-primary" />, link: "/services/wn8-boost" },
    { navKey: "creditFarm", descKey: "credits", icon: <Zap className="h-10 w-10 text-primary" />, link: "/services/credit-farm" },
    { navKey: "campaign", descKey: "campaign", icon: <Trophy className="h-10 w-10 text-primary" />, link: "/services/campaign-missions" },
    { navKey: "moe", descKey: "moe", icon: <Star className="h-10 w-10 text-primary" />, link: "/services/mark-of-excellence" },
    { navKey: "onslaught", descKey: "onslaught", icon: <Swords className="h-10 w-10 text-primary" />, link: "/services/onslaught" },
    { navKey: "tierLeveling", descKey: "tierLeveling", icon: <ChevronsUp className="h-10 w-10 text-primary" />, link: "/services/tier-leveling" },
    { navKey: "expFarm", descKey: "expFarm", icon: <BookOpen className="h-10 w-10 text-primary" />, link: "/services/exp-farm" },
    { navKey: "aceTanker", descKey: "aceTanker", icon: <Medal className="h-10 w-10 text-primary" />, link: "/services/ace-tanker" },
    { navKey: "battlePass", descKey: "battlePass", icon: <Trophy className="h-10 w-10 text-primary" />, link: "/services/battle-pass" },
    { navKey: "referralProgram", descKey: "referral", icon: <Users className="h-10 w-10 text-primary" />, link: "/services/referral-program" },
  ]

  const serviceOptions = [
    { value: "wn8", navKey: "wn8Boost" },
    { value: "credits", navKey: "creditFarm" },
    { value: "campaign", navKey: "campaign" },
    { value: "moe", navKey: "moe" },
    { value: "tier-leveling", navKey: "tierLeveling" },
    { value: "exp-farm", navKey: "expFarm" },
    { value: "onslaught", navKey: "onslaught" },
    { value: "ace-tanker", navKey: "aceTanker" },
    { value: "battle-pass", navKey: "battlePass" },
    { value: "referral", navKey: "referralProgram" },
  ]

  return (
    <>
      <JsonLd data={boostingReviewsJsonLd(locale)} />
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-[136px] md:pt-28">

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <HeroVideoBackground />
        {/* Animated Background */}
        <HeroBackground />

        {/* Darkening overlay for text readability — sits above the video/grid/orbs
            (z-0) and below the hero content (z-10) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-[#0a0a0b]/70 via-[#0a0a0b]/40 to-[#0a0a0b]"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                {t("hero.titlePrefix")} <span className="text-primary">CyberSkill</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              {t("hero.subtitle")}
            </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
              >
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto" asChild>
                  <Link href="/#services">
                    {t("hero.ourServices")} <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 w-full sm:w-auto"
                  onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-chat-widget'))}
                >
                  {t("hero.chatAssistant")}
                </Button>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Current Events Section */}
      <section id="events" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("eventsSection.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("eventsSection.subheading")}</p>
          </div>

          {/* Two Featured Events Side-by-Side — data from @/lib/events */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {active.slice(0, 2).map((ev, i) => (
              <HomeEventCard key={i} ev={ev} />
            ))}
          </div>

          {/* Recently Ended */}
          <div className="grid md:grid-cols-2 gap-6">
            {past.slice(0, 2).map((ev, i) => (
              <HomePastCard key={i} ev={ev} />
            ))}
          </div>

          {/* View all events */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/events">
                {t("eventsSection.viewAll")} <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("servicesSection.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("servicesSection.subheading")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.navKey} className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all group">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle>{tn(service.navKey)}</CardTitle>
                  <CardDescription>{t(`servicesSection.items.${service.descKey}.description`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-4">{t(`servicesSection.items.${service.descKey}.price`)}</div>
                  <Button
                    className="w-full"
                    variant="secondary"
                    asChild
                  >
                    <Link href={service.link}>
                      {t("servicesSection.learnMore")} <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section id="guarantee" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("guarantee.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("guarantee.subheading")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("guarantee.secure.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("guarantee.secure.body")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("guarantee.satisfaction.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("guarantee.satisfaction.body")}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center md:justify-start">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/guarantee">
                    {t("guarantee.readPolicy")}
                  </Link>
                </Button>
              </div>
            </div>

             {/* Visual/Features Grid */}
             <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Shield className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">{t("guarantee.cards.privacy.title")}</h4>
                 <p className="text-sm text-muted-foreground">{t("guarantee.cards.privacy.sub")}</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Zap className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">{t("guarantee.cards.refunds.title")}</h4>
                 <p className="text-sm text-muted-foreground">{t("guarantee.cards.refunds.sub")}</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Target className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">{t("guarantee.cards.result.title")}</h4>
                 <p className="text-sm text-muted-foreground">{t("guarantee.cards.result.sub")}</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Users className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">{t("guarantee.cards.support.title")}</h4>
                 <p className="text-sm text-muted-foreground">{t("guarantee.cards.support.sub")}</p>
              </Card>
            </div>
          </div>
        </div>

      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("reviewsSection.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("reviewsSection.subheading")}</p>
          </div>

          <div className="px-4">
             <ReviewsSlider />
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <p className="text-muted-foreground">{t("reviewsSection.stats.orders")}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                <p className="text-muted-foreground">{t("reviewsSection.stats.rating")}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">{t("reviewsSection.stats.support")}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">{t("reviewsSection.stats.secure")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-xl">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t("contact.heading")}</CardTitle>
              <CardDescription>{t("contact.subheading")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">{t("contact.emailLabel")}</label>
                  <Input
                    id="email"
                    placeholder={t("contact.emailPlaceholder")}
                    {...form.register("email")}
                    className="bg-background"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="discordTag" className="text-sm font-medium">{t("contact.discordLabel")}</label>
                  <Input
                    id="discordTag"
                    placeholder={t("contact.discordPlaceholder")}
                    {...form.register("discordTag")}
                    className="bg-background"
                  />
                  {form.formState.errors.discordTag && (
                    <p className="text-sm text-red-500">{form.formState.errors.discordTag.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="service" className="text-sm font-medium">{t("contact.serviceLabel")}</label>
                  <select
                    id="service"
                    {...form.register("service")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t("contact.selectService")}</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{tn(opt.navKey)}</option>
                    ))}
                  </select>
                  {form.formState.errors.service && (
                    <p className="text-sm text-red-500">{form.formState.errors.service.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">{t("contact.detailsLabel")}</label>
                  <textarea
                    id="message"
                    {...form.register("message")}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={t("contact.detailsPlaceholder")}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    t("contact.submit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      </div>
      <Footer />
    </>
  )
}
