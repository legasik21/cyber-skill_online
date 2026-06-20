"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Medal, Shield, ChevronRight, Check, ArrowLeft, Calculator, Video, Crosshair, Disc, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { TIER_PRICING, TIER_LABELS, priceAceTanker } from "@/lib/pricing/ace-tanker"

export default function AceTankerPage() {
  const t = useTranslations("aceTanker")
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [tankTier, setTankTier] = useState<keyof typeof TIER_PRICING>("9_10")
  const [getReplays, setGetReplays] = useState<boolean>(false)
  const [isSpg, setIsSpg] = useState<boolean>(false)

  const [basePrice, setBasePrice] = useState<number>(0)
  const [spgCharge, setSpgCharge] = useState<number>(0)
  const [replaysCharge, setReplaysCharge] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        tankName: z.string().min(2, { message: t("errors.tankName") }),
        tankTier: z.enum(["11", "9_10", "8", "lower"], { message: t("errors.tier") }),
        isSpg: z.boolean(),
        getReplays: z.boolean(),
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
      tankName: "",
      tankTier: "9_10",
      isSpg: false,
      getReplays: false,
      server: "",
      additionalInfo: "",
    },
  })

  // Sync state with form
  useEffect(() => {
    form.setValue("tankTier", tankTier)
    form.setValue("getReplays", getReplays)
    form.setValue("isSpg", isSpg)
  }, [tankTier, getReplays, isSpg, form])

  // Calculate pricing
  useEffect(() => {
    const { base, spgExtra, replaysExtra, total } = priceAceTanker({ tankTier, isSpg, getReplays })

    setBasePrice(base)
    setSpgCharge(spgExtra)
    setReplaysCharge(replaysExtra)
    setFinalPrice(total)
  }, [tankTier, getReplays, isSpg])

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'ace-tanker',
      message: values.additionalInfo,
      page: 'Ace Tanker Service',
      orderDetails: {
          tankName: values.tankName,
          tier: TIER_LABELS[tankTier],
          isSpg: isSpg ? 'Yes (+100%)' : 'No',
          getReplays: getReplays ? 'Yes (+20%)' : 'No',
          server: values.server,
          basePrice: `$${basePrice.toFixed(2)}`,
          spgFee: isSpg ? `$${spgCharge.toFixed(2)}` : 'None',
          replaysFee: getReplays ? `$${replaysCharge.toFixed(2)}` : 'None',
          totalPrice: `$${finalPrice.toFixed(2)}`,
      },
    })
  }

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
                <Medal className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t("hero.subtitle")}
              </p>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <Calculator className="mr-2 h-5 w-5" />
                {t("hero.orderNow")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Main Booking Form */}
        <section id="calculator" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">

                {/* Left Column - Calculator */}
                <div>
                  <Card className="border-2 border-primary/20 bg-card sticky top-24">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <CardTitle className="text-2xl">{t("calculator.title")}</CardTitle>
                      </div>
                      <CardDescription>{t("calculator.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      {/* Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.tankTierLabel")}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["lower", "8", "9_10", "11"] as const).map((tier) => {
                            const price = TIER_PRICING[tier]
                            return (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setTankTier(tier)}
                              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center h-20 ${
                                tankTier === tier
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 bg-card/50'
                              }`}
                            >
                                <span className="font-bold">{TIER_LABELS[tier]}</span>
                                <span className="text-sm text-primary font-medium">${price}</span>
                            </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Extra Options */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.extraOptionsLabel")}</label>
                        <div className="space-y-3">

                            {/* SPG Option */}
                            <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="spg"
                                  checked={isSpg}
                                  onChange={(e) => setIsSpg(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="flex-1">
                                  <label htmlFor="spg" className="text-sm font-medium cursor-pointer block mb-1">
                                    {t("calculator.spgLabel")}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {t("calculator.spgNotePrefix")}<span className="font-semibold text-orange-500">{t("calculator.spgNoteHighlight")}</span>{t("calculator.spgNoteSuffix")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Replays Option */}
                            <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="replays"
                                  checked={getReplays}
                                  onChange={(e) => setGetReplays(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="flex-1">
                                  <label htmlFor="replays" className="text-sm font-medium cursor-pointer block mb-1">
                                    {t("calculator.replaysLabel")}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {t("calculator.replaysNotePrefix")}<span className="font-semibold text-amber-500">{t("calculator.replaysNoteHighlight")}</span>{t("calculator.replaysNoteSuffix")}
                                  </p>
                                </div>
                              </div>
                            </div>

                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("calculator.basePriceLabel", { tier: TIER_LABELS[tankTier] })}</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>

                        {spgCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.spgFeeLabel")}</span>
                            <span className="font-medium text-orange-500">+${spgCharge.toFixed(2)}</span>
                          </div>
                        )}

                        {replaysCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.replaysFeeLabel")}</span>
                            <span className="font-medium text-amber-500">+${replaysCharge.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>{t("calculator.totalLabel")}</span>
                          <span className="text-primary">${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Info Badge */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{t("calculator.guaranteeNote")}</span>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Order Form */}
                <div>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-2xl">{t("order.title")}</CardTitle>
                      <CardDescription>{t("order.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Tank Name */}
                        <div className="space-y-2">
                          <label htmlFor="tankName" className="text-sm font-medium">{t("order.tankNameLabel")}</label>
                          <Input
                            id="tankName"
                            placeholder={t("order.tankNamePlaceholder")}
                            {...form.register("tankName")}
                            className="bg-background"
                          />
                          {form.formState.errors.tankName && (
                            <p className="text-sm text-red-500">{form.formState.errors.tankName.message}</p>
                          )}
                        </div>

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

                         {/* Hidden fields that sync with calculator */}
                         <input type="hidden" {...form.register("tankTier")} value={tankTier} />
                         <input type="hidden" {...form.register("isSpg")} value={isSpg ? "true" : "false"} />
                         <input type="hidden" {...form.register("getReplays")} value={getReplays ? "true" : "false"} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("order.summaryTitle")}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryService")}</span>
                              <span className="font-medium">{t("order.summaryServiceName")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryTier")}</span>
                              <span className="font-medium">{TIER_LABELS[tankTier]}</span>
                            </div>
                            {isSpg && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t("order.summaryClass")}</span>
                                  <span className="font-medium text-orange-500">{t("order.summaryClassValue")}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryGetReplays")}</span>
                              <span className="font-medium">
                                {getReplays ? t("order.summaryYes") : t("order.summaryNo")}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-muted-foreground">{t("order.summaryTotalCost")}</span>
                              <span className="font-bold text-primary text-lg">${finalPrice.toFixed(2)}</span>
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
                        <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {t("order.submitting")}
                            </>
                          ) : (
                            <>
                              {t("order.submit", { price: finalPrice.toFixed(2) })}
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
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("howItWorks.heading")}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      1
                    </div>
                    <CardTitle className="text-lg">{t("howItWorks.step1Title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("howItWorks.step1Body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <CardTitle className="text-lg">{t("howItWorks.step2Title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("howItWorks.step2Body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <CardTitle className="text-lg">{t("howItWorks.step3Title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {t("howItWorks.step3Body")}
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
