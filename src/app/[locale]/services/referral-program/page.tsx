"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Users, Shield, ChevronRight, Check, ArrowLeft, Gift, Trophy, Zap, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { REFERRAL_PRICE, priceReferralProgram } from "@/lib/pricing/referral-program"

export default function ReferralProgramServicePage() {
  const t = useTranslations("referralProgram")
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const SERVICE_PRICE = priceReferralProgram().total

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        server: z.string().min(1, { message: t("errors.server") }),
        additionalInfo: z.string().optional(),
      }),
    [t],
  )

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      server: "",
      additionalInfo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'referral-program',
      message: values.additionalInfo,
      page: 'Referral Program Service',
      orderDetails: {
          server: values.server,
          price: `$${SERVICE_PRICE}`,
          totalPrice: `$${SERVICE_PRICE}`,
      },
    })
  }

  const rewards = [
    { icon: <Trophy className="h-6 w-6" />, title: t("rewards.items.tank.title"), description: t("rewards.items.tank.description") },
    { icon: <Gift className="h-6 w-6" />, title: t("rewards.items.bonus.title"), description: t("rewards.items.bonus.description") },
    { icon: <Zap className="h-6 w-6" />, title: t("rewards.items.fast.title"), description: t("rewards.items.fast.description") },
  ]

  const features = [
    t("rewards.features.recruit"),
    t("rewards.features.level"),
    t("rewards.features.choose"),
    t("rewards.features.bonds"),
    t("rewards.features.noSharing"),
    t("rewards.features.safe"),
  ]

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
                <Users className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t("hero.subtitle")}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-primary">${SERVICE_PRICE}</div>
                <span className="text-muted-foreground">{t("hero.fixedPrice")}</span>
              </div>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {t("hero.orderNow")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("howItWorks.heading")}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <CardTitle>{t("howItWorks.step1.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t("howItWorks.step1.description")}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <CardTitle>{t("howItWorks.step2.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t("howItWorks.step2.description")}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <CardTitle>{t("howItWorks.step3.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t("howItWorks.step3.description")}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("rewards.heading")}</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {rewards.map((reward, index) => (
                  <Card key={index} className="bg-card border-primary/20">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                        {reward.icon}
                      </div>
                      <CardTitle>{reward.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{reward.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Features List */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>{t("rewards.includesTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{t("order.title")}</CardTitle>
                  <CardDescription>{t("order.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">{t("order.emailLabel")}</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("order.emailPlaceholder")}
                        {...form.register("email")}
                        className="bg-background"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* Discord Tag */}
                    <div className="space-y-2">
                      <label htmlFor="discordTag" className="text-sm font-medium">{t("order.discordLabel")}</label>
                      <Input
                        id="discordTag"
                        placeholder={t("order.discordPlaceholder")}
                        {...form.register("discordTag")}
                        className="bg-background"
                      />
                      {form.formState.errors.discordTag && (
                        <p className="text-sm text-red-500">{form.formState.errors.discordTag.message}</p>
                      )}
                    </div>

                    {/* Server */}
                    <div className="space-y-2">
                      <label htmlFor="server" className="text-sm font-medium">{t("order.serverLabel")}</label>
                      <select
                        id="server"
                        {...form.register("server")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">{t("order.serverSelect")}</option>
                        <option value="na">{t("order.serverNa")}</option>
                        <option value="eu">{t("order.serverEu")}</option>
                        <option value="asia">{t("order.serverAsia")}</option>
                        <option value="ru">{t("order.serverRu")}</option>
                      </select>
                      {form.formState.errors.server && (
                        <p className="text-sm text-red-500">{form.formState.errors.server.message}</p>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-semibold mb-2">{t("order.summaryTitle")}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("order.summaryService")}</span>
                          <span className="font-medium">{t("order.summaryServiceName")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("order.summaryReward")}</span>
                          <span className="font-medium">{t("order.summaryRewardValue")}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="text-muted-foreground">{t("order.summaryTotalCost")}</span>
                          <span className="font-bold text-primary text-lg">${SERVICE_PRICE}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      <label htmlFor="additionalInfo" className="text-sm font-medium">{t("order.additionalInfoLabel")}</label>
                      <textarea
                        id="additionalInfo"
                        {...form.register("additionalInfo")}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={t("order.additionalInfoPlaceholder")}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 text-base"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("order.submitting")}
                        </>
                      ) : (
                        <>
                          {t("order.submit", { price: SERVICE_PRICE })}
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {t("order.disclaimer")}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
