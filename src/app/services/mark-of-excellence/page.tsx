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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useOrderSubmit } from "@/hooks/useOrderSubmit"

const TANK_DIFFICULTIES = [
  { id: "easy", name: "Easy", multiplier: 0 },
  { id: "hard", name: "All Tier XI or Tier X", multiplier: 0.3 },
  { id: "spg", name: "SPG", multiplier: 0.5 },
] as const;

const SPECIAL_VEHICLES = [
  { id: "black-rock", name: "Black Rock Reward Tank", fee: 0.3 },
  { id: "vz-60s", name: "Vz 60S Dravec Reward Tank", fee: 0.3 },
  { id: "hurricane", name: "Hurricane", fee: 0.3 },
  { id: "chrysler", name: "Chrysler MTC Tier VIII", fee: 0.2 },
  { id: "sfac", name: "SFAC 105 Tier VIII", fee: 0.2 },
  { id: "grom", name: "Grom Tier VIII", fee: 0.2 },
  { id: "bourrasque", name: "Bourrasque Tier VIII", fee: 0.2 },
  { id: "prototipo", name: "Prototipo 6", fee: 0.2 },
  { id: "bz-176", name: "BZ-176", fee: 0.2 },
  { id: "projekt-ion", name: "Projekt ION", fee: 0.2 },
  { id: "titt", name: "TITT", fee: 0.2 },
  { id: "skoda", name: "Skoda T56", fee: 0.2 },
  { id: "chimera", name: "Chimera", fee: 0.2 },
  { id: "elc", name: "ELC EVEN 90", fee: 0.2 },
  { id: "alembic", name: "Alembic", fee: 0.2 },
  { id: "type-59", name: "Type 59 & 59 G", fee: 0.2 },
  { id: "udarny", name: "Udarny Tier VIII", fee: 0.2 },
  { id: "charlemagne", name: "Charlemagne Tier VIII", fee: 0.2 },
  { id: "miel", name: "Miel Tier VIII", fee: 0.2 },
] as const;

const SILVER_OPTIONS = [
  { id: "none", name: "None", addon: 0 },
  { id: "10m", name: "10M Credits", addon: 45.86 },
  { id: "20m", name: "20M Credits", addon: 81.13 },
] as const;

const PRICE_BANDS = [
  { min: 1, max: 20, rate: 0.3 },
  { min: 20, max: 50, rate: 0.3983333333333333 },
  { min: 50, max: 65, rate: 0.5 },
  { min: 65, max: 85, rate: 1.5 },
  { min: 85, max: 95, rate: 3.5 },
] as const;

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
});

function calculateBasePrice(from: number, to: number): number {
  let basePrice = 0;
  for (const band of PRICE_BANDS) {
    const bandStart = Math.max(from, band.min);
    const bandEnd = Math.min(to, band.max);
    if (bandStart < bandEnd) basePrice += (bandEnd - bandStart) * band.rate;
  }
  return basePrice;
}

