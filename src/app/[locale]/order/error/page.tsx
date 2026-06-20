"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { XCircle } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const t = useTranslations("orderError")
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const getErrorMessage = () => {
    switch (reason) {
      case 'validation':
        return t('reason.validation')
      case 'telegram':
        return t('reason.telegram')
      case 'server':
        return t('reason.server')
      default:
        return t('reason.default')
    }
  }

  return (
    <Card className="border-destructive/30 bg-card text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-2xl md:text-3xl">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-lg">
          {getErrorMessage()}
        </p>

        <div className="bg-secondary/30 rounded-lg p-4 text-left">
          <h4 className="font-semibold mb-2">{t("needHelp")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("needHelpBody")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link href="/#contact">{t("tryAgain")}</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/">{t("backHome")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrderErrorPage() {
  const t = useTranslations("orderError")
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
            <Suspense fallback={<div>{t("loading")}</div>}>
              <ErrorContent />
            </Suspense>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
