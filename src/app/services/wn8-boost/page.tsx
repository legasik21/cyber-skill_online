"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Target, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"

// Service types
type ServiceType = "wn8" | "winrate" | "damage"

// Pricing per battle based on WN8 tier
const WN8_PRICING = {
  "2500-3000": 1.1,  // $1.1 per battle
  "3000-4000": 1.5,  // $1.5 per battle
  "4000+": 1.8,      // $1.8 per battle
}

// Winrate boosting pricing
const WINRATE_PRICING = {
  "60%": 1.0,   // $1 per battle
  "65%": 1.5,   // $1 + 50% = $1.5 per battle
  "70%": 2.5,   // $1 + 150% = $2.5 per battle
}

// High Damage pricing
const DAMAGE_PRICING = {
  "4000+": 1.75, // $1.75 per battle
  "4500+": 2.0,  // $2 per battle
  "5000+": 2.5,  // $2.5 per battle
}

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  serviceType: z.enum(["wn8", "winrate", "damage"], { message: "Please select a service type" }),
  tier: z.string().min(1, { message: "Please select a tier" }),
  numberOfBattles: z.number().min(20, { message: "Minimum 20 battles required" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
  playSPG: z.boolean().optional(),
  getReplays: z.boolean().optional(),
})

export default function WN8BoostPage() {
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [serviceType, setServiceType] = useState<ServiceType>("wn8")
  const [numberOfBattles, setNumberOfBattles] = useState<number | "">(20)
  const [selectedTier, setSelectedTier] = useState<string>("2500-3000")
  const [playSPG, setPlaySPG] = useState<boolean>(false)
  const [getReplays, setGetReplays] = useState<boolean>(false)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      serviceType: "wn8",
      tier: "2500-3000",
      numberOfBattles: 20,
      server: "",
      additionalInfo: "",
      playSPG: false,
      getReplays: false,
    },
  })

  // Reset playSPG when switching to tiers where it's not available
  useEffect(() => {
    const isSPGAvailable = 
      (serviceType === "wn8" && (selectedTier === "2500-3000" || selectedTier === "3000-4000")) ||
      (serviceType === "winrate" && selectedTier === "60%")
    
    if (!isSPGAvailable && playSPG) {
      setPlaySPG(false)
    }
  }, [serviceType, selectedTier, playSPG])

  // Calculate pricing whenever battles, service type, or tier changes
  useEffect(() => {
    const battles = numberOfBattles === "" ? 0 : numberOfBattles
    
    if (battles < 20) {
      setBasePrice(0)
      setDiscount(0)
      setFinalPrice(0)
      return
    }

    let pricePerBattle = 0
    
    // Get base price based on service type
    if (serviceType === "wn8") {
      pricePerBattle = WN8_PRICING[selectedTier as keyof typeof WN8_PRICING] || 0
      // Apply SPG modifier (+100% for tiers 2500-3000 and 3000-4000 only)
      if (playSPG && (selectedTier === "2500-3000" || selectedTier === "3000-4000")) {
        pricePerBattle = pricePerBattle * 2
      }
    } else if (serviceType === "winrate") {
      pricePerBattle = WINRATE_PRICING[selectedTier as keyof typeof WINRATE_PRICING] || 0
      // Apply SPG modifier (+100% for 60% winrate only)
      if (playSPG && selectedTier === "60%") {
        pricePerBattle = pricePerBattle * 2
      }
    } else if (serviceType === "damage") {
      pricePerBattle = DAMAGE_PRICING[selectedTier as keyof typeof DAMAGE_PRICING] || 0
      // No SPG modifier for damage service type
    }
    
    const base = battles * pricePerBattle
    
    let discountPercent = 0
    if (battles >= 100) {
      discountPercent = 20
    } else if (battles >= 50) {
      discountPercent = 15
    }
    
    const discountAmount = base * (discountPercent / 100)
    let final = base - discountAmount
    
    // Apply "Get the Replays" option (+10% to total)
    if (getReplays) {
      final = final * 1.1
    }
    
    setBasePrice(base)
    setDiscount(discountPercent)
    setFinalPrice(final)
  }, [numberOfBattles, selectedTier, playSPG, getReplays, serviceType])

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'wn8',
      message: values.additionalInfo,
      page: 'WN8, Winrate, High Damage Service',
      orderDetails: {
        serviceType: serviceType.toUpperCase(),
        tier: selectedTier,
        battles: numberOfBattles,
        server: values.server,
        playSPG: playSPG ? 'Yes (+100%)' : 'No',
        getReplays: getReplays ? 'Yes (+10%)' : 'No',
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
                Back to Home
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  WN8, Winrate, High Damage Service
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Professional boosting to elevate your WN8 rating through expertly played battles
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Your Price
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
                        <CardTitle className="text-2xl">Price Calculator</CardTitle>
                      </div>
                      <CardDescription>Configure your boost and see the price instantly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Service Type Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Service Type</label>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/30 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setServiceType("wn8")
                              setSelectedTier("2500-3000")
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              serviceType === "wn8"
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            WN8
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setServiceType("winrate")
                              setSelectedTier("60%")
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              serviceType === "winrate"
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Winrate
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setServiceType("damage")
                              setSelectedTier("4000+")
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              serviceType === "damage"
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            High Damage
                          </button>
                        </div>
                      </div>

                      {/* Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {serviceType === "wn8" && "Target WN8 Tier"}
                          {serviceType === "winrate" && "Target Winrate"}
                          {serviceType === "damage" && "Target Damage"}
                        </label>
                        <div className="space-y-2">
                          {serviceType === "wn8" && Object.entries(WN8_PRICING).map(([tier, price]) => (
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
                                  <div className="font-semibold text-lg">{tier} WN8</div>
                                  <div className="text-sm text-muted-foreground">${price} per battle</div>
                                </div>
                                {selectedTier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                          
                          {serviceType === "winrate" && Object.entries(WINRATE_PRICING).map(([tier, price]) => (
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
                                  <div className="font-semibold text-lg">{tier} Winrate</div>
                                  <div className="text-sm text-muted-foreground">${price} per battle</div>
                                </div>
                                {selectedTier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                          
                          {serviceType === "damage" && Object.entries(DAMAGE_PRICING).map(([tier, price]) => (
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
                                  <div className="font-semibold text-lg">{tier} DMG</div>
                                  <div className="text-sm text-muted-foreground">${price} per battle</div>
                                </div>
                                {selectedTier === tier && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of Battles */}
                      <div>
                        <label htmlFor="battles" className="text-sm font-medium mb-2 block">
                          Number of Battles
                        </label>
                        <Input
                          id="battles"
                          type="number"
                          value={numberOfBattles}
                          onFocus={() => setNumberOfBattles("")}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "") {
                              setNumberOfBattles("")
                            } else {
                              setNumberOfBattles(parseInt(val) || 0)
                            }
                          }}
                          className="text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="Enter number of battles"
                        />
                        {numberOfBattles !== "" && numberOfBattles < 20 && numberOfBattles > 0 && (
                          <p className="text-sm text-red-500 mt-1">20 is a minimum number of battles</p>
                        )}
                      </div>

                      {/* Additional Options */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium block">Additional Options</label>
                        
                        {/* Play on SPG Option */}
                        {((serviceType === "wn8" && (selectedTier === "2500-3000" || selectedTier === "3000-4000")) || (serviceType === "winrate" && selectedTier === "60%")) && (
                          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                            <input
                              type="checkbox"
                              id="playSPG"
                              checked={playSPG}
                              onChange={(e) => setPlaySPG(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="playSPG" className="flex-1 cursor-pointer">
                              <div className="font-medium text-sm">Play on SPG (Artillery)</div>
                              <div className="text-xs text-muted-foreground">+100% to base price</div>
                            </label>
                          </div>
                        )}

                        
                        {/* Get Replays Option */}
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                          <input
                            type="checkbox"
                            id="getReplays"
                            checked={getReplays}
                            onChange={(e) => setGetReplays(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="getReplays" className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">Get the Replays</div>
                            <div className="text-xs text-muted-foreground">+10% to total cost</div>
                          </label>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>
                        
                        {playSPG && ((serviceType === "wn8" && (selectedTier === "2500-3000" || selectedTier === "3000-4000")) || (serviceType === "winrate" && selectedTier === "60%")) && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">SPG Modifier included</span>
                            <span className="font-medium text-blue-500">+100%</span>
                          </div>
                        )}
                        
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Percent className="h-4 w-4 text-green-500" />
                              Discount ({discount}%):
                            </span>
                            <span className="font-medium text-green-500">-${(basePrice * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                        
                        {getReplays && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Get Replays</span>
                            <span className="font-medium text-blue-500">+10%</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>Total:</span>
                          <span className="text-primary">${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Discount Tiers Info */}
                      <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-semibold mb-2">💰 Volume Discounts:</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>50-99 battles: <strong className="text-foreground">15% OFF</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>100+ battles: <strong className="text-foreground">20% OFF</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Security Badge */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>100% secure with VPN protection and privacy guaranteed</span>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Order Form */}
                <div>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-2xl">Complete Your Order</CardTitle>
                      <CardDescription>Fill in your details to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Email */}
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">Email Address *</label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            {...form.register("email")}
                            className="bg-background"
                          />
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                          )}
                        </div>

                        {/* Discord Tag */}
                        <div className="space-y-2">
                          <label htmlFor="discordTag" className="text-sm font-medium">Discord Tag *</label>
                          <Input
                            id="discordTag"
                            placeholder="Username#1234"
                            {...form.register("discordTag")}
                            className="bg-background"
                          />
                          {form.formState.errors.discordTag && (
                            <p className="text-sm text-red-500">{form.formState.errors.discordTag.message}</p>
                          )}
                        </div>

                        {/* Server */}
                        <div className="space-y-2">
                          <label htmlFor="server" className="text-sm font-medium">Server *</label>
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
                            <p className="text-sm text-red-500">{form.formState.errors.server.message}</p>
                          )}
                        </div>

                        {/* Hidden fields that sync with calculator */}
                        <input type="hidden" {...form.register("serviceType")} value={serviceType} />
                        <input type="hidden" {...form.register("tier")} value={selectedTier} />
                        <input type="hidden" {...form.register("numberOfBattles", { valueAsNumber: true })} value={numberOfBattles === "" ? 0 : numberOfBattles} />
                        <input type="hidden" {...form.register("playSPG")} value={playSPG.toString()} />
                        <input type="hidden" {...form.register("getReplays")} value={getReplays.toString()} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">Order Summary:</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service Type:</span>
                              <span className="font-medium">{serviceType.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tier:</span>
                              <span className="font-medium">{selectedTier}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Battles:</span>
                              <span className="font-medium">{numberOfBattles}</span>
                            </div>
                            {playSPG && ((serviceType === "wn8" && (selectedTier === "2500-3000" || selectedTier === "3000-4000")) || (serviceType === "winrate" && selectedTier === "60%")) && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Play on SPG:</span>
                                <span className="font-medium text-blue-500">Yes (+100%)</span>
                              </div>
                            )}
                            {getReplays && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Get Replays:</span>
                                <span className="font-medium text-blue-500">Yes (+10%)</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-muted-foreground">Total Cost:</span>
                              <span className="font-bold text-primary text-lg">${finalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2">
                          <label htmlFor="additionalInfo" className="text-sm font-medium">Additional Information (Optional)</label>
                          <textarea
                            id="additionalInfo"
                            {...form.register("additionalInfo")}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Any specific requirements or preferences..."
                          />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending Order...
                            </>
                          ) : (
                            <>
                              Submit Order - ${finalPrice.toFixed(2)}
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          By submitting this form, you agree to our Terms of Service and Privacy Policy. 
                          We&apos;ll contact you within 30 minutes to confirm your order.
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
              <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Our Service?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">100% Secure</h3>
                    <p className="text-sm text-muted-foreground">VPN protection, encrypted connections, and complete privacy guaranteed.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Expert Boosters</h3>
                    <p className="text-sm text-muted-foreground">Only top 0.1% players (3500+ WN8) handle your account.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Progress Tracking</h3>
                    <p className="text-sm text-muted-foreground">Real-time updates on completed battles and WN8 progress.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Volume Discounts</h3>
                    <p className="text-sm text-muted-foreground">Save up to 20% when ordering 100+ battles.</p>
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
              <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      1
                    </div>
                    <CardTitle className="text-lg">Select Your Target</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Choose your desired WN8 tier and the number of battles you want us to play on your account.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <CardTitle className="text-lg">Expert Plays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Our professional boosters (WN8 3500+) play the specified number of battles achieving your target WN8.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <CardTitle className="text-lg">Enjoy Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Your WN8 rating improves to the target level. Track progress in real-time and enjoy your new stats!
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