export default function MarkOfExcellencePage() {
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

  const priceDetails = useMemo(() => {
    const delta = Math.max(0, toProgress - fromProgress);
    if (delta === 0) return { base: 0, total: 0 };

    const basePrice = calculateBasePrice(fromProgress, toProgress);

    let finalMultiplier = 1;
    if (specialVehicle) {
      const vehicleFee =
        SPECIAL_VEHICLES.find((v) => v.id === specialVehicle)?.fee || 0;
      finalMultiplier = 1 + vehicleFee;
    } else if (difficulty) {
      const difficultyMult =
        TANK_DIFFICULTIES.find((d) => d.id === difficulty)?.multiplier || 0;
      finalMultiplier = 1 + difficultyMult;
    }

    const silverAddon =
      SILVER_OPTIONS.find((s) => s.id === silverOption)?.addon || 0;

    const total = basePrice * finalMultiplier + silverAddon;

    return {
      base: Math.round(basePrice * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [fromProgress, toProgress, difficulty, specialVehicle, silverOption]);

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
                  Mark of Excellence
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Achieve your desired Mark of Excellence percentage with our
                professional boosting service. Select your current and target
                progress, tank difficulty, and additional options.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm">1% - 95% Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm">Any Tank</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    From $0.30/point
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
                Calculate now
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
                  <h2 className="text-3xl font-bold">Price Calculator</h2>
                </div>
                <p className="text-muted-foreground">
                  Configure your boost parameters and get instant pricing
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calculator Controls */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle>Progress Selection</CardTitle>
                      <CardDescription>
                        Choose your current and target MoE percentage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Range Selector */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">From:</label>
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
                            <label className="text-sm font-medium">To:</label>
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
                            Progress to boost:
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
                      <CardTitle>Tank Difficulty</CardTitle>
                      <CardDescription>
                        Select the difficulty of your tank (disabled if Special
                        Vehicle is selected)
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
                                ? "No fee"
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
                          <CardTitle>Special Vehicle Fee (Optional)</CardTitle>
                          <CardDescription className="mt-1.5">
                            Select your tank from the list (replaces Tank
                            Difficulty)
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
                            Unselect
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
                        <option value="">Select your tank...</option>
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
                      <CardTitle>Silver Farming Options</CardTitle>
                      <CardDescription>
                        To complete this service, your account needs Credits. If
                        you're low on credits, you can order farming together
                        with Mark of Excellence at a discount.
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
                      <CardTitle className="text-xl">Price Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">
                            {fromProgress}% → {toProgress}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Boost:</span>
                          <span className="font-medium text-primary">
                            {toProgress - fromProgress}%
                          </span>
                        </div>
                        {selectedDifficulty && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Difficulty:
                            </span>
                            <span className="font-medium">
                              {selectedDifficulty.name}
                            </span>
                          </div>
                        )}
                        {selectedVehicle && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium text-xs">
                              {selectedVehicle.name}
                            </span>
                          </div>
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Silver:
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
                            Base price:
                          </span>
                          <span>${priceDetails.base.toFixed(2)}</span>
                        </div>
                        {specialVehicle ? (
                          selectedVehicle && (
                            <div className="flex justify-between text-sm text-orange-400">
                              <span>Vehicle Fee:</span>
                              <span>
                                +{(selectedVehicle.fee * 100).toFixed(0)}%
                              </span>
                            </div>
                          )
                        ) : (
                          selectedDifficulty &&
                          selectedDifficulty.multiplier > 0 && (
                            <div className="flex justify-between text-sm text-orange-400">
                              <span>Difficulty:</span>
                              <span>
                                +{(selectedDifficulty.multiplier * 100).toFixed(0)}%
                              </span>
                            </div>
                          )
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between text-sm text-blue-400">
                            <span>Silver Add-on:</span>
                            <span>+${selectedSilver.addon.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
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
                        Continue to Order
                      </Button>

                      {!specialVehicle && !difficulty && (
                        <p className="text-xs text-center text-muted-foreground">
                          Please select a special vehicle or tank difficulty to
                          continue
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
                    Complete Your Order
                  </CardTitle>
                  <CardDescription>
                    Fill in your details to finalize your MoE boost order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
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
                        Discord Tag *
                      </label>
                      <Input
                        id="discordTag"
                        placeholder="Username#1234"
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
                        Server *
                      </label>
                      <select
                        id="server"
                        {...form.register("server")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select server...</option>
                        <option value="na">North America</option>
                        <option value="eu">Europe</option>
                        <option value="asia">Asia</option>
                        <option value="ru">Russia</option>
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
                        Additional Information (Optional)
                      </label>
                      <textarea
                        id="additionalInfo"
                        {...form.register("additionalInfo")}
                        rows={4}
                        placeholder="Any special requests or notes..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>

                    <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-semibold mb-2">
                        Order Summary:
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Service:
                          </span>
                          <span className="font-medium">Mark of Excellence</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">
                            {fromProgress}% → {toProgress}%
                          </span>
                        </div>
                        {!specialVehicle && difficulty && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Difficulty:
                            </span>
                            <span className="font-medium">
                              {selectedDifficulty?.name}
                            </span>
                          </div>
                        )}
                        {selectedVehicle && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <span className="font-medium text-xs">
                              {selectedVehicle.name}
                            </span>
                          </div>
                        )}
                        {selectedSilver && selectedSilver.addon > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Silver:
                            </span>
                            <span className="font-medium">
                              {selectedSilver.name}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Price:</span>
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
                          Sending Order...
                        </>
                      ) : (
                        "Place Order"
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
