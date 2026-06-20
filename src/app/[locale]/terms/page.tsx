"use client"

import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  const t = useTranslations("terms")

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">{t("heading")}</h1>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agreement.heading")}</h2>
              <p>
                {t("agreement.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("description.heading")}</h2>
              <p>
                {t("description.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("security.heading")}</h2>
              <p>
                {t("security.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("conduct.heading")}</h2>
              <p>
                {t("conduct.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("payment.heading")}</h2>
              <p>
                {t("payment.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("liability.heading")}</h2>
              <p>
                {t("liability.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("modifications.heading")}</h2>
              <p>
                {t("modifications.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t("contact.heading")}</h2>
              <p>
                {t("contact.bodyPrefix")}<a href="mailto:cyberskillwot@gmail.com" className="text-primary hover:underline">cyberskillwot@gmail.com</a>{t("contact.bodySuffix")}
              </p>
            </section>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
