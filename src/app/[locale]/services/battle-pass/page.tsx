"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Trophy, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent, Star, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { PRICE_PER_LEVEL, MAX_LEVELS, priceBattlePass } from "@/lib/pricing/battle-pass"

export default function BattlePassPage() {
  const t = useTranslations("battlePass")
  const { submitOrder, isSubmitting } = useOrderSubmit()

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        currentLevel: z.number().min(1, { message: t("errors.minLevel") }).max(50, { message: t("errors.maxLevel") }),
        targetLevel: z.number().min(1, { message: t("errors.minLevel") }).max(50, { message: t("errors.maxLevel") }),
        server: z.string().min(1, { message: t("errors.server") }),
        additionalInfo: z.string().optional(),
      }),
    [t],
  )
  const [currentLevel, setCurrentLevel] = useState<number | "">(1)
  const [targetLevel, setTargetLevel] = useState<number | "">(50)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const [levelsToBoost, setLevelsToBoost] = useState<number>(0)

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      currentLevel: 1,
      targetLevel: 50,
      server: "",
      additionalInfo: "",
    },
  })

  // Calculate pricing whenever levels change
  useEffect(() => {
    const current = currentLevel === "" ? 0 : currentLevel
    const target = targetLevel === "" ? 0 : targetLevel

    const { levelsToBoost: levels, basePrice: base, discount: discountPercent, total: final } =
      priceBattlePass({ currentLevel: current, targetLevel: target })

    setLevelsToBoost(levels)
    setBasePrice(base)
    setDiscount(discountPercent)
    setFinalPrice(final)
  }, [currentLevel, targetLevel])

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'battle-pass',
      message: values.additionalInfo,
      page: 'Battle Pass Boosting',
      orderDetails: {
          currentLevel: values.currentLevel,
          targetLevel: values.targetLevel,
          levelsToBoost: levelsToBoost,
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
                <Trophy className="h-10 w-10 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>

              {/* Current Event Banner */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏜️</span>
                  <span className="text-cyan-400 font-bold">{t("hero.eventLabel")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("hero.eventDescriptionPrefix")}<strong className="text-foreground">{t("hero.eventTank")}</strong>{t("hero.eventDescriptionSuffix")}
                </p>
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
                      
                      {/* Current Level */}
                      <div>
                        <label htmlFor="currentLevel" className="text-sm font-medium mb-2 block">
                          {t("calculator.currentLevelLabel")}
                        </label>
                        <Input
                          id="currentLevel"
                          type="number"
                          min={1}
                          max={50}
                          value={currentLevel}
                          onFocus={() => setCurrentLevel("")}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "") {
                              setCurrentLevel("")
                            } else {
                              const num = parseInt(val) || 0
                              setCurrentLevel(Math.min(50, Math.max(1, num)))
                            }
                          }}
                          className="text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={t("calculator.currentLevelPlaceholder")}
                        />
                      </div>

                      {/* Target Level */}
                      <div>
                        <label htmlFor="targetLevel" className="text-sm font-medium mb-2 block">
                          {t("calculator.targetLevelLabel")}
                        </label>
                        <Input
                          id="targetLevel"
                          type="number"
                          min={1}
                          max={50}
                          value={targetLevel}
                          onFocus={() => setTargetLevel("")}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "") {
                              setTargetLevel("")
                            } else {
                              const num = parseInt(val) || 0
                              setTargetLevel(Math.min(50, Math.max(1, num)))
                            }
                          }}
                          className="text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={t("calculator.targetLevelPlaceholder")}
                        />
                        {targetLevel !== "" && currentLevel !== "" && targetLevel < currentLevel && (
                          <p className="text-sm text-red-500 mt-1">{t("calculator.targetTooLow")}</p>
                        )}
                      </div>

                      {/* Levels Progress Display */}
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t("calculator.levelsToBoost")}</span>
                          <span className="text-xl font-bold text-primary">{levelsToBoost}</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(levelsToBoost / MAX_LEVELS) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{t("calculator.levelLabel", { level: currentLevel || 1 })}</span>
                          <span>{t("calculator.levelLabel", { level: targetLevel || MAX_LEVELS })}</span>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("calculator.pricePerLevel")}</span>
                          <span className="font-medium">${PRICE_PER_LEVEL.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("calculator.basePrice", { count: levelsToBoost })}</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Percent className="h-4 w-4 text-green-500" />
                              {t("calculator.discount", { percent: discount })}
                            </span>
                            <span className="font-medium text-green-500">-${(basePrice * (discount / 100)).toFixed(2)}</span>
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
                            <span>{t("calculator.discountTier1")} <strong className="text-foreground">{t("calculator.discountTier1Value")}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>{t("calculator.discountTier2")} <strong className="text-foreground">{t("calculator.discountTier2Value")}</strong></span>
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
                        <input type="hidden" {...form.register("currentLevel", { valueAsNumber: true })} value={currentLevel === "" ? 1 : currentLevel} />
                        <input type="hidden" {...form.register("targetLevel", { valueAsNumber: true })} value={targetLevel === "" ? 50 : targetLevel} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("order.summaryTitle")}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryService")}</span>
                              <span className="font-medium">{t("order.summaryServiceName")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryFromLevel")}</span>
                              <span className="font-medium">{currentLevel || 1}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryToLevel")}</span>
                              <span className="font-medium">{targetLevel || MAX_LEVELS}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryLevelsToBoost")}</span>
                              <span className="font-medium">{levelsToBoost}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("order.summaryDiscount")}</span>
                                <span className="font-medium text-green-500">{t("order.summaryDiscountValue", { percent: discount })}</span>
                              </div>
                            )}
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
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.allLevelsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.allLevelsBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.expertTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.expertBody")}</p>
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
