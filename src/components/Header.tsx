"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false)

  const services = [
    { id: "wn8-boost", label: "WN8, Winrate, High Damage", href: "/services/wn8-boost" },
    { id: "credit-farm", label: "Credit and Bonds Farming", href: "/services/credit-farm" },
    { 
      id: "campaign", 
      label: "Campaign Missions", 
      href: "/services/campaign-missions",
      children: [
        { id: "campaign-1", label: "Campaign 1.0 (Obj. 260)", href: "/services/campaign-missions/1.0" },
        { id: "campaign-2", label: "Campaign 2.0 (Obj. 279e)", href: "/services/campaign-missions/2.0" },
        { id: "campaign-3", label: "Campaign 3.0 (Black Rock)", href: "/services/campaign-missions/3.0" },
      ]
    },
    { id: "moe", label: "Mark of Excellence", href: "/services/mark-of-excellence" },
    { id: "onslaught", label: "Onslaught", href: "/services/onslaught" },
    { id: "tier-leveling", label: "Tier Leveling", href: "/services/tier-leveling" },
    { id: "exp-farm", label: "Exp Farm", href: "/services/exp-farm" },
    { id: "ace-tanker", label: "Ace Tanker", href: "/services/ace-tanker" },
    { id: "battle-pass", label: "Battle Pass", href: "/services/battle-pass" },
    { id: "referral", label: "Referral Program", href: "/services/referral-program" },
  ]

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Guarantee", href: "/#guarantee" },
    { label: "Reviews", href: "/#reviews" },
    { label: "Contact", href: "/#contact" },
  ]

  const toggleSubmenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setOpenSubmenu(openSubmenu === id ? null : id)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/cyber-skill_logo.svg" 
              alt="CyberSkill Logo" 
              width={50} 
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsDesktopServicesOpen(true)}
              onMouseLeave={() => setIsDesktopServicesOpen(false)}
            >
              <Link
                href="/#services"
                className="text-foreground hover:text-primary transition-colors font-medium flex items-center py-2"
                aria-expanded={isDesktopServicesOpen}
              >
                Services
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDesktopServicesOpen ? 'rotate-180' : ''}`} />
              </Link>
              
              {/* Dropdown Menu */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 w-72 bg-card border border-border rounded-lg shadow-xl transition-all duration-200 z-50 overflow-visible ${
                  isDesktopServicesOpen 
                    ? "opacity-100 visible translate-y-0" 
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="py-2">
                  {services.map((service) => {
                    if (service.children) {
                      return (
                        <div key={service.id} className="relative group/sub">
                          <Link
                             href={service.href}
                             className="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors border-b border-border/50 last:border-0"
                          >
                             {service.label}
                             <ChevronRight className="w-4 h-4" />
                          </Link>
                          {/* Nested Dropdown */}
                           <div className="absolute top-0 right-full mr-0 w-64 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50 overflow-hidden">
                              <div className="py-2">
                                {service.children.map((child) => (
                                   <Link
                                    key={child.id}
                                    href={child.href}
                                    className="block px-4 py-3 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors border-b border-border/50 last:border-0"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                           </div>
                        </div>
                      )
                    }
                    return (
                      <Link
                        key={service.id}
                        href={service.href}
                        className="block px-4 py-3 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors border-b border-border/50 last:border-0"
                      >
                        {service.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <Button size="sm" className="ml-4" asChild>
              <Link href="/#services">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border/50 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Services Submenu */}
              <div className="px-2">
                <div className="text-foreground font-medium mb-2 pl-2">Services</div>
                <div className="pl-4 space-y-1 bg-secondary/10 rounded-lg py-2">
                  {services.map((service) => {
                     if (service.children) {
                       return (
                         <div key={service.id}>
                           <button
                             onClick={(e) => toggleSubmenu(service.id, e)}
                             className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-secondary/20"
                           >
                             {service.label}
                             <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === service.id ? 'rotate-180' : ''}`} />
                           </button>
                           {openSubmenu === service.id && (
                             <div className="pl-4 space-y-1 border-l-2 border-primary/20 ml-2 mt-1">
                               {service.children.map((child) => (
                                 <Link
                                   key={child.id}
                                   href={child.href}
                                   className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-secondary/20"
                                   onClick={() => setIsMenuOpen(false)}
                                 >
                                   {child.label}
                                 </Link>
                               ))}
                             </div>
                           )}
                         </div>
                       )
                     }

                    return (
                      <Link
                        key={service.id}
                        href={service.href}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-secondary/20"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
              
              <Button size="sm" className="w-full" asChild>
                <Link href="/#services" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
