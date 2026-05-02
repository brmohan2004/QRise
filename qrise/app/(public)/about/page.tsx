import { Metadata } from 'next';
import { BreadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "About Us - The Team Behind QRise",
  description: "Learn about QRise, our mission to revolutionize physical-to-digital connections, and the team building the ultimate dynamic QR code platform for modern businesses.",
  alternates: {
    canonical: "https://qrise.app/about",
  },
  openGraph: {
    title: "About QRise - Our Mission & Team",
    description: "We're building the future of physical-to-digital connections with dynamic QR codes.",
    url: "https://qrise.app/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://qrise.app" },
        { name: "About", url: "https://qrise.app/about" },
      ]} />
      <article className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-black mb-6 tracking-tight text-gray-900">About QRise</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building the future of physical-to-digital connections.
          </p>
        </header>
        
        <div className="prose prose-slate mx-auto text-left max-w-none">
          <section aria-label="Our Mission">
            <h2>Our Mission</h2>
            <p>QRise was founded with a simple mission: to make QR codes powerful, dynamic, and beautiful. We believe every QR code should be more than just a black-and-white square — it should be a branded, trackable, intelligent gateway between the physical and digital worlds.</p>
          </section>

          <section aria-label="The Problem We Solve">
            <h2>The Problem We Solve</h2>
            <p>Traditional QR codes are static — once printed, their destination is permanent. If you need to change where a QR code points, you have to reprint everything: flyers, business cards, product packaging, signage. This wastes time, money, and materials.</p>
            <p>QRise solves this with <strong>dynamic QR codes</strong> that can be updated instantly. Change your destination URL, enable smart routing by device or location, and track every single scan — all from a single dashboard.</p>
          </section>

          <section aria-label="What Makes QRise Different">
            <h2>What Makes QRise Different</h2>
            <ul>
              <li><strong>Dynamic by Default:</strong> Every QR code you create is editable. Change destinations without reprinting.</li>
              <li><strong>Real-time Analytics:</strong> Track scans by device, location, time, and referrer with our powerful analytics dashboard.</li>
              <li><strong>Design Studio:</strong> Full branding control — customize colors, add logos, choose styles and frames.</li>
              <li><strong>Developer-First API:</strong> REST API with live and sandbox environments, HMAC webhooks, and granular scopes.</li>
              <li><strong>Form Builder:</strong> Collect data with drag-and-drop forms attached to your QR codes.</li>
              <li><strong>Bulk Generation:</strong> Create hundreds of QR codes from CSV in minutes.</li>
            </ul>
          </section>

          <section aria-label="Who Uses QRise">
            <h2>Who Uses QRise</h2>
            <p>QRise is trusted by marketing teams, event organizers, retail brands, healthcare providers, logistics companies, and developers worldwide. From small startups to enterprises, our platform scales to meet every need.</p>
          </section>

          <section aria-label="Our Vision">
            <h2>Our Vision</h2>
            <p>We envision a world where every physical object can seamlessly connect to digital experiences. QRise is the bridge that makes this possible — powerful, beautiful, and accessible to everyone.</p>
          </section>
        </div>
      </article>
    </>
  );
}
