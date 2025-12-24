"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing and using CyberSkill&apos;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
              <p>
                CyberSkill provides World of Tanks account boosting services, including but not limited to WN8 improvement, credit farming, campaign missions, and Mark of Excellence achievements. All services are performed by experienced players acting as independent contractors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Security & Risks</h2>
              <p>
                We use VPN protection matching your location to minimize risks. However, you acknowledge that using boosting services is a violation of the Game Developer&apos;s (Wargaming) End User License Agreement (EULA). CyberSkill is not responsible for any penalties, temporary bans, or permanent account suspensions. You use our services at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Conduct During Service</h2>
              <p>
                To ensure safety, you must not log into your account while the service is being performed without prior coordination with our support team. Concurrent sessions from different locations significantly increase the risk of account flagging.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment & Refunds</h2>
              <p>
                All payments must be made in full before service delivery. Prices are subject to change. Refunds are handled on a case-by-case basis. If a refund is requested after the service has started, CyberSkill reserves the right to deduct a prorated amount for the work already completed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
              <p>
                CyberSkill shall not be liable for any indirect, incidental, or consequential damages (including loss of in-game assets or account access). Our total liability is strictly limited to the amount paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Information</h2>
              <p>
                For any inquiries regarding these Terms, please contact us at: <a href="mailto:cyberskillwot@gmail.com" className="text-primary hover:underline">cyberskillwot@gmail.com</a>.
              </p>
            </section>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
