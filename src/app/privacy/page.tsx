import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Account credentials for service delivery</li>
                <li>Email addresses for communication</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Service preferences and requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and deliver our boosting services</li>
                <li>Process your payments and transactions</li>
                <li>Send you service updates and communications</li>
                <li>Improve our services and customer experience</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information. All account credentials are encrypted and stored securely. We use VPN protection during service delivery to ensure your account safety and privacy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share information only with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Trusted service providers who assist in our operations</li>
                <li>Law enforcement when required by law</li>
                <li>Professional boosters assigned to your order (limited to necessary game credentials only)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Account credentials are deleted immediately after service completion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to improve your browsing experience. See our Cookie Policy for more details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at privacy@cyberskill.com.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              Last Updated: December 1, 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
