"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Users, Shield, ChevronRight, Check, ArrowLeft, Gift, Trophy, Zap, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
})

const SERVICE_PRICE = 100

export default function ReferralProgramServicePage() {
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      server: "",
      additionalInfo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'referral-program',
      message: values.additionalInfo,
      page: 'Referral Program Service',
      orderDetails: {
          server: values.server,
          price: `$${SERVICE_PRICE}`,
          totalPrice: `$${SERVICE_PRICE}`,
      },
    })
  }

  const rewards = [
    { icon: <Trophy className="h-6 w-6" />, title: "Tier 8 Premium Tank", description: "Choose from available reward tanks" },
    { icon: <Gift className="h-6 w-6" />, title: "Bonus Rewards", description: "Additional bonds and credits included" },
    { icon: <Zap className="h-6 w-6" />, title: "Fast Completion", description: "Usually completed within 7-14 days" },
  ]

  const features = [
    "We recruit 3 referrals for you",
    "Each referral reaches required level",
    "You get to choose your reward tank",
    "Bonds included with completion",
    "No account sharing required",
    "100% safe and legitimate",
  ]

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
                <Users className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Referral Program Service
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Get a Tier 8 Premium Tank and Bonds through the WoT Referral Program. We handle all the recruiting for you!
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-primary">${SERVICE_PRICE}</div>
                <span className="text-muted-foreground">Fixed Price</span>
              </div>
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Order Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <CardTitle>Place Your Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Submit your order with your account details and preferred server.</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <CardTitle>We Recruit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our team recruits and levels referrals using your referral link.</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <CardTitle>Get Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Once complete, claim your Tier 8 Premium Tank and bonus rewards!</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {rewards.map((reward, index) => (
                  <Card key={index} className="bg-card border-primary/20">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                        {reward.icon}
                      </div>
                      <CardTitle>{reward.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{reward.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Features List */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Service Includes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Complete Your Order</CardTitle>
                  <CardDescription>Fill in your details to get your Tier 8 Premium Tank</CardDescription>
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

                    {/* Order Summary */}
                    <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-semibold mb-2">Order Summary:</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service:</span>
                          <span className="font-medium">Referral Program</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-medium">Tier 8 Premium Tank + Bonds</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-bold text-primary text-lg">${SERVICE_PRICE}</span>
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
                        placeholder="Any specific tank preferences or requirements..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Order...
                        </>
                      ) : (
                        <>
                          Submit Order - ${SERVICE_PRICE}
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
        </section>

      </div>
      <Footer />
    </>
  )
}
