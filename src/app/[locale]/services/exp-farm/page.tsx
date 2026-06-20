"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Zap, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent, BookOpen, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { EXP_PRICING, WN8_TIER_LABELS, priceExpFarm } from "@/lib/pricing/exp-farm"

export default function ExpFarmPage() {
  const t = useTranslations("expFarm")
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [expAmount, setExpAmount] = useState<number | "">(50) // Default 50k
  const [selectedWN8Tier, setSelectedWN8Tier] = useState<keyof typeof EXP_PRICING>("under-2500")
  const [cannotUseXPBoosters, setCannotUseXPBoosters] = useState<boolean>(false)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [xpBoostersCharge, setXpBoostersCharge] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        wn8Tier: z.enum(["under-2500", "over-2500"], { message: t("errors.wn8Tier") }),
        cannotUseXPBoosters: z.boolean(),
        expAmount: z.number().min(10, { message: t("errors.minXp") }), // Minimum 10k
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
      wn8Tier: "under-2500",
      cannotUseXPBoosters: false,
      expAmount: 50,
      server: "",
      additionalInfo: "",
    },
  })

  // Calculate pricing whenever xp amount, tier, or boosters changes
  useEffect(() => {
    const amount = expAmount === "" ? 0 : expAmount

    if (amount < 1) {
      setBasePrice(0)
      setDiscount(0)
      setXpBoostersCharge(0)
      setFinalPrice(0)
      return
    }

    const { base, discountPercent, xpBoostersCharge: boostersCharge, total } = priceExpFarm({
      expAmount: amount,
      wn8Tier: selectedWN8Tier,
      cannotUseXPBoosters,
    })

    setBasePrice(base)
    setDiscount(discountPercent)
    setXpBoostersCharge(boostersCharge)
    setFinalPrice(total)
  }, [expAmount, selectedWN8Tier, cannotUseXPBoosters])

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'exp-farm',
      message: values.additionalInfo,
      page: 'Experience (XP) Farming',
      orderDetails: {
          wn8Tier: WN8_TIER_LABELS[values.wn8Tier],
          xpBoosters: values.cannotUseXPBoosters ? 'No XP Boosters (+30%)' : 'Use Boosters',
          amount: `${values.expAmount}k XP`,
          server: values.server,
          basePrice: `$${basePrice.toFixed(2)}`,
          discount: discount > 0 ? `${discount}%` : 'None',
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
                <BookOpen className="h-10 w-10 text-primary" />
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
                {t("hero.calculatePrice")}
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

                      {/* WN8 Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.packageTierLabel")}</label>
                        <div className="space-y-2">
                          {Object.entries(EXP_PRICING).map(([tier, price]) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setSelectedWN8Tier(tier as keyof typeof EXP_PRICING)}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                selectedWN8Tier === tier
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 bg-card/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-lg">{WN8_TIER_LABELS[tier as keyof typeof WN8_TIER_LABELS]}</div>
                                  <div className="text-sm text-muted-foreground">{t("calculator.pricePer10k", { price })}</div>
                                </div>
                                {selectedWN8Tier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* XP Boosters Options */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.xpBoostersLabel")}</label>
                        <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="xpBoosters"
                              checked={cannotUseXPBoosters}
                              onChange={(e) => setCannotUseXPBoosters(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <div className="flex-1">
                              <label htmlFor="xpBoosters" className="text-sm font-medium cursor-pointer block mb-1">
                                {t("calculator.dontUseBoostersTitle")}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {t("calculator.dontUseBoostersNotePre")}<span className="font-semibold text-amber-500">{t("calculator.dontUseBoostersNoteStrong")}</span>{t("calculator.dontUseBoostersNotePost")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* XP Amount */}
                      <div>
                        <label htmlFor="xp" className="text-sm font-medium mb-2 block">
                          {t("calculator.xpAmountLabel")}
                        </label>
                        <Input
                          id="xp"
                          type="number"
                          value={expAmount}
                          onFocus={() => setExpAmount("")}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "") {
                              setExpAmount("")
                            } else {
                              setExpAmount(parseInt(val) || 0)
                            }
                          }}
                          className="text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={t("calculator.xpAmountPlaceholder")}
                        />
                        {expAmount !== "" && expAmount < 10 && expAmount >= 0 && (
                          <p className="text-sm text-red-500 mt-1">{t("calculator.minXpNote")}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("calculator.xpAmountHelp")}
                        </p>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("calculator.basePrice")}</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Percent className="h-4 w-4 text-green-500" />
                              {t("calculator.discount", { discount })}
                            </span>
                            <span className="font-medium text-green-500">-${(basePrice * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}

                        {xpBoostersCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.xpBoostersCharge")}</span>
                            <span className="font-medium text-amber-500">+${xpBoostersCharge.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>{t("calculator.total")}</span>
                          <span className="text-primary">${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Discount Tiers Info */}
                      <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-semibold mb-2">{t("calculator.volumeDiscountsTitle")}</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>{t("calculator.discount100to249Pre")}<strong className="text-foreground">{t("calculator.discount100to249Strong")}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>{t("calculator.discount250to499Pre")}<strong className="text-foreground">{t("calculator.discount250to499Strong")}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>{t("calculator.discount500Pre")}<strong className="text-foreground">{t("calculator.discount500Strong")}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Security Badge */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{t("calculator.securityBadge")}</span>
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
                        <input type="hidden" {...form.register("wn8Tier")} value={selectedWN8Tier} />
                        <input type="hidden" {...form.register("cannotUseXPBoosters")} value={cannotUseXPBoosters ? "true" : "false"} />
                        <input type="hidden" {...form.register("expAmount", { valueAsNumber: true })} value={expAmount === "" ? 0 : expAmount} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("order.summaryTitle")}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryPackage")}</span>
                              <span className="font-medium">{WN8_TIER_LABELS[selectedWN8Tier]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryBoosters")}</span>
                              <span className="font-medium">
                                {cannotUseXPBoosters ? t("order.summaryBoostersDont") : t("order.summaryBoostersUse")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryExperience")}</span>
                              <span className="font-medium">{t("order.summaryExperienceValue", { amount: expAmount })}</span>
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

        {/* Features Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("features.heading")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.secureTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.secureBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.fastTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.fastBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.goalsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.goalsBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.discountsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.discountsBody")}</p>
                  </div>
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
