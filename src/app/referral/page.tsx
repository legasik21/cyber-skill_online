"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Gift, Users, DollarSign, CheckCircle, AlertCircle } from "lucide-react"

export default function ReferralProgramPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-6">
                <Gift className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                CyberSkill Referral Program
              </h1>
              <p className="text-xl text-primary font-semibold mb-4">
                Invite a friend — get $10!
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Earn a $10 discount for every friend who places an order. Your friend also gets $10 off their first order.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Benefits */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">Unlock referrals after spending $50</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">Minimum order: $20</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">Use bonuses to cover up to 20% of any order</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-primary/20 h-full">
                  <CardContent className="p-4 h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-sm">No limit on invitations</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-primary">
                Start inviting and save on your next order!
              </p>
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Terms & Conditions</h2>
              
              <div className="space-y-8">
                {/* 1. Eligibility */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      Eligibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>1.1. To participate in the CyberSkill Referral Program, a user must have completed orders with a total value of at least $50.</p>
                    <p>1.2. After meeting this requirement, the user receives a unique referral card from a CyberSkill manager.</p>
                  </CardContent>
                </Card>

                {/* 2. Referral Conditions */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      Referral Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>2.1. A referral is considered successful when:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>the invited friend provides the referral card, and</li>
                      <li>places and completes an order with a minimum value of $20.</li>
                    </ul>
                    <p>2.2. Each referral card may be used by a friend once.</p>
                  </CardContent>
                </Card>

                {/* 3. Referral Rewards */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      Referral Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-500" />
                        3.1. Invited Friend Reward
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>$10 discount on their first order</li>
                        <li>Minimum order value: $20</li>
                      </ul>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        3.2. Referrer Reward
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>$10 referral bonus for each successful referral</li>
                        <li>Bonus is credited after the invited friend completes a qualifying order</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Bonus Usage Rules */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      Bonus Usage Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>4.1. Referral bonuses can be used only on orders with a minimum value of $20.</p>
                    <p>4.2. Referral bonuses may be combined.</p>
                    <p>4.3. Referral bonuses can cover up to 20% of the total order value.</p>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-3">Examples:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Order $50 →</span>
                          <span className="text-primary font-medium">Max discount $10 →</span>
                          <span className="text-green-500 font-bold">Pay $40</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Order $100 →</span>
                          <span className="text-primary font-medium">Max discount $20 →</span>
                          <span className="text-green-500 font-bold">Pay $80</span>
                        </div>
                      </div>
                    </div>
                    <p>4.4. Any unused bonus balance remains available for future orders and does not expire unless stated otherwise.</p>
                  </CardContent>
                </Card>

                {/* 5. Limitations & Fair Use */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      Limitations & Fair Use
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>5.1. There is no limit on the number of friends a user can invite.</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">5.2. Self-referrals, duplicate accounts, abuse of the referral system, or any fraudulent activity are strictly prohibited.</p>
                      </div>
                    </div>
                    <p>5.3. CyberSkill reserves the right to revoke referral bonuses and suspend accounts involved in abusive behavior.</p>
                  </CardContent>
                </Card>

                {/* 6. Program Changes */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                      Program Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>6.1. CyberSkill reserves the right to modify, suspend, or terminate the referral program at any time without prior notice.</p>
                    <p>6.2. Any changes will not affect bonuses already credited to user accounts.</p>
                  </CardContent>
                </Card>

                {/* 7. Support */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                      Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <p>For questions regarding the referral program, users may contact CyberSkill support via the quick chat located in the lower-right corner of the website.</p>
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
