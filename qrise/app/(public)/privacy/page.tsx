import { Metadata } from 'next';
import { BreadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "QRise Privacy Policy — learn how we collect, use, store, and protect your personal data when you use our dynamic QR code platform.",
  alternates: {
    canonical: "https://qrise.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://qrise.app" },
        { name: "Privacy Policy", url: "https://qrise.app/privacy" },
      ]} />
      <article className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: May 2026</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, create QR codes, or communicate with us. This includes:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and password when you register.</li>
            <li><strong>QR Code Data:</strong> Destination URLs, design preferences, and form configurations you create.</li>
            <li><strong>Scan Analytics:</strong> Anonymous scan data including device type, approximate location, timestamp, and referrer.</li>
            <li><strong>Usage Data:</strong> How you interact with our platform, including pages visited and features used.</li>
          </ul>
        </section>
        
        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve QRise services</li>
            <li>Generate scan analytics and reporting for your QR codes</li>
            <li>Send service-related communications and updates</li>
            <li>Detect and prevent fraud, abuse, or security issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2>3. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. This includes:</p>
          <ul>
            <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
            <li>HMAC-signed webhook payloads for API integrations</li>
            <li>Row Level Security (RLS) on all database tables</li>
            <li>Regular security audits and vulnerability assessments</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time by contacting <a href="mailto:support@qrise.com">support@qrise.com</a>.</p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>QRise uses trusted third-party services for infrastructure and analytics. These may include cloud hosting, payment processing, and email delivery services. Each provider is contractually obligated to protect your data.</p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. Contact us at <a href="mailto:support@qrise.com">support@qrise.com</a> to exercise these rights.</p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:support@qrise.com">support@qrise.com</a>.</p>
        </section>
      </article>
    </>
  );
}
