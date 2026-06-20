"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Swords, Shield, ChevronRight, Check, ArrowLeft, Calculator, Crown, Trophy, Coins, ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import {
  MIN_POINTS,
  MAX_POINTS,
  POINTS_STAGES,
  SILVER_OPTIONS,
  priceOnslaught,
} from "@/lib/pricing/onslaught"

// Helper function to get rank label from points
function getRankFromPoints(points: number): string {
  const stage = POINTS_STAGES.find(s => points >= s.minPoints && points <= s.maxPoints);
  return stage?.label || "Iron";
}

export default function OnslaughtPage() {
  const t = useTranslations("onslaught")
  const { submitOrder, isSubmitting } = useOrderSubmit()

  const orderFormSchema = useMemo(() => z.object({
    email: z.string().email({ message: t("errors.email") }),
    discordTag: z.string().min(3, { message: t("errors.discord") }),
    currentPoints: z.number(),
    targetPoints: z.number(),
    platoon: z.boolean(),
    server: z.string().min(1, { message: t("errors.server") }),
    silverOption: z.string(),
    completeMissions: z.boolean(),
    additionalInfo: z.string().optional(),
  }).refine((data) => {
    return data.targetPoints > data.currentPoints;
  }, {
    message: t("errors.target"),
    path: ["targetPoints"],
  }), [t]);

  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [targetPoints, setTargetPoints] = useState<number>(2000)
  const [playWithBooster, setPlayWithBooster] = useState<boolean>(false)
  const [completeMissions, setCompleteMissions] = useState<boolean>(false)
  const [silverOption, setSilverOption] = useState<string>("none")

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      currentPoints: 0,
      targetPoints: 2000,
      platoon: false,
      server: "",
      silverOption: "none",
      completeMissions: false,
      additionalInfo: "",
    },
  })

  // Update form values when state changes
  useEffect(() => {
    form.setValue("currentPoints", currentPoints);
    form.setValue("targetPoints", targetPoints);
    form.setValue("platoon", playWithBooster);
    form.setValue("silverOption", silverOption);
    form.setValue("completeMissions", completeMissions);
  }, [currentPoints, targetPoints, playWithBooster, silverOption, completeMissions, form]);

  // Price calculation
  const priceDetails = useMemo(() => {
    const { base, boosterCharge, silverCharge, missionsCharge, total } = priceOnslaught({
      currentPoints,
      targetPoints,
      playWithBooster,
      silverOption,
      completeMissions,
    });

    return {
      basePrice: base,
      boosterCharge,
      silverCharge,
      missionsCharge,
      total,
    };
  }, [currentPoints, targetPoints, playWithBooster, silverOption, completeMissions]);

  // Safe handlers for point input
  const handleFromChange = (val: number) => {
    const v = Number.isFinite(val) ? val : 0;
    const newFrom = Math.max(MIN_POINTS, Math.min(MAX_POINTS - 100, v));
    const maybeTo = newFrom >= targetPoints ? Math.min(MAX_POINTS, newFrom + 100) : targetPoints;
    setTargetPoints(maybeTo);
    setCurrentPoints(newFrom);
  };

  const handleToChange = (val: number) => {
    const v = Number.isFinite(val) ? val : MAX_POINTS;
    const newTo = Math.max(100, Math.min(MAX_POINTS, v));
    const maybeFrom = newTo <= currentPoints ? Math.max(MIN_POINTS, newTo - 100) : currentPoints;
    setCurrentPoints(maybeFrom);
    setTargetPoints(newTo);
  };

  // Slider positions
  const leftPct = (currentPoints / MAX_POINTS) * 100;
  const rightPct = ((MAX_POINTS - targetPoints) / MAX_POINTS) * 100;

  // Current and target ranks
  const currentRank = getRankFromPoints(currentPoints);
  const targetRank = getRankFromPoints(targetPoints);

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    const silverLabel = SILVER_OPTIONS.find(o => o.id === values.silverOption)?.label || 'None'

    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'onslaught',
      message: values.additionalInfo,
      page: 'Onslaught Boosting',
      orderDetails: {
          ratingBoost: `${values.currentPoints} pts (${currentRank}) ➤ ${values.targetPoints} pts (${targetRank})`,
          playWithBooster: values.platoon ? 'Yes (+40%)' : 'No',
          missionCompletion: values.completeMissions ? 'Yes (+$40)' : 'No',
          silverFarm: silverLabel,
          server: values.server,
          basePrice: `$${priceDetails.basePrice.toFixed(2)}`,
          boosterCharge: priceDetails.boosterCharge > 0 ? `$${priceDetails.boosterCharge.toFixed(2)}` : 'None',
          silverCharge: priceDetails.silverCharge > 0 ? `$${priceDetails.silverCharge.toFixed(2)}` : 'None',
          missionsCharge: priceDetails.missionsCharge > 0 ? `$${priceDetails.missionsCharge.toFixed(2)}` : 'None',
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
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("backToHome")}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Swords className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full">{t("hero.tagYearOfDragon")}</span>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full">{t("hero.tagAshbringer")}</span>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">{t("hero.tagRexDraconis")}</span>
              </div>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <Calculator className="mr-2 h-5 w-5" />
                {t("hero.calculateButton")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Season Info Cards */}
        <section className="py-8 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {t("seasonCards.annualRewardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{t("seasonCards.annualRewardName")}</p>
                  <p className="text-xs text-muted-foreground">{t("seasonCards.annualRewardDesc")}</p>
                </CardContent>
              </Card>
              <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-red-500" />
                    {t("seasonCards.goldRewardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{t("seasonCards.goldRewardName")}</p>
                  <p className="text-xs text-muted-foreground">{t("seasonCards.goldRewardDesc")}</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Swords className="h-5 w-5 text-blue-500" />
                    {t("seasonCards.rentalTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{t("seasonCards.rentalNames")}</p>
                  <p className="text-xs text-muted-foreground">{t("seasonCards.rentalDesc")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Rank Stages Info */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">{t("rankStages.heading")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {POINTS_STAGES.filter(s => s.id !== "iron").map((stage) => (
                  <div key={stage.id} className="p-3 rounded-lg border border-border bg-card/50 text-center">
                    <div className="font-semibold text-sm">{stage.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {stage.minPoints} - {stage.maxPoints} {t("rankStages.unit")}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                {t("rankStages.note")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Booking Form */}
        <section id="calculator" className="py-16 bg-secondary/20">
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
                      
                      {/* Rating Input Section - Like the reference image */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block text-center text-muted-foreground">{t("calculator.currentRatingLabel")}</label>
                            <input
                              type="number"
                              min={MIN_POINTS}
                              max={MAX_POINTS - 100}
                              key={`from-${currentPoints}`}
                              defaultValue={currentPoints}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < MIN_POINTS) val = MIN_POINTS;
                                if (val > MAX_POINTS - 100) val = MAX_POINTS - 100;
                                handleFromChange(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-full h-12 text-center bg-background text-lg font-semibold rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="flex items-end pb-3">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block text-center text-muted-foreground">{t("calculator.desiredRatingLabel")}</label>
                            <input
                              type="number"
                              min={100}
                              max={MAX_POINTS}
                              key={`to-${targetPoints}`}
                              defaultValue={targetPoints}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 100) val = 100;
                                if (val > MAX_POINTS) val = MAX_POINTS;
                                handleToChange(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-full h-12 text-center bg-background text-lg font-semibold rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>

                        {/* Dual Range Slider */}
                        <div className="relative pt-1 pb-2">
                          <div className="relative h-6">
                            {/* Track background */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-secondary rounded-full" />
                            
                            {/* Graduation tick marks */}
                            {[0, 1000, 2000, 3000, 4000, 4500].map((mark) => {
                              const pct = (mark / MAX_POINTS) * 100;
                              return (
                                <div
                                  key={mark}
                                  className="absolute top-1/2 w-0.5 h-4 bg-muted-foreground/40 -translate-y-1/2"
                                  style={{ left: `${pct}%` }}
                                />
                              );
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
                              min={MIN_POINTS}
                              max={MAX_POINTS - 100}
                              step={50}
                              value={currentPoints}
                              onChange={(e) => handleFromChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 4 }}
                            />

                            {/* TO slider */}
                            <input
                              type="range"
                              min={100}
                              max={MAX_POINTS}
                              step={50}
                              value={targetPoints}
                              onChange={(e) => handleToChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 5 }}
                            />
                          </div>

                          {/* Graduation labels */}
                          <div className="relative h-5 mt-1">
                            {[0, 4500].map((mark) => {
                              const pct = (mark / MAX_POINTS) * 100;
                              return (
                                <span
                                  key={mark}
                                  className="absolute text-xs text-muted-foreground"
                                  style={{ 
                                    left: `${pct}%`, 
                                    transform: mark === 0 ? 'translateX(0)' : 'translateX(-100%)',
                                  }}
                                >
                                  {mark.toLocaleString()}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rank Labels Display */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{currentRank}</span>
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-primary font-semibold">{targetRank}</span>
                        </div>
                      </div>

                      {/* Points Delta Display */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {t("calculator.pointsToBoost")}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {t("calculator.pointsDelta", { points: (targetPoints - currentPoints).toLocaleString() })}
                          </span>
                        </div>
                      </div>

                      {/* Extra Options */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t("calculator.extraOptions")}</label>
                        <div className="space-y-4">
                            {/* Complete Missions Checkbox */}
                            <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="missions"
                                  checked={completeMissions}
                                  onChange={(e) => setCompleteMissions(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="flex-1">
                                  <label htmlFor="missions" className="text-sm font-medium cursor-pointer block mb-1">
                                    {t("calculator.missionsLabel")}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {t("calculator.missionsNotePre")}<span className="font-semibold text-primary">{t("calculator.missionsNotePrice")}</span>{t("calculator.missionsNotePost")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Platoon Checkbox */}
                            <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="platoon"
                                  checked={playWithBooster}
                                  onChange={(e) => setPlayWithBooster(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="flex-1">
                                  <label htmlFor="platoon" className="text-sm font-medium cursor-pointer block mb-1">
                                    {t("calculator.platoonLabel")}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {t("calculator.platoonNotePre")}<span className="font-semibold text-amber-500">{t("calculator.platoonNotePrice")}</span>{t("calculator.platoonNotePost")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Silver Farm Options */}
                            <div className="p-4 rounded-lg border-2 border-border bg-card/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins className="h-4 w-4 text-yellow-500" />
                                    <h4 className="text-sm font-medium">{t("calculator.silverFarmHeading")}</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {SILVER_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setSilverOption(option.id)}
                                            className={`p-2 rounded border text-center transition-all text-sm ${
                                                silverOption === option.id
                                                    ? "bg-yellow-500/10 border-yellow-500 text-foreground shadow-sm"
                                                    : "bg-background border-input hover:border-yellow-500/50"
                                            }`}
                                        >
                                            <div className="font-semibold">{option.label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {option.price > 0 ? `+$${option.price}` : t("calculator.silverNoExtra")}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("calculator.boostPriceLabel", { from: String(currentPoints), to: String(targetPoints) })}</span>
                          <span className="font-medium">${priceDetails.basePrice.toFixed(2)}</span>
                        </div>

                        {priceDetails.boosterCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.boosterChargeLabel")}</span>
                            <span className="font-medium text-amber-500">+${priceDetails.boosterCharge.toFixed(2)}</span>
                          </div>
                        )}

                        {priceDetails.silverCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.silverChargeLabel")}</span>
                            <span className="font-medium text-yellow-500">+${priceDetails.silverCharge.toFixed(2)}</span>
                          </div>
                        )}

                        {priceDetails.missionsCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("calculator.missionsChargeLabel")}</span>
                            <span className="font-medium text-primary">+${priceDetails.missionsCharge.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>{t("calculator.totalLabel")}</span>
                          <span className="text-primary">${priceDetails.total.toFixed(2)}</span>
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

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">{t("order.summaryTitle")}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryBoost")}</span>
                              <span className="font-medium">
                                {currentPoints} {t("rankStages.unit")} ({currentRank}) ➤ {targetPoints} {t("rankStages.unit")} ({targetRank})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("order.summaryType")}</span>
                              <span className="font-medium">
                                {playWithBooster ? t("order.summaryTypePlatoon") : t("order.summaryTypeShare")}
                              </span>
                            </div>
                            {silverOption !== 'none' && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t("order.summarySilverFarm")}</span>
                                  <span className="font-medium text-yellow-600">
                                    {SILVER_OPTIONS.find(o => o.id === silverOption)?.label}
                                  </span>
                                </div>
                            )}
                            {completeMissions && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t("order.summaryMissions")}</span>
                                  <span className="font-medium text-primary">{t("order.summaryMissionsValue")}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-muted-foreground">{t("order.summaryTotalCost")}</span>
                              <span className="font-bold text-primary text-lg">${priceDetails.total.toFixed(2)}</span>
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
                              {t("order.submit", { price: priceDetails.total.toFixed(2) })}
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

        {/* Season Rewards Section */}
        <section className="py-16 bg-gradient-to-b from-red-900/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t("seasonRewards.heading")}</h2>
                <p className="text-muted-foreground">{t("seasonRewards.subheading")}</p>
              </div>

              {/* Rank Rewards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="border-gray-500/30 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-400">{t("seasonRewards.iron.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.iron.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.iron.items").map((item: string, i: number) => (
                      <p key={i}>• {item}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-amber-700/30 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-600">{t("seasonRewards.bronze.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.bronze.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.bronze.items").map((item: string, i: number) => (
                      <p key={i}>• {item}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-gray-300/30 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-300">{t("seasonRewards.silver.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.silver.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.silver.items").map((item: string, i: number) => (
                      <p key={i}>• {item}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-yellow-500/30 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-yellow-500">{t("seasonRewards.gold.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.gold.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.gold.items").map((item: string, i: number) => (
                      <p key={i}>• {i === 2 ? <span className="text-yellow-500 font-semibold">{item}</span> : item}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-purple-500/30 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-purple-400">{t("seasonRewards.champion.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.champion.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.champion.items").map((item: string, i: number) => (
                      <p key={i}>• {item}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-red-500/50 bg-gradient-to-br from-red-500/10 to-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-400">{t("seasonRewards.legend.title")}</CardTitle>
                    <CardDescription>{t("seasonRewards.legend.range")}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {t.raw("seasonRewards.legend.items").map((item: string, i: number) => (
                      <p key={i}>• {i === 0 ? <span className="text-red-400 font-semibold">{item}</span> : item}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Annual Reward - Ashbringer */}
              <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-amber-500" />
                    <div>
                      <CardTitle className="text-2xl">{t("seasonRewards.annual.title")}</CardTitle>
                      <CardDescription>{t("seasonRewards.annual.subtitle")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-amber-400">{t("seasonRewards.annual.tankHeading")}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("seasonRewards.annual.tankBody")}
                      </p>
                      <ul className="text-sm space-y-1">
                        {t.raw("seasonRewards.annual.tankItems").map((item: string, i: number) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-amber-400">{t("seasonRewards.annual.missionsHeading")}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("seasonRewards.annual.missionsBody")}
                      </p>
                      <ul className="text-sm space-y-1">
                        {t.raw("seasonRewards.annual.missionsItems").map((item: string, i: number) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("features.heading")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.rewardsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.rewardsBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Swords className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.playersTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.playersBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.guaranteeTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.guaranteeBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.prestigeTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.prestigeBody")}</p>
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
