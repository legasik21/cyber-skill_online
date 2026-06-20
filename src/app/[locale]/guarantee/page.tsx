"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Shield, Lock, RefreshCcw, CheckCircle, Mail, Smartphone, AlertTriangle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export default function GuaranteePage() {
  const t = useTranslations("guarantee")
  const refundReasons = t.raw("refund.reasons") as string[]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">

        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6"
              >
                <Shield className="h-12 w-12 md:h-14 md:w-14 text-primary" />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center">
                  {t("hero.title")}
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                {t("hero.subtitle")}
              </motion.p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-12 md:space-y-16">

          {/* Main Guarantee Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                    {t("satisfaction.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    {t("satisfaction.body")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Refund Policy Section */}
          <section className="grid md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-secondary/20 border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                    <RefreshCcw className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    {t("refund.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-medium">{t("refund.intro")}</p>
                  <ul className="space-y-3 md:space-y-4">
                    {refundReasons.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-border/50">
                     <p className="text-sm text-muted-foreground mb-2">{t("refund.contactPrompt")}</p>
                     <a href="mailto:cyberskillwot@gmail.com" className="flex items-center gap-2 text-primary hover:underline font-medium">
                       <Mail className="h-4 w-4" /> cyberskillwot@gmail.com
                     </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-secondary/20 border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                    <Lock className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    {t("privacy.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full justify-between">
                  <div>
                    <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                      {t("privacy.body")}
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-md flex gap-4">
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 flex-shrink-0" />
                      <p className="text-xs md:text-sm text-yellow-500/90 font-medium">
                        {t("privacy.warning")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Account Security Section */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{t("security.title")}</h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  {t("security.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{t("security.phone.title")}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {t("security.phone.body")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{t("security.control.title")}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {t("security.control.body")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-5 md:p-6 border-l-4 border-primary">
                  <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">{t("security.safeBoosting.title")}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {t("security.safeBoosting.body")}
                  </p>
                  <div className="mt-6">
                    <Link href="/services/wn8-boost">
                       <Button variant="outline" className="w-full">{t("security.safeBoosting.cta")}</Button>
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
