"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Gift, Users, DollarSign, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ReferralProgramPage() {
  const t = useTranslations("referral")
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">

        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-6">
                <Gift className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {t("hero.title")}
              </h1>
              <p className="text-xl text-primary font-semibold mb-4">
                {t("hero.subtitle")}
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("hero.description")}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Benefits */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">{t("benefits.unlock")}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">{t("benefits.minOrder")}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">{t("benefits.cover")}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">{t("benefits.noLimit")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-primary">
                {t("benefits.cta")}
              </p>
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("terms.heading")}</h2>

              <div className="space-y-8">
                {/* 1. Eligibility */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      {t("terms.eligibility.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>{t("terms.eligibility.p1")}</p>
                    <p>{t("terms.eligibility.p2")}</p>
                  </CardContent>
                </Card>

                {/* 2. Referral Conditions */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      {t("terms.conditions.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>{t("terms.conditions.p1")}</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("terms.conditions.item1")}</li>
                      <li>{t("terms.conditions.item2")}</li>
                    </ul>
                    <p>{t("terms.conditions.p2")}</p>
                  </CardContent>
                </Card>

                {/* 3. Referral Rewards */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      {t("terms.rewards.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-500" />
                        {t("terms.rewards.friendTitle")}
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{t("terms.rewards.friendItem1")}</li>
                        <li>{t("terms.rewards.friendItem2")}</li>
                      </ul>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        {t("terms.rewards.referrerTitle")}
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{t("terms.rewards.referrerItem1")}</li>
                        <li>{t("terms.rewards.referrerItem2")}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Bonus Usage Rules */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      {t("terms.usage.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>{t("terms.usage.p1")}</p>
                    <p>{t("terms.usage.p2")}</p>
                    <p>{t("terms.usage.p3")}</p>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-3">{t("terms.usage.examplesTitle")}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{t("terms.usage.example1Order")}</span>
                          <span className="text-primary font-medium">{t("terms.usage.example1Discount")}</span>
                          <span className="text-green-500 font-bold">{t("terms.usage.example1Pay")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{t("terms.usage.example2Order")}</span>
                          <span className="text-primary font-medium">{t("terms.usage.example2Discount")}</span>
                          <span className="text-green-500 font-bold">{t("terms.usage.example2Pay")}</span>
                        </div>
                      </div>
                    </div>
                    <p>{t("terms.usage.p4")}</p>
                  </CardContent>
                </Card>

                {/* 5. Limitations & Fair Use */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      {t("terms.limitations.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>{t("terms.limitations.p1")}</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{t("terms.limitations.p2")}</p>
                      </div>
                    </div>
                    <p>{t("terms.limitations.p3")}</p>
                  </CardContent>
                </Card>

                {/* 6. Program Changes */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                      {t("terms.changes.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>{t("terms.changes.p1")}</p>
                    <p>{t("terms.changes.p2")}</p>
                  </CardContent>
                </Card>

                {/* 7. Support */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                      {t("terms.support.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <p>{t("terms.support.p1")}</p>
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
