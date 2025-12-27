"use client"

import { useState, useEffect } from "react"
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
import Link from "next/link"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"

// Pricing per 10,000 XP based on WN8 tier
const EXP_PRICING = {
  "under-2500": 3.0,    // $3 per 10k XP for Under 2500 WN8
  "over-2500": 4.5,     // $4.5 per 10k XP for More than 2500 WN8
}

const WN8_TIER_LABELS = {
  "under-2500": "Under 2500 WN8",
  "over-2500": "More than 2500 WN8",
}

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  wn8Tier: z.enum(["under-2500", "over-2500"], { message: "Please select a WN8 tier" }),
  cannotUseXPBoosters: z.boolean(),
  expAmount: z.number().min(10, { message: "Minimum 10k XP required" }), // Minimum 10k
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
})

export default function ExpFarmPage() {
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [expAmount, setExpAmount] = useState<number | "">(50) // Default 50k
  const [selectedWN8Tier, setSelectedWN8Tier] = useState<keyof typeof EXP_PRICING>("under-2500")
  const [cannotUseXPBoosters, setCannotUseXPBoosters] = useState<boolean>(false)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [xpBoostersCharge, setXpBoostersCharge] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

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

    const pricePer10k = EXP_PRICING[selectedWN8Tier]
    // amount is in thousands (e.g. 50 = 50,000 XP)
    // Pricing is per 10k, so we divide amount by 10
    const unitsOf10k = amount / 10
    const base = unitsOf10k * pricePer10k
    
    let discountPercent = 0
    if (amount >= 500) { // 500k XP
      discountPercent = 20
    } else if (amount >= 250) { // 250k XP
      discountPercent = 15
    } else if (amount >= 100) { // 100k XP
      discountPercent = 10
    }
    
    const discountAmount = base * (discountPercent / 100)
    const afterDiscount = base - discountAmount
    
    // Calculate XP boosters charge
    let boostersCharge = 0
    if (cannotUseXPBoosters) {
      boostersCharge = afterDiscount * 0.30 // 30% additional charge
    }
    
    const final = afterDiscount + boostersCharge
    
    setBasePrice(base)
    setDiscount(discountPercent)
    setXpBoostersCharge(boostersCharge)
    setFinalPrice(final)
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
                Back to Home
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Experience (XP) Farming
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Level up your tanks and unlock new tiers faster with our professional XP farming service
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
                      <CardDescription>Configure your XP order and see costs instantly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* WN8 Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Package Tier</label>
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
                                  <div className="text-sm text-muted-foreground">${price} per 10k XP</div>
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
                        <label className="text-sm font-medium mb-3 block">XP Boosters (Personal Reserves)</label>
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
                                Dont use my XP Boosters
                              </label>
                              <p className="text-xs text-muted-foreground">
                                If we can't use your own Personal Reserves (XP Boosters), the price will be <span className="font-semibold text-amber-500">30% more</span>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* XP Amount */}
                      <div>
                        <label htmlFor="xp" className="text-sm font-medium mb-2 block">
                          XP Amount (in thousands)
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
                          placeholder="e.g. 50 for 50,000 XP"
                        />
                        {expAmount !== "" && expAmount < 10 && expAmount >= 0 && (
                          <p className="text-sm text-red-500 mt-1">10k XP is the minimum (enter 10)</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter 50 for 50,000 XP, 100 for 100,000 XP, etc.
                        </p>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>
                        
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Percent className="h-4 w-4 text-green-500" />
                              Discount ({discount}%):
                            </span>
                            <span className="font-medium text-green-500">-${(basePrice * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                        
                        {xpBoostersCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">XP Boosters (+30%):</span>
                            <span className="font-medium text-amber-500">+${xpBoostersCharge.toFixed(2)}</span>
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
                            <span>250k-499k XP: <strong className="text-foreground">15% OFF</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>500k+ XP: <strong className="text-foreground">20% OFF</strong></span>
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
                        <input type="hidden" {...form.register("wn8Tier")} value={selectedWN8Tier} />
                        <input type="hidden" {...form.register("cannotUseXPBoosters")} value={cannotUseXPBoosters ? "true" : "false"} />
                        <input type="hidden" {...form.register("expAmount", { valueAsNumber: true })} value={expAmount === "" ? 0 : expAmount} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">Order Summary:</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Package:</span>
                              <span className="font-medium">{WN8_TIER_LABELS[selectedWN8Tier]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Boosters:</span>
                              <span className="font-medium">
                                {cannotUseXPBoosters ? "Dont use XP boosters (+30%)" : "Use XP boosters"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="font-medium">{expAmount}k XP</span>
                            </div>
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
                            placeholder="Any specific tanks, goals, or requirements..."
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
                    <p className="text-sm text-muted-foreground">VPN protection and strict privacy protocols for your account safety.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fast Progression</h3>
                    <p className="text-sm text-muted-foreground">Maximize XP earnings per hour with our expert players.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Specific Goals</h3>
                    <p className="text-sm text-muted-foreground">We focus on the exact tanks and modules you want to unlock.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Great Discounts</h3>
                    <p className="text-sm text-muted-foreground">Get up to 20% off on larger XP orders.</p>
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
                    <CardTitle className="text-lg">Select XP Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Choose how much Experience (XP) you need and your preferred efficiency tier.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <CardTitle className="text-lg">We Grind</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Our pro players battle consistently to earn XP and unlock upgrades for you.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <CardTitle className="text-lg">Unlock Tiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Log in to find your tanks leveled up and ready for the next tier of research!
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
