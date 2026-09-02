import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Privacy Policy | Glow with Rubi",
  description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <div className="container-narrow section-padding">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-8">
            Last updated: August 30, 2026
          </p>

          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Introduction</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Glow with Rubi (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bridal makeup services and website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>Name and contact details (phone, email, WhatsApp)</li>
                    <li>Event date, time, and location</li>
                    <li>Payment information (processed securely)</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Technical Information</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>IP address and browser type</li>
                    <li>Device information</li>
                    <li>Pages visited and time spent</li>
                    <li>Referring website</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Process and manage your bookings</li>
                <li>Communicate about your appointments and services</li>
                <li>Send important updates and notifications via WhatsApp</li>
                <li>Improve our services and website experience</li>
                <li>Process payments securely</li>
                <li>Respond to your enquiries and requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only with:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Service providers who assist in our operations (payment processors, messaging services)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Security</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We implement appropriate security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is completely secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings or our cookie consent tool.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                For questions about this Privacy Policy or your personal information, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-[var(--color-muted)]/30 rounded-lg">
                <p className="font-medium">Glow with Rubi</p>
                <p className="text-[var(--color-muted-foreground)]">Email: privacy@glowwithrubi.com</p>
                <p className="text-[var(--color-muted-foreground)]">Phone: +91 XXXXX XXXXX</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}