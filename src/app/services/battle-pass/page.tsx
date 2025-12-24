"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Trophy, Shield, ChevronRight, Check, ArrowLeft, Calculator, Percent, Star } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

// Battle Pass pricing
const PRICE_PER_LEVEL = 2.5
const MAX_LEVELS = 50

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  currentLevel: z.number().min(1, { message: "Minimum level is 1" }).max(50, { message: "Maximum level is 50" }),
  targetLevel: z.number().min(1, { message: "Minimum level is 1" }).max(50, { message: "Maximum level is 50" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
})

export default function BattlePassPage() {
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
    
    if (current < 1 || target < current || target > MAX_LEVELS) {
      setBasePrice(0)
      setDiscount(0)
      setFinalPrice(0)
      setLevelsToBoost(0)
      return
    }

    const levels = target - current + 1
    setLevelsToBoost(levels)
    
    const base = levels * PRICE_PER_LEVEL
    
    // Volume discounts
    let discountPercent = 0
    if (levels >= 50) {
      discountPercent = 15
    } else if (levels >= 25) {
      discountPercent = 10
    }
    
    const discountAmount = base * (discountPercent / 100)
    const final = base - discountAmount
    
    setBasePrice(base)
    setDiscount(discountPercent)
    setFinalPrice(final)
  }, [currentLevel, targetLevel])

  function onSubmit(values: z.infer<typeof orderFormSchema>) {
    const orderData = {
      ...values,
      levelsToBoost,
      basePrice,
      discount,
      finalPrice,
    }
    console.log(orderData)
    alert(`Order submitted!\n\nBattle Pass Boosting\nFrom Level ${values.currentLevel} to Level ${values.targetLevel}\nLevels: ${levelsToBoost}\nTotal: $${finalPrice.toFixed(2)}\n\nWe will contact you within 30 minutes.`)
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
                <Trophy className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Battle Pass Boosting
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Complete your Battle Pass and unlock all 50 levels of exclusive rewards with our professional boosting service
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
                      
                      {/* Current Level */}
                      <div>
                        <label htmlFor="currentLevel" className="text-sm font-medium mb-2 block">
                          Current Battle Pass Level
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
                          placeholder="Enter your current level (1-50)"
                        />
                      </div>

                      {/* Target Level */}
                      <div>
                        <label htmlFor="targetLevel" className="text-sm font-medium mb-2 block">
                          Target Battle Pass Level
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
                          placeholder="Enter target level (1-50)"
                        />
                        {targetLevel !== "" && currentLevel !== "" && targetLevel < currentLevel && (
                          <p className="text-sm text-red-500 mt-1">Target level cannot be lower than current level</p>
                        )}
                      </div>

                      {/* Levels Progress Display */}
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Levels to boost:</span>
                          <span className="text-xl font-bold text-primary">{levelsToBoost}</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(levelsToBoost / MAX_LEVELS) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Level {currentLevel || 1}</span>
                          <span>Level {targetLevel || MAX_LEVELS}</span>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price per level:</span>
                          <span className="font-medium">${PRICE_PER_LEVEL.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Price ({levelsToBoost} levels):</span>
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
                            <span>25-49 stages: <strong className="text-foreground">10% OFF</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            <span>50 stages: <strong className="text-foreground">15% OFF</strong></span>
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
                        <input type="hidden" {...form.register("currentLevel", { valueAsNumber: true })} value={currentLevel === "" ? 1 : currentLevel} />
                        <input type="hidden" {...form.register("targetLevel", { valueAsNumber: true })} value={targetLevel === "" ? 50 : targetLevel} />

                        {/* Order Summary */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                          <div className="text-sm font-semibold mb-2">Order Summary:</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service:</span>
                              <span className="font-medium">Battle Pass Boosting</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">From Level:</span>
                              <span className="font-medium">{currentLevel || 1}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">To Level:</span>
                              <span className="font-medium">{targetLevel || MAX_LEVELS}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Levels to boost:</span>
                              <span className="font-medium">{levelsToBoost}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount:</span>
                                <span className="font-medium text-green-500">{discount}% OFF</span>
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
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">All 50 Levels</h3>
                    <p className="text-sm text-muted-foreground">Complete access to all Battle Pass rewards and exclusive content.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Expert Players</h3>
                    <p className="text-sm text-muted-foreground">Our boosters efficiently complete all challenges and missions.</p>
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
                    <p className="text-sm text-muted-foreground">Save up to 15% when boosting 50 levels.</p>
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
                    <CardTitle className="text-lg">Select Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Choose your current Battle Pass level and your target level (up to 50).
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <CardTitle className="text-lg">We Boost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Our expert players efficiently complete Battle Pass challenges and missions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <CardTitle className="text-lg">Claim Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Enjoy all the exclusive Battle Pass rewards, tokens, and premium content!
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
