"use client"

import Link from "next/link"
import Image from "next/image"
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
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/cyberskill.pro/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/cyberskill_pro", label: "X (Twitter)" },
    { icon: Youtube, href: "https://youtube.com/@cyberskill_pro?si=kYuqfP3VD30aTvrN", label: "YouTube" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@cyberskill.pro", label: "TikTok" },
  ]

  const legalLinks = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Guarantee", href: "/guarantee" },
  ]

  const serviceLinks = [
    { label: "WN8, Winrate, High Damage", href: "/services/wn8-boost" },
    { label: "Credit and Bonds Farming", href: "/services/credit-farm" },
    { label: "Campaign Missions", href: "/services/campaign-missions" },
    { label: "Mark of Excellence", href: "/services/mark-of-excellence" },
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
              Professional World of Tanks boosting services. Raise your WN8, get 3 Marks of Excellence, and complete campaign missions effortlessly.
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
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
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
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
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
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
              © 2017-{new Date().getFullYear()} CyberSkill. All rights reserved.
            <p className="text-xs text-muted-foreground">
              Not affiliated with Wargaming. World of Tanks is a trademark of Wargaming.net.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
