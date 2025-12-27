"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Shield, Target, Zap, Trophy, ChevronRight, Star, ChevronsUp, BookOpen, Swords, Medal, Users, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroBackground from "@/components/HeroBackground"
import { useRouter } from "next/navigation"
import ReviewsSlider from "@/components/ReviewsSlider"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  service: z.string().min(1, { message: "Please select a service" }),
  message: z.string().optional(),
})

export default function Home() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      service: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          page: 'Home Page - Contact Form',
        }),
      })

      const data = await response.json()
      
      if (data.redirect) {
        router.push(data.redirect)
      } else if (data.success) {
        router.push('/order/success')
      } else {
        router.push('/order/error')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      router.push('/order/error?reason=server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const services = [
    {
      title: "WN8, Winrate, High Damage",
      description: "Increase your stats and improve your WN8 rating efficiently.",
      icon: <Target className="h-10 w-10 text-primary" />,
      price: "From $10",
      link: "/services/wn8-boost",
    },
    {
      title: "Credit and Bonds Farming",
      description: "Get millions of credits quickly without the grind.",
      icon: <Zap className="h-10 w-10 text-primary" />,
      price: "From $15",
      link: "/services/credit-farm",
    },
    {
      title: "Campaign Missions",
      description: "Complete difficult missions (Obj. 279e, Chimera) with ease.",
      icon: <Trophy className="h-10 w-10 text-primary" />,
      price: "Custom",
      link: "/services/campaign-missions",
    },
    {
      title: "Mark of Excellence",
      description: "Get 3 marks on your favorite tanks. Top 1% performance.",
      icon: <Star className="h-10 w-10 text-primary" />,
      price: "From $20",
      link: "/services/mark-of-excellence",
    },
    {
      title: "Onslaught",
      description: "Dominate the Onslaught mode and climb the ranks.",
      icon: <Swords className="h-10 w-10 text-primary" />,
      price: "From $15",
      link: "/services/onslaught",
    },
    {
      title: "Tier Leveling",
      description: "Rapidly level up your tanks and crews to tier X.",
      icon: <ChevronsUp className="h-10 w-10 text-primary" />,
      price: "From $25",
      link: "/services/tier-leveling",
    },
    {
      title: "Exp Farm",
      description: "Gain experience points for any tank in your garage.",
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      price: "From $3",
      link: "/services/exp-farm",
    },
    {
      title: "Ace Tanker",
      description: "Get the Ace Tanker mastery badge on your vehicles.",
      icon: <Medal className="h-10 w-10 text-primary" />,
      price: "From $10",
      link: "/services/ace-tanker",
    },
    {
      title: "Battle Pass",
      description: "Complete all 50 Battle Pass levels and unlock exclusive rewards.",
      icon: <Trophy className="h-10 w-10 text-primary" />,
      price: "From $50",
      link: "/services/battle-pass",
    },
    {
      title: "Referral Program",
      description: "Get a Tier 8 Premium Tank and Bonds. We handle the recruiting.",
      icon: <Users className="h-10 w-10 text-primary" />,
      price: "$100",
      link: "/services/referral-program",
    },
  ]

  const features = [
    {
      title: "100% Secure",
      description: "VPN protection and privacy guaranteed.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Unicum Players",
      description: "Boosters are top 0.1% players.",
      icon: <Trophy className="h-6 w-6" />,
    },
    {
      title: "Fast Delivery",
      description: "We start immediately after order.",
      icon: <Zap className="h-6 w-6" />,
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated Background */}
        <HeroBackground />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Dominate the Battlefield with <span className="text-primary">CyberSkill</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              Professional World of Tanks boosting services. Raise your WN8, get 3 Marks of Excellence, and complete campaign missions effortlessly.
            </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
              >
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto" asChild>
                  <Link href="#services">
                    Our Services <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 w-full sm:w-auto"
                  onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-chat-widget'))}
                >
                  Chat Assistant
                </Button>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Current Events Section */}
      <section id="events" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Current Events</h2>
            <p className="text-muted-foreground text-lg">Take advantage of special events and limited-time offers</p>
          </div>

          {/* Two Featured Events Side-by-Side */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            
            {/* Featured Event - Holiday Ops 2026 */}
            <Card className="h-full border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-card overflow-hidden flex flex-col">
              <div className="relative flex-grow">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                  ACTIVE NOW
                </div>
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl mb-2">🎄 Holiday Ops 2026</CardTitle>
                        <CardDescription>
                        Festive bonuses and special rewards! Celebrate the holidays.
                        </CardDescription>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Event Details</h4>
                        <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>Duration: 5 Dec - 12 Jan</span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">🏆</span>
                            <span>Rewards: Premium Tanks, Credits</span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">⭐</span>
                            <span>Special: Holiday Styles & Crew</span>
                        </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Boost Services</h4>
                        <div className="space-y-3">
                        <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Full Completion</span>
                            <span className="text-primary font-bold">$80+</span>
                            </div>
                            <p className="text-xs text-muted-foreground">All decorations and rewards</p>
                        </div>
                        <Button className="w-full mt-2" size="lg" asChild>
                            <Link href="/events">
                            Learn More
                            </Link>
                        </Button>
                        </div>
                    </div>
                    </div>
                </CardContent>
              </div>
            </Card>

            {/* Battle Pass Event */}
            <Card className="h-full border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-card overflow-hidden flex flex-col">
              <div className="relative flex-grow">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                  ACTIVE NOW
                </div>
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl mb-2">🎖️ Battle Pass: Holiday Havoc</CardTitle>
                        <CardDescription>
                        Complete challenges and unlock exclusive Battle Pass rewards.
                        </CardDescription>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Event Details</h4>
                        <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>Duration: 19 Dec - 12 Jan</span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">🏆</span>
                            <span>Rewards: Tanks, Bonds, Credits</span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">⚡</span>
                            <span>Levels: 50 Progressive Stages</span>
                        </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Boost Services</h4>
                        <div className="space-y-3">
                        <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Level Boost</span>
                            <span className="text-primary font-bold">$2.5/lvl</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Fast progression</p>
                        </div>
                        <Button className="w-full mt-2" size="lg" asChild>
                            <Link href="/services/battle-pass">
                            Order Battle Pass Boost
                            </Link>
                        </Button>
                        </div>
                    </div>
                    </div>
                </CardContent>
              </div>
            </Card>

          </div>

          {/* Other Events Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 opacity-75">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">PAST EVENT</div>
                <CardTitle className="text-xl">🎯 Frontline Event</CardTitle>
                <CardDescription>Epic 30v30 battles with exclusive rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ended:</span>
                    <span className="font-medium">Dec 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-muted-foreground">Completed</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Event Ended
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Premium Services</h2>
            <p className="text-muted-foreground text-lg">Choose the boost that fits your goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all group">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-4">{service.price}</div>
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    asChild={service.link.startsWith('/services')}
                  >
                    {service.link.startsWith('/services') ? (
                      <Link href={service.link}>
                        Learn More <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <span>Order Now</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section id="guarantee" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">CyberSkill Guarantee</h2>
            <p className="text-muted-foreground text-lg">Your satisfaction and security are our top priorities</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">100% Secure Service</h3>
                  <p className="text-muted-foreground">
                    We adhere to strict security rules. Your account safety is paramount, which is why we insist on linking your phone number and enabling 2FA. Our employees never ask for unnecessary personal data.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Satisfaction Guaranteed</h3>
                  <p className="text-muted-foreground">
                    Optimal market relations are only possible if the customer is completely satisfied. We have clear refund terms if our service doesn't meet your requirements or if results aren't achieved.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center md:justify-start">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/guarantee">
                    Read Full Guarantee Policy
                  </Link>
                </Button>
              </div>
            </div>

             {/* Visual/Features Grid */}
             <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Shield className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">Data Privacy</h4>
                 <p className="text-sm text-muted-foreground">Encrypted & Confidential</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Zap className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">Fast Refunds</h4>
                 <p className="text-sm text-muted-foreground">Clear Terms</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Target className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">Result Oriented</h4>
                 <p className="text-sm text-muted-foreground">Guaranteed Goals</p>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 flex flex-col items-center text-center">
                 <Users className="h-10 w-10 text-primary mb-3" />
                 <h4 className="font-bold">Expert Support</h4>
                 <p className="text-sm text-muted-foreground">24/7 Assistance</p>
              </Card>
            </div>
          </div>
        </div>

      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg">Trusted by thousands of World of Tanks players worldwide</p>
          </div>

          <div className="px-4">
             <ReviewsSlider />
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <p className="text-muted-foreground">Orders Completed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Support Available</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Secure & Safe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-xl">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Boost?</CardTitle>
              <CardDescription>Fill out the form and we&apos;ll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    {...form.register("email")}
                    className="bg-background"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
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
                
                <div className="space-y-2">
                  <label htmlFor="service" className="text-sm font-medium">Service Interest</label>
                  <select
                    id="service"
                    {...form.register("service")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a service...</option>
                    <option value="wn8">WN8, Winrate, High Damage</option>
                    <option value="credits">Credit and Bonds Farming</option>
                    <option value="campaign">Campaign Missions</option>
                    <option value="moe">Mark of Excellence</option>
                    <option value="tier-leveling">Tier Leveling</option>
                    <option value="exp-farm">Exp Farm</option>
                    <option value="onslaught">Onslaught</option>
                    <option value="ace-tanker">Ace Tanker</option>
                    <option value="battle-pass">Battle Pass</option>
                    <option value="referral">Referral Program</option>
                  </select>
                  {form.formState.errors.service && (
                    <p className="text-sm text-red-500">{form.formState.errors.service.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Additional Details</label>
                  <textarea
                    id="message"
                    {...form.register("message")}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Tell us more about what you need..."
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      </div>
      <Footer />
    </>
  )
}
