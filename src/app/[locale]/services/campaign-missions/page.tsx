"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Trophy, Target, Shield, ChevronRight, ArrowRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "@/i18n/navigation"
import { JsonLd } from "@/components/JsonLd"
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import { useTranslations, useLocale } from "next-intl"
import type { Locale } from "@/i18n/routing"

const PATH = "/services/campaign-missions"

const CAMPAIGNS = [
  {
    version: "1.0",
    rewards: ["Stug IV", "T‑28 Concept", "T 55A", "Object 260"],
    href: "/services/campaign-missions/1.0"
  },
  {
    version: "2.0",
    rewards: ["Object 260", "Chimera", "Object 279e"],
    href: "/services/campaign-missions/2.0"
  },
  {
    version: "3.0",
    rewards: ["Windhund (Tier VIII TD)", "Vz. 60S Dravec (Tier X heavy)", "Black Rock (Tier XI heavy)"],
    href: "/services/campaign-missions/3.0"
  }
]

export default function CampaignMissionsPage() {
  const t = useTranslations("campaignMissions")
  const locale = useLocale() as Locale
  // Campaign version keys ("1.0" etc.) contain dots, which t() would treat as a
  // key path separator — read the object via t.raw and index it directly.
  const campaignCopy = t.raw("campaigns") as Record<string, { description: string }>

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: t("metaTitle"),
          description: t("metaDescription"),
          path: PATH,
          locale,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("breadcrumb.home"), path: "/" },
            { name: t("breadcrumb.services"), path: "/#services" },
            { name: t("breadcrumb.current"), path: PATH },
          ],
          locale,
        )}
      />
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">

        {/* Campaign Selection */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-12 text-center tracking-tight">{t("hero.title")}</h1>
              <div className="grid md:grid-cols-3 gap-6">
                {CAMPAIGNS.map((campaign) => (
                  <Card key={campaign.version} className="border-2 border-primary/20 bg-card hover:border-primary/40 transition-all flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl">{t("campaignTitle", { version: campaign.version })}</CardTitle>
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <CardDescription>{campaignCopy[campaign.version]?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-muted-foreground mb-3">{t("rewardTanks")}</div>
                        <div className="space-y-1.5 min-h-[180px]">
                          {campaign.rewards.map((reward) => (
                            <div key={reward} className="flex items-center gap-2 text-sm bg-secondary/30 px-3 py-2 rounded">
                              <Trophy className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="text-foreground">{reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Link href={campaign.href} className="mt-4">
                        <Button className="w-full" size="lg">
                          {t("viewCampaign")}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{t("features.heading")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.secureTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.secureBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.expertTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.expertBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.guaranteedTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.guaranteedBody")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("features.fastTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("features.fastBody")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
