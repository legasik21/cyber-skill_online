"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Coins, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

// Service types
type ServiceType = "credits" | "bonds"

// Pricing per credit million based on WN8 tier
const CREDIT_PRICING = {
  "under-2500": 4.5,    // $4.5 per million for Under 2500 WN8
  "over-2500": 6.0,     // $6 per million for More than 2500 WN8
}

const WN8_TIER_LABELS = {
  "under-2500": "Under 2500 WN8",
  "over-2500": "More than 2500 WN8",
}

// Bonds pricing per 100 bonds
const BONDS_BASE_PRICE = 7.0 // $7 per 100 bonds

// Bonds WN8 modifiers
const BONDS_WN8_MODIFIERS = {
  "2000": 0,      // 2000 WN8 - standard price (0% modifier)
  "2500-3000": 50,  // +50%
  "3000-4000": 100, // +100%
  "4000+": 150,     // +150%
}

const BONDS_WN8_LABELS = {
  "2000": "2000 WN8",
  "2500-3000": "2500-3000 WN8",
  "3000-4000": "3000-4000 WN8",
  "4000+": "4000+ WN8",
}

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  serviceType: z.enum(["credits", "bonds"], { message: "Please select a service type" }),
  tier: z.string().min(1, { message: "Please select a tier" }),
  cannotUseSilverBoosters: z.boolean().optional(),
  amount: z.number().min(1, { message: "Minimum amount required" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
})

