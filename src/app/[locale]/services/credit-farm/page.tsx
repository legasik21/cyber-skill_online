"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Coins, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import {
  CREDIT_PRICING,
  WN8_TIER_LABELS,
  BONDS_WN8_MODIFIERS,
  BONDS_WN8_LABELS,
  priceCreditFarm,
} from "@/lib/pricing/credit-farm"

// Service types
type ServiceType = "credits" | "bonds"

export default function CreditFarmPage() {
  const t = useTranslations("creditFarm")
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [serviceType, setServiceType] = useState<ServiceType>("credits")
  const [amount, setAmount] = useState<number | "">(1)
  const [selectedTier, setSelectedTier] = useState<string>("under-2500")
  const [cannotUseSilverBoosters, setCannotUseSilverBoosters] = useState<boolean>(false)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [silverBoostersCharge, setSilverBoostersCharge] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        serviceType: z.enum(["credits", "bonds"], { message: t("errors.serviceType") }),
        tier: z.string().min(1, { message: t("errors.tier") }),
        cannotUseSilverBoosters: z.boolean().optional(),
        amount: z.number().min(1, { message: t("errors.amount") }),
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
      serviceType: "credits",
      tier: "under-2500",
      cannotUseSilverBoosters: false,
      amount: 1,
      server: "",
      additionalInfo: "",
    },
  })

  // Calculate pricing whenever amount, tier, service type, or silver boosters changes
  useEffect(() => {
    const amountValue = amount === "" ? 0 : amount

    const { base, discountPercent, silverCharge, total } = priceCreditFarm({
      serviceType,
      tier: selectedTier,
      amount: amountValue,
      cannotUseSilverBoosters,
    })

    setBasePrice(base)
    setDiscount(discountPercent)
    setSilverBoostersCharge(silverCharge)
    setFinalPrice(total)
  }, [amount, selectedTier, cannotUseSilverBoosters, serviceType])

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    const tierLabel = serviceType === "credits"
      ? WN8_TIER_LABELS[selectedTier as keyof typeof WN8_TIER_LABELS]
      : BONDS_WN8_LABELS[selectedTier as keyof typeof BONDS_WN8_LABELS]

    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'credits',
      message: values.additionalInfo,
      page: 'Credit and Bonds Farming Service',
      orderDetails: {
        serviceType: serviceType === "credits" ? "Credits" : "Bonds",
        tier: tierLabel,
        amount: serviceType === "credits" ? `${amount}M` : `${amount} bonds`,
        server: values.server,
        silverBoosters: cannotUseSilverBoosters ? 'No Silver Boosters (+30%)' : 'Use Boosters',
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
                <Coins className="h-10 w-10 text-primary" />
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

                      {/* Service Type Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.serviceType")}</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setServiceType("credits")
                              setSelectedTier("under-2500")
                              setAmount(1)
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              serviceType === "credits"
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t("calculator.credits")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setServiceType("bonds")
                              setSelectedTier("2000")
                              setAmount(100)
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              serviceType === "bonds"
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t("calculator.bonds")}
                          </button>
                        </div>
                      </div>

                      {/* Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {serviceType === "credits" ? t("calculator.packageTier") : t("calculator.wn8Tier")}
                        </label>
                        <div className="space-y-2">
                          {serviceType === "credits" && Object.entries(CREDIT_PRICING).map(([tier, price]) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setSelectedTier(tier)}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                selectedTier === tier
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 bg-card/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-lg">{WN8_TIER_LABELS[tier as keyof typeof WN8_TIER_LABELS]}</div>
                                  <div className="text-sm text-muted-foreground">{t("calculator.perMillion", { price })}</div>
                                </div>
                                {selectedTier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}

                          {serviceType === "bonds" && Object.entries(BONDS_WN8_MODIFIERS).map(([tier, modifier]) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setSelectedTier(tier)}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                selectedTier === tier
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 bg-card/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-lg">{BONDS_WN8_LABELS[tier as keyof typeof BONDS_WN8_LABELS]}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {modifier === 0 ? t("calculator.standardPrice") : t("calculator.modifierToBase", { modifier })}
                                  </div>
                                </div>
                                {selectedTier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Silver Boosters Options - Only for Credits */}
                      {serviceType === "credits" && (
                        <div>
                          <label className="text-sm font-medium mb-3 block">{t("calculator.silverBoosters")}</label>
                          <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id="silverBoosters"
                                checked={cannotUseSilverBoosters}
                                onChange={(e) => setCannotUseSilverBoosters(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              />
                              <div className="flex-1">
                                <label htmlFor="silverBoosters" className="text-sm font-medium cursor-pointer block mb-1">
                                  {t("calculator.dontUseSilverBoosters")}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {t("calculator.silverBoostersNotePrefix")}<span className="font-semibold text-amber-500">{t("calculator.silverBoostersNoteHighlight")}</span>{t("calculator.silverBoostersNoteSuffix")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Amount Input */}
                      <div>
                        <label htmlFor="amount" className="text-sm font-medium mb-2 block">
                          {serviceType === "credits" ? t("calculator.creditsAmountLabel") : t("calculator.bondsAmountLabel")}
                        </label>

                        {serviceType === "credits" ? (
                          <>
                            <Input
                              id="amount"
                              type="number"
                              value={amount}
                              onFocus={() => setAmount("")}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === "") {
                                  setAmount("")
                                } else {
                                  setAmount(parseInt(val) || 0)
                                }
                              }}
                              className="text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder={t("calculator.creditsAmountPlaceholder")}
                            />
                            {amount !== "" && amount < 1 && amount > 0 && (
                              <p className="text-sm text-red-500 mt-1">{t("calculator.minMillion")}</p>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-5 gap-2">
                              {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setAmount(value)}
                                  className={`p-3 rounded-lg border-2 transition-all text-center font-medium ${
                                    amount === value
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border hover:border-primary/50 bg-card/50'
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                              {t("calculator.bondsMoreNote")}
                            </p>
                          </div>
                        )}
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

                        {silverBoostersCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.silverBoostersCharge")}</span>
                            <span className="font-medium text-amber-500">+${silverBoostersCharge.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>{t("calculator.total")}</span>
                          <span className="text-primary">${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Discount Tiers Info - Only for Credits */}
                      {serviceType === "credits" && (
                        <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("calculator.volumeDiscountsTitle")}</div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>{t("calculator.volumeTier1Prefix")}<strong className="text-foreground">{t("calculator.volumeTier1Off")}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>{t("calculator.volumeTier2Prefix")}<strong className="text-foreground">{t("calculator.volumeTier2Off")}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>{t("calculator.volumeTier3Prefix")}<strong className="text-foreground">{t("calculator.volumeTier3Off")}</strong></span>
                            </div>
                          </div>
                        </div>
                      )}

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
                      <CardTitle className="text-2xl">{t("orderForm.title")}</CardTitle>
                      <CardDescription>{t("orderForm.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">{t("orderForm.emailLabel")}</label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t("orderForm.emailPlaceholder")}
                            {...form.register("email")}
                            className="bg-background"
                          />
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                          )}
                        </div>

                        {/* Discord Tag */}
                        <div className="space-y-2">
                          <label htmlFor="discordTag" className="text-sm font-medium">{t("orderForm.discordLabel")}</label>
                          <Input
                            id="discordTag"
                            placeholder={t("orderForm.discordPlaceholder")}
                            {...form.register("discordTag")}
                            className="bg-background"
                          />
                          {form.formState.errors.discordTag && (
                            <p className="text-sm text-red-500">{form.formState.errors.discordTag.message}</p>
                          )}
                        </div>

                        {/* Server */}
                        <div className="space-y-2">
                          <label htmlFor="server" className="text-sm font-medium">{t("orderForm.serverLabel")}</label>
                          <select
                            id="server"
                            {...form.register("server")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">{t("orderForm.serverSelect")}</option>
                            <option value="na">{t("orderForm.serverNa")}</option>
                            <option value="eu">{t("orderForm.serverEu")}</option>
                            <option value="asia">{t("orderForm.serverAsia")}</option>
                            <option value="ru">{t("orderForm.serverRu")}</option>
                          </select>
                          {form.formState.errors.server && (
                            <p className="text-sm text-red-500">{form.formState.errors.server.message}</p>
                          )}
                        </div>

                        {/* Hidden fields that sync with calculator */}
                        <input type="hidden" {...form.register("serviceType")} value={serviceType} />
                        <input type="hidden" {...form.register("tier")} value={selectedTier} />
                        <input type="hidden" {...form.register("cannotUseSilverBoosters")} value={cannotUseSilverBoosters ? "true" : "false"} />
                        <input type="hidden" {...form.register("amount", { valueAsNumber: true })} value={amount === "" ? 0 : amount} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("orderForm.summaryTitle")}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("orderForm.summaryService")}</span>
                              <span className="font-medium">{serviceType === "credits" ? t("orderForm.summaryServiceCredits") : t("orderForm.summaryServiceBonds")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("orderForm.summaryTier")}</span>
                              <span className="font-medium">
                                {serviceType === "credits"
                                  ? WN8_TIER_LABELS[selectedTier as keyof typeof WN8_TIER_LABELS]
                                  : BONDS_WN8_LABELS[selectedTier as keyof typeof BONDS_WN8_LABELS]
                                }
                              </span>
                            </div>
                            {serviceType === "credits" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("orderForm.summarySilverBoosters")}</span>
                                <span className="font-medium">
                                  {cannotUseSilverBoosters ? t("orderForm.summarySilverBoostersDont") : t("orderForm.summarySilverBoostersUse")}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{serviceType === "credits" ? t("orderForm.summaryCredits") : t("orderForm.summaryBonds")}</span>
                              <span className="font-medium">{serviceType === "credits" ? `${amount}M` : amount}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-muted-foreground">{t("orderForm.summaryTotalCost")}</span>
                              <span className="font-bold text-primary text-lg">${finalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2">
                          <label htmlFor="additionalInfo" className="text-sm font-medium">{t("orderForm.additionalInfoLabel")}</label>
                          <textarea
                            id="additionalInfo"
                            {...form.register("additionalInfo")}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder={t("orderForm.additionalInfoPlaceholder")}
                          />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {t("orderForm.sendingOrder")}
                            </>
                          ) : (
                            <>
                              {t("orderForm.submitOrder", { price: finalPrice.toFixed(2) })}
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          {t("orderForm.terms")}
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
                      <Coins className="h-5 w-5 text-primary" />
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
                    <h3 className="font-semibold mb-1">{t("features.trackingTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.trackingBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.volumeTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.volumeBody")}</p>
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
