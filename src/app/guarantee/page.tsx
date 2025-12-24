"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Shield, Lock, RefreshCcw, CheckCircle, Mail, Smartphone, AlertTriangle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { motion } from "framer-motion"

export default function GuaranteePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <Shield className="h-12 w-12 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  CyberSkill Guarantee
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                Optimal market relations are only possible if the customer is completely satisfied.
                Our service adheres to this rule when working with people, without exception.
              </motion.p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
          
          {/* Main Guarantee Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Customer Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Once you have experienced our terms and conditions, you are guaranteed not to want to stop working with us.
                    Our reputation among our customers is of paramount importance to us, which is why we have special refund
                    terms and conditions on our website.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Refund Policy Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <RefreshCcw className="h-8 w-8 text-primary" />
                Refund Policy
              </h2>
              <div className="bg-secondary/20 p-6 rounded-lg border border-border/50 h-full">
                <p className="mb-4 font-medium">The customer may request a refund in the following cases:</p>
                <ul className="space-y-4">
                  {[
                    "If the terms of fulfillment did not meet their requirements",
                    "If they change their mind about using the help of our professionals",
                    "If there is a disagreement about the terms or an erroneous payment to the specified details",
                    "If the specified result is not achieved due to circumstances"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-border/50">
                   <p className="text-sm text-muted-foreground mb-2">For questions about refunds, please contact us:</p>
                   <a href="mailto:cyberskill@gmail.com" className="flex items-center gap-2 text-primary hover:underline font-medium">
                     <Mail className="h-4 w-4" /> cyberskill@gmail.com
                   </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Lock className="h-8 w-8 text-primary" />
                Data Privacy
              </h2>
              <div className="bg-secondary/20 p-6 rounded-lg border border-border/50 h-full flex flex-col justify-center">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Customer convenience is our top priority. That is why we always insist on changing your password
                  before and after placing an order, as well as linking your account to your personal phone number.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-md flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-500/90 font-medium">
                    Our employees do not request personal data necessary to restore access to your account.
                    This information must remain confidential.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Account Security Section */}
          <section className="bg-card border border-border/50 rounded-xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Account Security</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We take the security of your account seriously. Follow these guidelines to ensure maximum protection while using our services.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Link Your Phone & 2FA</h3>
                      <p className="text-muted-foreground">
                        To keep your account safe, you should link it to your phone number. It's also a good idea to set up two-step verification 
                        (you'll get a code in a special app on your phone that you'll need to enter every time you log in to your account).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Complete Control</h3>
                      <p className="text-muted-foreground">
                        You can do this in your account on the World of Tanks website. After these steps, no one but you will be able to access 
                        your personal account, let alone change your password or email address.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-6 border-l-4 border-primary">
                  <h3 className="text-lg font-bold mb-4">Safe Boosting Process</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    At the same time, the driver will have password access to your account in the WOT client, so they can complete the order, 
                    and everything will be completely safe for you.
                  </p>
                  <div className="mt-6">
                    <Link href="/services/wn8-boost">
                       <Button variant="outline" className="w-full">Explore Our Safe Services</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
      <Footer />
    </>
  )
}
