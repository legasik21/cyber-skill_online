"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { XCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const getErrorMessage = () => {
    switch (reason) {
      case 'validation':
        return 'Please fill in all required fields correctly.'
      case 'telegram':
        return 'Could not send your order. Please try again or contact us via Discord.'
      case 'server':
        return 'Server error occurred. Please try again later.'
      default:
        return 'Something went wrong while processing your order.'
    }
  }

  return (
    <Card className="border-destructive/30 bg-card text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-2xl md:text-3xl">Order Failed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-lg">
          {getErrorMessage()}
        </p>
        
        <div className="bg-secondary/30 rounded-lg p-4 text-left">
          <h4 className="font-semibold mb-2">Need help?</h4>
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please contact us directly via our Discord server or use the live chat on the website.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link href="/#contact">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrderErrorPage() {
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
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorContent />
            </Suspense>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
