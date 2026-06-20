"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ChevronsUp, ChevronRight, Calculator, Coins, Zap, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { SILVER_OPTIONS, priceTierLeveling } from "@/lib/pricing/tier-leveling"

export default function TierLevelingPage() {
  const t = useTranslations("tierLeveling")
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [fromTier, setFromTier] = useState(1)
  const [toTier, setToTier] = useState(11)
  const [dontUseBoosters, setDontUseBoosters] = useState(false)
  const [isSPG, setIsSPG] = useState(false)
  const [selectedSilverIds, setSelectedSilverIds] = useState<string>("none")

  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        server: z.string().min(1, { message: t("errors.server") }),
        dontUseBoosters: z.boolean(),
        silverFarm: z.string(),
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
      dontUseBoosters: false,
      silverFarm: "none",
      additionalInfo: "",
    },
  })

  // Calculate prices via the shared deterministic pricing module
  const priceDetails = useMemo(() => {
    const { base, noBoostersCharge, spgCharge, silverCost, total } = priceTierLeveling({
      fromTier,
      toTier,
      isSPG,
      dontUseBoosters,
      selectedSilverIds,
    })

    return {
      base,
      noBoostersSurcharge: noBoostersCharge,
      spgSurcharge: spgCharge,
      silverPrice: silverCost,
      total,
    }
  }, [fromTier, toTier, isSPG, dontUseBoosters, selectedSilverIds])

  // Safe handlers for tier selection
  const handleFromChange = (val: number) => {
    const v = Number.isFinite(val) ? val : 1
    const newFrom = Math.max(1, Math.min(10, v))
    // Ensure from < to
    const maybeTo = newFrom >= toTier ? Math.min(11, newFrom + 1) : toTier
    setToTier(maybeTo)
    setFromTier(newFrom)
  }

  const handleToChange = (val: number) => {
    const v = Number.isFinite(val) ? val : 11
    const newTo = Math.max(2, Math.min(11, v))
    // Ensure from < to
    const maybeFrom = newTo <= fromTier ? Math.max(1, newTo - 1) : fromTier
    setFromTier(maybeFrom)
    setToTier(newTo)
  }

  // Filled segment position for visualization
  const leftPct = ((fromTier - 1) / 10) * 100
  const rightPct = ((11 - toTier) / 10) * 100

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    const silverLabel = SILVER_OPTIONS.find(o => o.id === selectedSilverIds)?.label || 'None'

    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'tier-leveling',
      message: values.additionalInfo,
      page: 'Tier Leveling Service',
      orderDetails: {
          tierRange: `${fromTier} → ${toTier}`,
          levelsToBoost: `${toTier - fromTier} tiers`,
          spg: isSPG ? 'Yes (+30%)' : 'No',
          xpBoosters: dontUseBoosters ? 'No XP Boosters (+30%)' : 'Use Boosters',
          silverFarm: silverLabel,
          server: values.server,
          basePrice: `$${priceDetails.base.toFixed(2)}`,
          spgSurcharge: priceDetails.spgSurcharge > 0 ? `$${priceDetails.spgSurcharge.toFixed(2)}` : 'None',
          noBoostersSurcharge: priceDetails.noBoostersSurcharge > 0 ? `$${priceDetails.noBoostersSurcharge.toFixed(2)}` : 'None',
          silverPrice: priceDetails.silverPrice > 0 ? `$${priceDetails.silverPrice.toFixed(2)}` : 'None',
          totalPrice: `$${priceDetails.total.toFixed(2)}`,
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
                ← {t("backToHome")}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <ChevronsUp className="h-10 w-10 text-primary" />
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

        {/* Calculator Section */}
        <section id="calculator" className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calculator className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-bold">{t("calculator.heading")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("calculator.subheading")}
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calculator Controls */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle>{t("calculator.tierSelectionTitle")}</CardTitle>
                      <CardDescription>
                        {t("calculator.tierSelectionDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Tier Range Selector */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("calculator.fromTierLabel")}</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              key={`from-${fromTier}`}
                              defaultValue={fromTier}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10)
                                if (isNaN(val) || val < 1) val = 1
                                if (val > 10) val = 10
                                handleFromChange(val)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur()
                                }
                              }}
                              className="w-16 h-10 text-center bg-background text-sm rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("calculator.toTierLabel")}</label>
                            <input
                              type="number"
                              min={2}
                              max={11}
                              key={`to-${toTier}`}
                              defaultValue={toTier}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10)
                                if (isNaN(val) || val < 2) val = 2
                                if (val > 11) val = 11
                                handleToChange(val)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur()
                                }
                              }}
                              className="w-16 h-10 text-center bg-background text-sm rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>

                        {/* Dual Range Slider */}
                        <div className="relative pt-1 pb-2">
                          {/* Graduation labels */}
                          <div className="relative h-5 mb-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((tier) => {
                              const pct = ((tier - 1) / 10) * 100
                              return (
                                <span
                                  key={tier}
                                  className="absolute text-xs text-muted-foreground"
                                  style={{
                                    left: `${pct}%`,
                                    transform: 'translateX(-50%)',
                                  }}
                                >
                                  {tier}
                                </span>
                              )
                            })}
                          </div>

                          <div className="relative h-6">
                            {/* Track background */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-secondary rounded-full" />

                            {/* Graduation tick marks */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((tier) => {
                              const pct = ((tier - 1) / 10) * 100
                              return (
                                <div
                                  key={tier}
                                  className="absolute top-1/2 w-0.5 h-4 bg-muted-foreground/40 -translate-y-1/2"
                                  style={{ left: `${pct}%` }}
                                />
                              )
                            })}

                            {/* Filled segment */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-2 bg-primary rounded-full"
                              style={{
                                left: `${leftPct}%`,
                                right: `${rightPct}%`,
                              }}
                            />

                            {/* FROM slider */}
                            <input
                              type="range"
                              min={1}
                              max={11}
                              step={1}
                              value={fromTier}
                              onChange={(e) => handleFromChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 4 }}
                            />

                            {/* TO slider */}
                            <input
                              type="range"
                              min={1}
                              max={11}
                              step={1}
                              value={toTier}
                              onChange={(e) => handleToChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 5 }}
                            />
                          </div>
                        </div>
                      </div>


                      {/* Leveling Summary Display */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {t("calculator.tiersToLevel")}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {t("calculator.tierRangeValue", { from: fromTier, to: toTier, count: toTier - fromTier })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Options Section */}
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        {t("calculator.additionalOptionsTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* SPG Option */}
                      <label className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSPG ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSPG}
                          onChange={(e) => setIsSPG(e.target.checked)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-semibold">{t("calculator.spgTitle")}</div>
                          <p className="text-sm text-muted-foreground">{t("calculator.spgNote")}</p>
                          <p className="text-sm text-primary font-bold mt-1">{t("calculator.spgSurchargeNote")}</p>
                        </div>
                      </label>

                      {/* No Boosters Option */}
                      <label className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        dontUseBoosters ? 'border-blue-500/50 bg-blue-500/5' : 'border-border bg-card'
                      }`}>
                        <input
                          type="checkbox"
                          checked={dontUseBoosters}
                          onChange={(e) => setDontUseBoosters(e.target.checked)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-semibold">{t("calculator.noBoostersTitle")}</div>
                          <p className="text-sm text-muted-foreground">{t("calculator.noBoostersNote")}</p>
                          <p className="text-sm text-blue-500 font-bold mt-1">{t("calculator.noBoostersSurchargeNote")}</p>
                        </div>
                      </label>
                    </CardContent>
                  </Card>

                  {/* Silver Farm Section */}
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        {t("calculator.silverFarmingTitle")}
                      </CardTitle>
                      <CardDescription>
                        {t("calculator.silverFarmingDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {SILVER_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedSilverIds(option.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              selectedSilverIds === option.id
                                ? 'border-yellow-500/50 bg-yellow-500/10 shadow-md'
                                : 'border-border hover:border-yellow-500/30 bg-card'
                            }`}
                          >
                            <div className="font-semibold text-sm">{option.label}</div>
                            {option.price > 0 && <div className="text-yellow-500 font-bold mt-1">+${option.price}</div>}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Summary Panel */}
                <div className="lg:col-span-1">
                  <Card className="border-2 border-primary/20 bg-card sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-xl">{t("summary.title")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("summary.service")}</span>
                          <span className="font-medium">{t("summary.serviceName")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("summary.tiers")}</span>
                          <span className="font-medium">
                            {fromTier} → {toTier}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("summary.levelsToBoost")}</span>
                          <span className="font-medium text-primary">
                            {t("summary.levelsToBoostValue", { count: toTier - fromTier })}
                          </span>
                        </div>
                      </div>

                        <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("summary.basePrice")}</span>
                          <span>${priceDetails.base.toFixed(2)}</span>
                        </div>
                        {priceDetails.spgSurcharge > 0 && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>{t("summary.spgSurcharge")}</span>
                            <span>+${priceDetails.spgSurcharge.toFixed(2)}</span>
                          </div>
                        )}
                        {priceDetails.noBoostersSurcharge > 0 && (
                          <div className="flex justify-between text-sm text-blue-400">
                            <span>{t("summary.noBoostersSurcharge")}</span>
                            <span>+${priceDetails.noBoostersSurcharge.toFixed(2)}</span>
                          </div>
                        )}
                        {priceDetails.silverPrice > 0 && (
                          <div className="flex justify-between text-sm text-yellow-400">
                            <span>{t("summary.silverFarming")}</span>
                            <span>+${priceDetails.silverPrice.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{t("summary.total")}</span>
                          <span className="text-3xl font-bold text-primary">
                            ${priceDetails.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={fromTier >= toTier}
                        onClick={() =>
                          document
                            .getElementById("order-form")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        }
                      >
                        {t("summary.continueToOrder")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-16">
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
                          <span className="text-muted-foreground">{t("order.summaryTiers")}</span>
                          <span className="font-medium">{fromTier} → {toTier}</span>
                        </div>
                        {isSPG && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("order.summaryClass")}</span>
                            <span className="font-medium text-primary">{t("order.summaryClassValue")}</span>
                          </div>
                        )}
                        {dontUseBoosters && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("order.summaryOption")}</span>
                            <span className="font-medium text-blue-500">{t("order.summaryOptionValue")}</span>
                          </div>
                        )}
                        {priceDetails.silverPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("order.summarySilver")}</span>
                            <span className="font-medium text-yellow-500">+${priceDetails.silverPrice}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="text-muted-foreground">{t("order.summaryTotalCost")}</span>
                          <span className="font-bold text-primary text-lg">
                            ${priceDetails.total.toFixed(2)}
                          </span>
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
                      disabled={fromTier >= toTier || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("order.submitting")}
                        </>
                      ) : (
                        <>
                          {fromTier < toTier ? t("order.submit", { price: priceDetails.total.toFixed(2) }) : t("order.selectTierRange")}
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
