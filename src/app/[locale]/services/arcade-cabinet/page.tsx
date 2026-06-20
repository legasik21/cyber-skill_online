"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Gamepad2, ArrowLeft, Zap, Trophy, ChevronRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function ArcadeCabinetPage() {
  const t = useTranslations("arcadeCabinet")
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
                {t("backToHome")}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="h-10 w-10 text-amber-400" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>

              {/* Limited Event Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕹️</span>
                  <span className="text-amber-400 font-bold">{t("hero.bannerStatus")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("hero.bannerNote")}
                </p>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {t("hero.intro")}
              </p>
              <Button asChild size="lg" className="text-lg px-8 bg-amber-600 hover:bg-amber-700">
                <Link href="/services/credit-farm">
                  <Zap className="mr-2 h-5 w-5" />
                  {t("hero.cta")}
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
                    <CardTitle className="text-2xl">{t("rewards.title")}</CardTitle>
                  </div>
                  <CardDescription>{t("rewards.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">📅</span>
                      <span>{t("rewards.duration")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">⚔️</span>
                      <span>{t("rewards.equalized")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🏆</span>
                      <span>{t("rewards.credits")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎟️</span>
                      <span>{t("rewards.extras")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Right Column - Boost Services */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-2xl">{t("boost.title")}</CardTitle>
                  </div>
                  <CardDescription>{t("boost.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* Credit & Bonds Farming */}
                  <div>
                    <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{t("boost.creditLabel")}</span>
                        <span className="text-amber-400 font-bold">{t("boost.creditPrice")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("boost.creditNote")}</p>
                    </div>
                    <Button asChild className="w-full mt-2 bg-amber-600 hover:bg-amber-700">
                      <Link href="/services/credit-farm">{t("boost.creditCta")}</Link>
                    </Button>
                  </div>

                  {/* Exp Farm */}
                  <div>
                    <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{t("boost.expLabel")}</span>
                        <span className="text-amber-400 font-bold">{t("boost.expPrice")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("boost.expNote")}</p>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link href="/services/exp-farm">{t("boost.expCta")}</Link>
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
              <h2 className="text-3xl font-bold mb-8 text-center">{t("why.heading")}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{t("why.limitedTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("why.limitedBody")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{t("why.payoutTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("why.payoutBody")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{t("why.prosTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("why.prosBody")}
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
