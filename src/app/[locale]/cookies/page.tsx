"use client"

import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function CookiesPage() {
  const t = useTranslations("cookies")

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">{t("title")}</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("what.heading")}</h2>
              <p className="text-muted-foreground">
                {t("what.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("howWeUse.heading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("howWeUse.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>{t("howWeUse.essentialTerm")}</strong> {t("howWeUse.essentialDesc")}</li>
                <li><strong>{t("howWeUse.performanceTerm")}</strong> {t("howWeUse.performanceDesc")}</li>
                <li><strong>{t("howWeUse.functionalityTerm")}</strong> {t("howWeUse.functionalityDesc")}</li>
                <li><strong>{t("howWeUse.analyticsTerm")}</strong> {t("howWeUse.analyticsDesc")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("types.heading")}</h2>

              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">{t("types.session.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("types.session.description")}
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">{t("types.persistent.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("types.persistent.description")}
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">{t("types.thirdParty.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("types.thirdParty.description")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("specific.heading")}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-4 text-left">{t("specific.colName")}</th>
                      <th className="py-2 px-4 text-left">{t("specific.colPurpose")}</th>
                      <th className="py-2 px-4 text-left">{t("specific.colDuration")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">session_id</td>
                      <td className="py-2 px-4">{t("specific.sessionIdPurpose")}</td>
                      <td className="py-2 px-4">{t("specific.sessionIdDuration")}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">preferences</td>
                      <td className="py-2 px-4">{t("specific.preferencesPurpose")}</td>
                      <td className="py-2 px-4">{t("specific.preferencesDuration")}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">analytics_id</td>
                      <td className="py-2 px-4">{t("specific.analyticsIdPurpose")}</td>
                      <td className="py-2 px-4">{t("specific.analyticsIdDuration")}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">cookie_consent</td>
                      <td className="py-2 px-4">{t("specific.cookieConsentPurpose")}</td>
                      <td className="py-2 px-4">{t("specific.cookieConsentDuration")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("managing.heading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("managing.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("managing.item1")}</li>
                <li>{t("managing.item2")}</li>
                <li>{t("managing.item3")}</li>
                <li>{t("managing.item4")}</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                {t("managing.note")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("thirdParty.heading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("thirdParty.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("thirdParty.googleAnalytics")}</li>
                <li>{t("thirdParty.payment")}</li>
                <li>{t("thirdParty.social")}</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                {t("thirdParty.note")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("updates.heading")}</h2>
              <p className="text-muted-foreground">
                {t("updates.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("contact.heading")}</h2>
              <p className="text-muted-foreground">
                {t("contact.body")}
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              {t("lastUpdated")}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
