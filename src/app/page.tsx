"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Shield, Target, Zap, Trophy, ChevronRight, Star, ChevronsUp, BookOpen, Swords, Medal } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  service: z.string().min(1, { message: "Please select a service" }),
  message: z.string().optional(),
})

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      service: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    alert("Order request sent! We will contact you shortly.")
  }

  const services = [
    {
      title: "WN8 Boosting",
      description: "Increase your stats and improve your WN8 rating efficiently.",
      icon: <Target className="h-10 w-10 text-primary" />,
      price: "From $10",
      link: "/services/wn8-boost",
    },
    {
      title: "Credit Farming",
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
      title: "Powerleveling",
      description: "Rapidly level up your tanks and crews to tier X.",
      icon: <ChevronsUp className="h-10 w-10 text-primary" />,
      price: "From $25",
      link: "/services/powerleveling",
    },
    {
      title: "Exp Farm",
      description: "Gain experience points for any tank in your garage.",
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      price: "From $5",
      link: "#services",
    },
    {
      title: "Onslaught",
      description: "Dominate the Onslaught mode and climb the ranks.",
      icon: <Swords className="h-10 w-10 text-primary" />,
      price: "Custom",
      link: "#services",
    },
    {
      title: "Ace Tanker",
      description: "Get the Ace Tanker mastery badge on your vehicles.",
      icon: <Medal className="h-10 w-10 text-primary" />,
      price: "From $15",
      link: "#services",
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
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
              className="flex gap-4"
            >
              <Button size="lg" className="text-lg px-8">
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Services
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

          {/* Featured Event - Frontline */}
          <div className="mb-12">
            <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg">
                  ACTIVE NOW
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">🎯 Frontline Event</CardTitle>
                      <CardDescription className="text-lg">
                        Epic 30v30 battles! Earn Steel Hunter rewards and exclusive customizations.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Event Details</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2">📅</span>
                          <span>Duration: December 1-15, 2025</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">🏆</span>
                          <span>Rewards: Premium Tanks, Credits, Bonds</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">⚔️</span>
                          <span>Mode: 30v30 Multi-phase Conquest</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">⭐</span>
                          <span>Max Rank: General (15 levels)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Boost Services Available</h4>
                      <div className="space-y-3">
                        <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Rank Boost (1-15)</span>
                            <span className="text-primary font-bold">$50+</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Guaranteed General rank completion</p>
                        </div>
                        <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Premium Tank Unlock</span>
                            <span className="text-primary font-bold">Custom</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Get exclusive Frontline rewards</p>
                        </div>
                        <Button className="w-full mt-2" size="lg">
                          Order Frontline Boost
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
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">UPCOMING</div>
                <CardTitle className="text-xl">🎄 Holiday Ops 2026</CardTitle>
                <CardDescription>Festive bonuses and special rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="font-medium">Dec 20, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4 weeks</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">UPCOMING</div>
                <CardTitle className="text-xl">⚡ Steel Hunter</CardTitle>
                <CardDescription>Battle Royale returns with new mechanics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="font-medium">Jan 10, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">2 weeks</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 opacity-75">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">PAST EVENT</div>
                <CardTitle className="text-xl">🔥 Black Market</CardTitle>
                <CardDescription>Rare tanks for gold and credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ended:</span>
                    <span className="font-medium">Nov 15, 2025</span>
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

      {/* About Our Team Section */}
      <section id="about" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">About Our Team</h2>
            <p className="text-muted-foreground text-lg">Elite World of Tanks players dedicated to your success</p>
          </div>

          {/* Why Choose Us Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Team Members */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 text-center">
              <CardHeader>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Alex "TankAce" M.</CardTitle>
                <CardDescription>Lead Booster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WN8:</span>
                    <span className="font-bold text-primary">3,500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-bold text-primary">62%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battles:</span>
                    <span className="font-bold">50,000+</span>
                  </div>
                  <p className="text-muted-foreground mt-4">Specialist in 3 Mark of Excellence and campaign missions.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 text-center">
              <CardHeader>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Maria "SniperQueen"</CardTitle>
                <CardDescription>Senior Booster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WN8:</span>
                    <span className="font-bold text-primary">3,200+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-bold text-primary">60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battles:</span>
                    <span className="font-bold">45,000+</span>
                  </div>
                  <p className="text-muted-foreground mt-4">Expert in WN8 boosting and credit farming strategies.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 text-center">
              <CardHeader>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Viktor "FastTrack"</CardTitle>
                <CardDescription>Speed Specialist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WN8:</span>
                    <span className="font-bold text-primary">3,400+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-bold text-primary">61%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battles:</span>
                    <span className="font-bold">55,000+</span>
                  </div>
                  <p className="text-muted-foreground mt-4">Rapid completion of event missions and tier grinds.</p>
                </div>
              </CardContent>
            </Card>
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

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardTitle className="text-lg">Amazing Service!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "Got my 3 marks on the Object 430U in just 3 days! The boosters are incredibly skilled and kept me updated throughout. Highly recommend CyberSkill!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="text-primary font-bold">DK</span>
                  </div>
                  <div>
                    <p className="font-semibold">DarkKnight87</p>
                    <p className="text-xs text-muted-foreground">Nov 25, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardTitle className="text-lg">Professional Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "Finally completed the Obj. 279e missions thanks to CyberSkill. The team was professional, fast, and secure. Worth every penny!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="text-primary font-bold">TM</span>
                  </div>
                  <div>
                    <p className="font-semibold">TankMaster99</p>
                    <p className="text-xs text-muted-foreground">Nov 20, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardTitle className="text-lg">Exceeded Expectations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "My WN8 went from 1200 to 2000 in two weeks! The boosters played better than I expected and taught me some tricks too. Definitely using again."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="text-primary font-bold">AC</span>
                  </div>
                  <div>
                    <p className="font-semibold">ArmoredCrusader</p>
                    <p className="text-xs text-muted-foreground">Nov 18, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <label htmlFor="service" className="text-sm font-medium">Service Interest</label>
                  <select
                    id="service"
                    {...form.register("service")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a service...</option>
                    <option value="wn8">WN8 Boosting</option>
                    <option value="credits">Credit Farming</option>
                    <option value="campaign">Campaign Missions</option>
                    <option value="moe">Mark of Excellence</option>
                    <option value="powerleveling">Powerleveling</option>
                    <option value="exp-farm">Exp Farm</option>
                    <option value="onslaught">Onslaught</option>
                    <option value="ace-tanker">Ace Tanker</option>
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

                <Button type="submit" className="w-full" size="lg">
                  Submit Request
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
