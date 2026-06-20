import { useTranslations } from "next-intl"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPage() {
  const t = useTranslations("privacy")
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">{t("title")}</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("collect.title")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("collect.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("collect.item1")}</li>
                <li>{t("collect.item2")}</li>
                <li>{t("collect.item3")}</li>
                <li>{t("collect.item4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("use.title")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("use.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("use.item1")}</li>
                <li>{t("use.item2")}</li>
                <li>{t("use.item3")}</li>
                <li>{t("use.item4")}</li>
                <li>{t("use.item5")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("security.title")}</h2>
              <p className="text-muted-foreground">
                {t("security.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("sharing.title")}</h2>
              <p className="text-muted-foreground">
                {t("sharing.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("sharing.item1")}</li>
                <li>{t("sharing.item2")}</li>
                <li>{t("sharing.item3")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("retention.title")}</h2>
              <p className="text-muted-foreground">
                {t("retention.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("rights.title")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("rights.intro")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("rights.item1")}</li>
                <li>{t("rights.item2")}</li>
                <li>{t("rights.item3")}</li>
                <li>{t("rights.item4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("cookies.title")}</h2>
              <p className="text-muted-foreground">
                {t("cookies.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("changes.title")}</h2>
              <p className="text-muted-foreground">
                {t("changes.body")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
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
