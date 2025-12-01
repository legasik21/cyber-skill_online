import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Cookie Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-3">
                CyberSkill uses cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Collect anonymous data about website usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">Session Cookies</h3>
                  <p className="text-muted-foreground">
                    Temporary cookies that expire when you close your browser. These are essential for navigating the website and using its features.
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">Persistent Cookies</h3>
                  <p className="text-muted-foreground">
                    Remain on your device for a set period or until you delete them. These help us remember your preferences across visits.
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">Third-Party Cookies</h3>
                  <p className="text-muted-foreground">
                    Set by third-party services we use, such as analytics providers. These help us improve our services and understand user behavior.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-4 text-left">Cookie Name</th>
                      <th className="py-2 px-4 text-left">Purpose</th>
                      <th className="py-2 px-4 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">session_id</td>
                      <td className="py-2 px-4">Maintain user session</td>
                      <td className="py-2 px-4">Session</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">preferences</td>
                      <td className="py-2 px-4">Store user preferences</td>
                      <td className="py-2 px-4">1 year</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">analytics_id</td>
                      <td className="py-2 px-4">Website analytics</td>
                      <td className="py-2 px-4">2 years</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4">cookie_consent</td>
                      <td className="py-2 px-4">Remember cookie preferences</td>
                      <td className="py-2 px-4">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              <p className="text-muted-foreground mb-3">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use your browser settings to block or delete cookies</li>
                <li>Adjust your cookie preferences in our cookie consent banner</li>
                <li>Use browser extensions or privacy tools</li>
                <li>Clear cookies regularly through your browser</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Please note that blocking essential cookies may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
              <p className="text-muted-foreground mb-3">
                We use third-party services that may set cookies, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Google Analytics (website analytics)</li>
                <li>Payment processors (secure transactions)</li>
                <li>Social media platforms (social sharing features)</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                These third parties have their own privacy policies and cookie policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy to reflect changes in our practices or for legal reasons. Please check this page periodically for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at privacy@cyberskill.com.
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
