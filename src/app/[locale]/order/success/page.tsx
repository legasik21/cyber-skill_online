"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { CheckCircle } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"

// Google Ads PRIMARY conversion — "Submit lead form" (a public client-side value).
const LEAD_FORM_CONVERSION = "AW-17868439825/XuKBCO-NleIbEJGCq8hC"

export default function OrderSuccessPage() {
  const t = useTranslations("orderSuccess")

  // Fire the lead-form conversion once when this success page mounts. The page
  // renders only after a successful order submission, so one mount == one order.
  // Guard window.gtag (loaded in the root layout) and a ref so React re-renders
  // or dev double-invoke never fire it twice.
  const firedRef = useRef(false)
  useEffect(() => {
    if (firedRef.current) return
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag !== "function") return
    firedRef.current = true
    w.gtag("event", "conversion", { send_to: LEAD_FORM_CONVERSION })
  }, [])

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
                <CardTitle className="text-2xl md:text-3xl">{t("title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg">
                  {t("thankYou")}
                </p>

                <div className="bg-secondary/30 rounded-lg p-4 text-left">
                  <h4 className="font-semibold mb-2">{t("whatNext")}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>{t("step1")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>{t("step2")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>{t("step3")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>{t("step4")}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1" size="lg">
                    <Link href="/">{t("backHome")}</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1" size="lg">
                    <Link href="/#services">{t("viewServices")}</Link>
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