export default function CreditFarmPage() {
  const [serviceType, setServiceType] = useState<ServiceType>("credits")
  const [amount, setAmount] = useState<number | "">(1)
  const [selectedTier, setSelectedTier] = useState<string>("under-2500")
  const [cannotUseSilverBoosters, setCannotUseSilverBoosters] = useState<boolean>(false)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [silverBoostersCharge, setSilverBoostersCharge] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

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
    
    if (serviceType === "credits" && amountValue < 1) {
      setBasePrice(0)
      setDiscount(0)
      setSilverBoostersCharge(0)
      setFinalPrice(0)
      return
    }
    
    if (serviceType === "bonds" && amountValue < 100) {
      setBasePrice(0)
      setDiscount(0)
      setSilverBoostersCharge(0)
      setFinalPrice(0)
      return
    }

    let base = 0
    let discountPercent = 0
    
    if (serviceType === "credits") {
      // Credits pricing
      const pricePerMillion = CREDIT_PRICING[selectedTier as keyof typeof CREDIT_PRICING] || 0
      base = amountValue * pricePerMillion
      
      // Volume discounts for credits
      if (amountValue >= 70) {
        discountPercent = 20
      } else if (amountValue >= 40) {
        discountPercent = 15
      } else if (amountValue >= 20) {
        discountPercent = 10
      }
    } else if (serviceType === "bonds") {
      // Bonds pricing - amount is in 100s
      const bondsHundreds = Math.floor(amountValue / 100)
      let pricePerHundred = BONDS_BASE_PRICE
      
      // Apply WN8 modifier
      const modifier = BONDS_WN8_MODIFIERS[selectedTier as keyof typeof BONDS_WN8_MODIFIERS] || 0
      pricePerHundred = pricePerHundred * (1 + modifier / 100)
      
      base = bondsHundreds * pricePerHundred
      
      // No volume discounts for bonds
    }
    
    const discountAmount = base * (discountPercent / 100)
    const afterDiscount = base - discountAmount
    
    // Calculate silver boosters charge (only for credits)
    let silverCharge = 0
    if (serviceType === "credits" && cannotUseSilverBoosters) {
      silverCharge = afterDiscount * 0.30 // 30% additional charge
    }
    
    const final = afterDiscount + silverCharge
    
    setBasePrice(base)
    setDiscount(discountPercent)
    setSilverBoostersCharge(silverCharge)
    setFinalPrice(final)
  }, [amount, selectedTier, cannotUseSilverBoosters, serviceType])

  function onSubmit(values: z.infer<typeof orderFormSchema>) {
    const orderData = {
      ...values,
      basePrice,
      discount,
      silverBoostersCharge,
      finalPrice,
    }
    console.log(orderData)
    
    const serviceLabel = serviceType === "credits" ? "Credits" : "Bonds"
    const amountLabel = serviceType === "credits" ? `${values.amount}M credits` : `${values.amount} bonds`
    const tierLabel = serviceType === "credits" 
      ? WN8_TIER_LABELS[values.tier as keyof typeof WN8_TIER_LABELS]
      : BONDS_WN8_LABELS[values.tier as keyof typeof BONDS_WN8_LABELS]
    
    alert(`Order submitted!\n\nService: ${serviceLabel}\nTier: ${tierLabel}\nSilver Boosters: ${values.cannotUseSilverBoosters ? 'Dont use Silver boosters (+30%)' : 'Will use them'}\nAmount: ${amountLabel}\nTotal: $${finalPrice.toFixed(2)}\n\nWe will contact you within 30 minutes.`)
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
                <Coins className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Credit and Bonds Farming Service
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Fast and secure credit farming to build your in-game wealth with professional players
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
                      <CardDescription>Configure your order and see the price instantly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Service Type Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Service Type</label>
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
                            Credits
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
                            Bonds
                          </button>
                        </div>
                      </div>

                      {/* Tier Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {serviceType === "credits" ? "Package Tier" : "WN8 Tier"}
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
                                  <div className="text-sm text-muted-foreground">${price} per million</div>
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
                                    {modifier === 0 ? 'Standard price' : `+${modifier}% to base price`}
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
                          <label className="text-sm font-medium mb-3 block">Silver Boosters</label>
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
                                  Dont use my Silver Boosters
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  If we can't use your own Silver Boosters, the price will be <span className="font-semibold text-amber-500">30% more</span>.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Amount Input */}
                      <div>
                        <label htmlFor="amount" className="text-sm font-medium mb-2 block">
                          {serviceType === "credits" ? "Credits Amount (millions)" : "Bonds Amount"}
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
                              placeholder="Enter credit amount in millions"
                            />
                            {amount !== "" && amount < 1 && amount > 0 && (
                              <p className="text-sm text-red-500 mt-1">1 million is the minimum</p>
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
                              * If you need more bonds, please specify the amount in the "Additional Information".
                            </p>
                          </div>
                        )}
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
                        
                        {silverBoostersCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Silver Boosters (+30%):</span>
                            <span className="font-medium text-amber-500">+${silverBoostersCharge.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                          <span>Total:</span>
                          <span className="text-primary">${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Discount Tiers Info - Only for Credits */}
                      {serviceType === "credits" && (
                        <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">💰 Volume Discounts:</div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>20-39M credits: <strong className="text-foreground">10% OFF</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>40-69M credits: <strong className="text-foreground">15% OFF</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-primary" />
                              <span>70M+ credits: <strong className="text-foreground">20% OFF</strong></span>
                            </div>
                          </div>
                        </div>
                      )}

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
                        <input type="hidden" {...form.register("cannotUseSilverBoosters")} value={cannotUseSilverBoosters ? "true" : "false"} />
                        <input type="hidden" {...form.register("amount", { valueAsNumber: true })} value={amount === "" ? 0 : amount} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">Order Summary:</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service:</span>
                              <span className="font-medium">{serviceType === "credits" ? "Credit and Bonds Farming" : "Bonds Farming"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tier:</span>
                              <span className="font-medium">
                                {serviceType === "credits" 
                                  ? WN8_TIER_LABELS[selectedTier as keyof typeof WN8_TIER_LABELS]
                                  : BONDS_WN8_LABELS[selectedTier as keyof typeof BONDS_WN8_LABELS]
                                }
                              </span>
                            </div>
                            {serviceType === "credits" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Silver Boosters:</span>
                                <span className="font-medium">
                                  {cannotUseSilverBoosters ? "Dont use Silver boosters (+30%)" : "Use Silver boosters"}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{serviceType === "credits" ? "Credits:" : "Bonds:"}</span>
                              <span className="font-medium">{serviceType === "credits" ? `${amount}M` : amount}</span>
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
                            placeholder="Any specific requirements or preferences..."
                          />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full h-12 text-base" size="lg">
                          Submit Order - ${finalPrice.toFixed(2)}
                          <ChevronRight className="ml-2 h-5 w-5" />
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
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fast Farming</h3>
                    <p className="text-sm text-muted-foreground">Efficient credit farming with premium tanks and optimal strategies.</p>
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
                    <p className="text-sm text-muted-foreground">Real-time updates on your credit accumulation progress.</p>
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
                    <p className="text-sm text-muted-foreground">Save up to 20% when ordering 70M+ credits.</p>
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
                    <CardTitle className="text-lg">Select Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Choose how many million credits you need and your preferred package tier.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <CardTitle className="text-lg">We Farm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Our expert players efficiently farm credits using premium tanks and optimal strategies.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <CardTitle className="text-lg">Enjoy Wealth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Receive your credits and spend them on tanks, equipment, and upgrades you've always wanted!
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
