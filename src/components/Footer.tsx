"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Twitter, Instagram, Youtube } from "lucide-react"

// TikTok icon component (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Footer() {
  const t = useTranslations("footer")
  const tn = useTranslations("serviceNav")

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/cyberskill.pro/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/cyberskill_pro", label: "X (Twitter)" },
    { icon: Youtube, href: "https://youtube.com/@cyberskill_pro?si=kYuqfP3VD30aTvrN", label: "YouTube" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@cyberskill.pro", label: "TikTok" },
  ]

  const legalLinks = [
    { label: t("legal.terms"), href: "/terms" },
    { label: t("legal.privacy"), href: "/privacy" },
    { label: t("legal.cookies"), href: "/cookies" },
    { label: t("legal.guarantee"), href: "/guarantee" },
    { label: t("legal.referral"), href: "/referral" },
  ]

  const serviceLinks = [
    { label: tn("wn8Boost"), href: "/services/wn8-boost" },
    { label: tn("creditFarm"), href: "/services/credit-farm" },
    { label: tn("campaign"), href: "/services/campaign-missions" },
    { label: tn("moe"), href: "/services/mark-of-excellence" },
    { label: tn("onslaught"), href: "/services/onslaught" },
    { label: tn("tierLeveling"), href: "/services/tier-leveling" },
    { label: tn("expFarm"), href: "/services/exp-farm" },
    { label: tn("aceTanker"), href: "/services/ace-tanker" },
    { label: tn("battlePass"), href: "/services/battle-pass" },
    { label: tn("referralProgram"), href: "/services/referral-program" },
  ]

  return (
    <footer className="bg-secondary/30 border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/cyber-skill_logo.svg"
                alt="CyberSkill Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("servicesHeading")}</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("legalHeading")}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("connectHeading")}</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-card/50 border border-border/50 hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {t("copyright", { year: new Date().getFullYear() })}
            <p className="text-xs text-muted-foreground">
              {t("disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
