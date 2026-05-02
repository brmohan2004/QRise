import { Metadata } from 'next';
import { BreadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "QRise Terms of Service — the terms and conditions governing your use of the QRise dynamic QR code platform, API, and related services.",
  alternates: {
    canonical: "https://qrise.app/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://qrise.app" },
        { name: "Terms of Service", url: "https://qrise.app/terms" },
      ]} />
      <article className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 prose prose-slate">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: May 2026</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using QRise (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
        </section>
        
        <section>
          <h2>2. Description of Service</h2>
          <p>QRise provides a platform for dynamic QR code generation, scan tracking and analytics, custom QR design, form building, and API access. The Service includes free and paid subscription tiers.</p>
        </section>
        
        <section>
          <h2>3. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activities under your account. Notify us immediately of any unauthorized use.</p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use QRise for:</p>
          <ul>
            <li>Any unlawful, fraudulent, or malicious purpose</li>
            <li>Distributing malware, phishing links, or harmful content via QR codes</li>
            <li>Violating intellectual property rights of third parties</li>
            <li>Attempting to gain unauthorized access to our systems or other users&apos; accounts</li>
            <li>Generating excessive API requests beyond your plan&apos;s rate limits</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>The QRise platform, including its design, code, and documentation, is owned by QRise Inc. You retain ownership of the content you create using our Service, including QR code destinations and form data.</p>
        </section>

        <section>
          <h2>6. Subscription & Billing</h2>
          <p>Paid plans are billed monthly or annually as selected during checkout. You may cancel your subscription at any time. Refunds are handled on a case-by-case basis. Usage limits reset at the beginning of each billing cycle.</p>
        </section>

        <section>
          <h2>7. API Usage</h2>
          <p>API access is subject to rate limits defined by your subscription plan. Abuse of API endpoints may result in temporary or permanent suspension of API access. HMAC-signed webhook payloads must be verified by your application.</p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>We reserve the right to suspend or terminate your account if you violate these terms. Upon termination, your right to use the Service ceases immediately. You may request export of your data before account deletion.</p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>QRise is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, QRise Inc. shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@qrise.com">support@qrise.com</a>.</p>
        </section>
      </article>
    </>
  );
}
