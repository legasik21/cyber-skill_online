import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using CyberSkill's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="text-muted-foreground">
                CyberSkill provides World of Tanks account boosting services, including but not limited to WN8 boosting, credit farming, campaign missions completion, and Mark of Excellence achievements. All services are provided by experienced professional players.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Security</h2>
              <p className="text-muted-foreground">
                We take account security seriously and use VPN protection for all services. However, you acknowledge that account boosting may violate the game's terms of service. CyberSkill is not responsible for any actions taken by Wargaming against your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground">
                All payments must be made in full before service delivery begins. Prices are subject to change without notice. Refunds are handled on a case-by-case basis and must be requested within 24 hours of service initiation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
              <p className="text-muted-foreground">
                You are responsible for providing accurate account information and maintaining the confidentiality of your login credentials. You must not use our services for any illegal or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                CyberSkill shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid for the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modifications to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at contact@cyberskill.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
