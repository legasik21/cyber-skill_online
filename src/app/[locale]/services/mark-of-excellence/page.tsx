// app/services/moe/MarkOfExcellencePage.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Award,
  ChevronRight,
  Calculator,
  Target,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import {
  TANK_DIFFICULTIES,
  SPECIAL_VEHICLES,
  SILVER_OPTIONS,
  priceMarkOfExcellence,
} from "@/lib/pricing/mark-of-excellence";

export default function MarkOfExcellencePage() {
  const t = useTranslations("markOfExcellence");
  const orderFormSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("errors.email") }),
        discordTag: z.string().min(3, { message: t("errors.discord") }),
        server: z.string().min(1, { message: t("errors.server") }),
        additionalInfo: z.string().optional(),
      }),
    [t]
  );
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [fromProgress, setFromProgress] = useState(1);
  const [toProgress, setToProgress] = useState(95);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [specialVehicle, setSpecialVehicle] = useState<string>("");
  const [silverOption, setSilverOption] = useState<string>("none");

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      server: "",
      additionalInfo: "",
    },
  });

  const priceDetails = useMemo(
    () =>
      priceMarkOfExcellence({
        fromProgress,
        toProgress,
        difficulty,
        specialVehicle,
        silverOption,
      }),
    [fromProgress, toProgress, difficulty, specialVehicle, silverOption]
  );

  // Safe handlers
  const handleFromChange = (val: number) => {
    const v = Number.isFinite(val) ? val : 1;
    const newFrom = Math.max(1, Math.min(94, v));
    // гарантируем from < to
    const maybeTo = newFrom >= toProgress ? Math.min(95, newFrom + 1) : toProgress;
    setToProgress(maybeTo);
    setFromProgress(newFrom);
  };

  const handleToChange = (val: number) => {
    const v = Number.isFinite(val) ? val : 95;
    const newTo = Math.max(2, Math.min(95, v));
    // гарантируем from < to
    const maybeFrom =
      newTo <= fromProgress ? Math.max(1, newTo - 1) : fromProgress;
    setFromProgress(maybeFrom);
    setToProgress(newTo);
  };

  // Filled segment position for visualization
  const leftPct = ((fromProgress - 1) / 94) * 100;
  const rightPct = ((95 - toProgress) / 94) * 100;

  const selectedDifficulty = TANK_DIFFICULTIES.find((d) => d.id === difficulty);
  const selectedVehicle = SPECIAL_VEHICLES.find((v) => v.id === specialVehicle);
  const selectedSilver = SILVER_OPTIONS.find((s) => s.id === silverOption);

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'mark-of-excellence',
      message: values.additionalInfo,
      page: 'Mark of Excellence',
      orderDetails: {
          progress: `${fromProgress}% → ${toProgress}%`,
          difficulty: difficulty ? TANK_DIFFICULTIES.find(d => d.id === difficulty)?.name : 'None',
          specialVehicle: specialVehicle ? SPECIAL_VEHICLES.find(v => v.id === specialVehicle)?.name : 'None',
          silverOption: silverOption ? SILVER_OPTIONS.find(s => s.id === silverOption)?.name : 'None',
          server: values.server,
          basePrice: `$${priceDetails.base.toFixed(2)}`,
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
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {t("hero.description")}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t("hero.progressBadge")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t("hero.anyTank")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {t("hero.fromPrice")}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() =>
                  document
                    .getElementById("calculator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {t("hero.calculateNow")}
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
                      <CardTitle>{t("calculator.progress.title")}</CardTitle>
                      <CardDescription>
                        {t("calculator.progress.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Range Selector */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("calculator.progress.from")}</label>
                            <input
                              type="number"
                              min={1}
                              max={94}
                              key={`from-${fromProgress}`}
                              defaultValue={fromProgress}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > 94) val = 94;
                                handleFromChange(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-16 h-10 text-center bg-background text-sm rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-sm font-medium">%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("calculator.progress.to")}</label>
                            <input
                              type="number"
                              min={2}
                              max={95}
                              key={`to-${toProgress}`}
                              defaultValue={toProgress}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 2) val = 2;
                                if (val > 95) val = 95;
                                handleToChange(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-16 h-10 text-center bg-background text-sm rounded-md border border-input px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-sm font-medium">%</span>
                          </div>
                        </div>

                        {/* Dual Range Slider */}
                        <div className="relative pt-1 pb-2">
                          {/* Graduation labels */}
                          <div className="relative h-5 mb-1">
                            {[1, 50, 65, 85, 95].map((mark) => {
                              const pct = ((mark - 1) / (95 - 1)) * 100;
                              return (
                                <span
                                  key={mark}
                                  className="absolute text-xs text-muted-foreground"
                                  style={{ 
                                    left: `${pct}%`, 
                                    transform: 'translateX(-50%)',
                                  }}
                                >
                                  {mark}%
                                </span>
                              );
                            })}
                          </div>

                          <div className="relative h-6">
                            {/* Track background */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-secondary rounded-full" />
                            
                            {/* Graduation tick marks */}
                            {[1, 50, 65, 85, 95].map((mark) => {
                              const pct = ((mark - 1) / (95 - 1)) * 100;
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
                              min={1}
                              max={94}
                              step={1}
                              value={fromProgress}
                              onChange={(e) => handleFromChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 4 }}
                            />

                            {/* TO slider */}
                            <input
                              type="range"
                              min={2}
                              max={95}
                              step={1}
                              value={toProgress}
                              onChange={(e) => handleToChange(parseInt(e.target.value, 10))}
                              className="dual-range-slider absolute w-full h-6 top-0 left-0"
                              style={{ zIndex: 5 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Progress Delta Display */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {t("calculator.progress.toBoost")}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {toProgress - fromProgress}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tank Difficulty */}
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle>{t("calculator.difficulty.title")}</CardTitle>
                      <CardDescription>
                        {t("calculator.difficulty.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {TANK_DIFFICULTIES.map((diff) => (
                          <button
                            key={diff.id}
                            type="button"
                            disabled={!!specialVehicle}
                            onClick={() => setDifficulty(diff.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              specialVehicle
                                ? "opacity-50 cursor-not-allowed bg-secondary/30 text-muted-foreground border-border"
                                : difficulty === diff.id
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                : "bg-card hover:bg-primary/10 text-foreground border-primary/30 hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {diff.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {diff.multiplier === 0
                                ? t("calculator.difficulty.noFee")
                                : `+${(diff.multiplier * 100).toFixed(0)}%`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Special Vehicle (Optional) */}
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{t("calculator.specialVehicle.title")}</CardTitle>
                          <CardDescription className="mt-1.5">
                            {t("calculator.specialVehicle.description")}
                          </CardDescription>
                        </div>
                        {specialVehicle && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSpecialVehicle("");
                              setDifficulty("easy");
                            }}
                            className="text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            {t("calculator.specialVehicle.unselect")}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <select
                        value={specialVehicle}
                        onChange={(e) => {
                          setSpecialVehicle(e.target.value);
                          if (e.target.value) setDifficulty("");
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">{t("calculator.specialVehicle.selectPlaceholder")}</option>
                        {SPECIAL_VEHICLES.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} (+{(vehicle.fee * 100).toFixed(0)}%)
                          </option>
                        ))}
                      </select>
                    </CardContent>
                  </Card>

                  {/* Silver Farming Options */}
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle>{t("calculator.silver.title")}</CardTitle>
                      <CardDescription>
                        {t("calculator.silver.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {SILVER_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSilverOption(option.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              silverOption === option.id
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                : "bg-card hover:bg-primary/10 text-foreground border-primary/30 hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {option.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {option.addon === 0
                                ? "—"
                                : `+$${option.addon.toFixed(2)}`}
                            </div>
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
                      <CardTitle className="text-xl">{t("calculator.summary.title")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("calculator.summary.progress")}
                          </span>
                          <span className="font-medium">
                            {fromProgress}% → {toProgress}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("calculator.summary.boost")}</span>
                          <span className="font-medium text-primary">
                            {toProgress - fromProgress}%
                          </span>
                        </div>
                        {selectedDifficulty && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("calculator.summary.difficulty")}
                            </span>
                            <span className="font-medium">
                              {selectedDifficulty.name}
                            </span>
                          </div>
                        )}
                        {selectedVehicle && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("calculator.summary.vehicle")}
                            </span>
                            <span className="font-medium text-xs">
                              {selectedVehicle.name}
                            </span>
                          </div>
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("calculator.summary.silver")}
                            </span>
                            <span className="font-medium">
                              {selectedSilver.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("calculator.summary.basePrice")}
                          </span>
                          <span>${priceDetails.base.toFixed(2)}</span>
                        </div>
                        {specialVehicle ? (
                          selectedVehicle && (
                            <div className="flex justify-between text-sm text-orange-400">
                              <span>{t("calculator.summary.vehicleFee")}</span>
                              <span>
                                +{(selectedVehicle.fee * 100).toFixed(0)}%
                              </span>
                            </div>
                          )
                        ) : (
                          selectedDifficulty &&
                          selectedDifficulty.multiplier > 0 && (
                            <div className="flex justify-between text-sm text-orange-400">
                              <span>{t("calculator.summary.difficulty")}</span>
                              <span>
                                +{(selectedDifficulty.multiplier * 100).toFixed(0)}%
                              </span>
                            </div>
                          )
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between text-sm text-blue-400">
                            <span>{t("calculator.summary.silverAddon")}</span>
                            <span>+${selectedSilver.addon.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{t("calculator.summary.total")}</span>
                          <span className="text-3xl font-bold text-primary">
                            ${priceDetails.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={
                          (!specialVehicle && !difficulty) ||
                          priceDetails.total === 0
                        }
                        onClick={() =>
                          document
                            .getElementById("order-form")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        }
                      >
                        {t("calculator.summary.continueToOrder")}
                      </Button>

                      {!specialVehicle && !difficulty && (
                        <p className="text-xs text-center text-muted-foreground">
                          {t("calculator.summary.selectHint")}
                        </p>
                      )}
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
                  <CardTitle className="text-2xl">
                    {t("orderForm.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("orderForm.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        {t("orderForm.emailLabel")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("orderForm.emailPlaceholder")}
                        {...form.register("email")}
                        className="bg-background"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="discordTag"
                        className="text-sm font-medium"
                      >
                        {t("orderForm.discordLabel")}
                      </label>
                      <Input
                        id="discordTag"
                        placeholder={t("orderForm.discordPlaceholder")}
                        {...form.register("discordTag")}
                        className="bg-background"
                      />
                      {form.formState.errors.discordTag && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.discordTag.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="server" className="text-sm font-medium">
                        {t("orderForm.serverLabel")}
                      </label>
                      <select
                        id="server"
                        {...form.register("server")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">{t("orderForm.serverPlaceholder")}</option>
                        <option value="na">{t("orderForm.serverNa")}</option>
                        <option value="eu">{t("orderForm.serverEu")}</option>
                        <option value="asia">{t("orderForm.serverAsia")}</option>
                        <option value="ru">{t("orderForm.serverRu")}</option>
                      </select>
                      {form.formState.errors.server && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.server.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="additionalInfo"
                        className="text-sm font-medium"
                      >
                        {t("orderForm.additionalInfoLabel")}
                      </label>
                      <textarea
                        id="additionalInfo"
                        {...form.register("additionalInfo")}
                        rows={4}
                        placeholder={t("orderForm.additionalInfoPlaceholder")}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>

                    <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-semibold mb-2">
                        {t("orderForm.summaryTitle")}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("orderForm.service")}
                          </span>
                          <span className="font-medium">{t("orderForm.serviceName")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("orderForm.progress")}
                          </span>
                          <span className="font-medium">
                            {fromProgress}% → {toProgress}%
                          </span>
                        </div>
                        {!specialVehicle && difficulty && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("orderForm.difficulty")}
                            </span>
                            <span className="font-medium">
                              {selectedDifficulty?.name}
                            </span>
                          </div>
                        )}
                        {selectedVehicle && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("orderForm.vehicle")}
                            </span>
                            <span className="font-medium text-xs">
                              {selectedVehicle.name}
                            </span>
                          </div>
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t("orderForm.silver")}
                            </span>
                            <span className="font-medium">
                              {selectedSilver.name}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{t("orderForm.totalPrice")}</span>
                            <span className="text-xl font-bold text-primary">
                              ${priceDetails.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={
                        (!specialVehicle && !difficulty) ||
                        priceDetails.total === 0 || 
                        isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("orderForm.sending")}
                        </>
                      ) : (
                        t("orderForm.placeOrder")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
