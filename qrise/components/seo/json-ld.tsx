export function JsonLd({ data, nonce }: { data: Record<string, unknown>; nonce?: string }) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning={true}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Pre-built schemas for common page types
export function OrganizationSchema({ nonce }: { nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "QRise",
        url: "https://qrise.app",
        logo: "https://qrise.app/logo.png",
        description: "Dynamic QR code platform with powerful analytics, design tools, and integrations.",
        foundingDate: "2025",
        sameAs: [
          "https://twitter.com/QRiseApp",
          "https://github.com/qrise",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@qrise.com",
          contactType: "customer support",
          availableLanguage: "English",
        },
      }}
    />
  );
}

export function WebApplicationSchema({ nonce }: { nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "QRise",
        url: "https://qrise.app",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting. Powerful analytics, design tools, and integrations for modern teams.",
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "49",
          priceCurrency: "USD",
          offerCount: "3",
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
              description: "Free forever plan with core QR code features",
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "19",
              priceCurrency: "USD",
              description: "Professional plan with advanced analytics and design tools",
            },
            {
              "@type": "Offer",
              name: "Enterprise",
              price: "49",
              priceCurrency: "USD",
              description: "Enterprise plan with API access and custom integrations",
            },
          ],
        },
        featureList: [
          "Dynamic QR Codes",
          "Scan Analytics & Tracking",
          "Custom Design Studio",
          "Form Builder",
          "REST API Access",
          "Bulk QR Code Generation",
          "Smart Routing by device, location, time",
          "Webhook Integrations",
          "Custom QR Type Marketplace",
        ],
        screenshot: "https://qrise.app/og-image.png",
        softwareVersion: "2.0",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "6",
          bestRating: "5",
          worstRating: "1",
        },
      }}
    />
  );
}

export function SoftwareApplicationSchema({ nonce }: { nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "QRise - Dynamic QR Code Generator",
        url: "https://qrise.app",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "Professional dynamic QR code generator with scan analytics, design studio, form builder, and API. Free to start.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "6",
          bestRating: "5",
        },
      }}
    />
  );
}

export function FAQSchema({ faqs, nonce }: { faqs: { question: string; answer: string }[]; nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbSchema({ items, nonce }: { items: { name: string; url: string }[]; nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function HowToSchema({ nonce }: { nonce?: string }) {
  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Create a Dynamic QR Code with QRise",
        description: "Learn how to create a dynamic QR code that tracks scans and allows destination editing without reprinting.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Sign up for free",
            text: "Create a free QRise account at qrise.app/register. No credit card required.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Create your QR code",
            text: "Enter your destination URL and customize the design with colors, logos, and frames in the Design Studio.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Download and deploy",
            text: "Download your QR code in high resolution PNG or SVG format. Track every scan in real-time analytics.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Edit anytime",
            text: "Change the destination URL anytime from your dashboard without reprinting the physical QR code.",
          },
        ],
        totalTime: "PT2M",
        tool: {
          "@type": "HowToTool",
          name: "QRise Platform",
        },
      }}
    />
  );
}

export function ReviewSchema({ nonce }: { nonce?: string }) {
  const reviews = [
    {
      author: "John D.",
      reviewBody: "QRise has transformed how we track our marketing campaigns. The analytics are incredible.",
      reviewRating: 5,
    },
    {
      author: "Sarah M.",
      reviewBody: "The dynamic QR feature is a game changer. We never have to reprint materials again.",
      reviewRating: 5,
    },
    {
      author: "Robert K.",
      reviewBody: "Bulk generation saved us hours of work. Created 500 QR codes in minutes.",
      reviewRating: 5,
    },
    {
      author: "Amy L.",
      reviewBody: "The smart routing feature lets us send different content to different audiences seamlessly.",
      reviewRating: 5,
    },
    {
      author: "Mike P.",
      reviewBody: "Great API support. Integrated QR generation into our app in under an hour.",
      reviewRating: 5,
    },
    {
      author: "Emma W.",
      reviewBody: "The design studio is amazing. Our QR codes actually look good now!",
      reviewRating: 5,
    },
  ];

  return (
    <JsonLd
      nonce={nonce}
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "QRise",
        description: "Dynamic QR code platform with powerful analytics, design tools, and integrations.",
        brand: {
          "@type": "Brand",
          name: "QRise",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: reviews.length.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        review: reviews.map((r) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.author,
          },
          reviewBody: r.reviewBody,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.reviewRating.toString(),
            bestRating: "5",
          },
        })),
      }}
    />
  );
}
