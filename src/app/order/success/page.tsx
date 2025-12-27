"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pt-20">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <Card className="border-primary/30 bg-card text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Order Submitted Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg">
                  Thank you for your order! Our manager will contact you via Discord within 24 hours.
                </p>
                
                <div className="bg-secondary/30 rounded-lg p-4 text-left">
                  <h4 className="font-semibold mb-2">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Our manager will review your order</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>You will receive a Discord friend request</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>We will discuss details and payment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Work begins immediately after confirmation</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1" size="lg">
                    <Link href="/">Back to Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1" size="lg">
                    <Link href="/#services">View Services</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
