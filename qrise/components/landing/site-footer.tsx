"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, MessageCircle, Loader2, CheckCircle, Globe, Share2 } from "lucide-react";

type FooterLink = { name: string; href: string; icon?: React.ComponentType<{ className?: string }> };

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Explore Templates", href: "/explore" },
    { name: "Docs", href: "/docs" },
    { name: "API Reference", href: "/docs" },
  ],
  "Use Cases": [
    { name: "Marketing Campaigns", href: "/features" },
    { name: "Event Management", href: "/explore" },
    { name: "Product Packaging", href: "/features" },
    { name: "Business Cards", href: "/features" },
    { name: "Retail & Logistics", href: "/explore" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  Connect: [
    { name: "Twitter", href: "https://twitter.com/QRiseApp", icon: Share2 },
    { name: "GitHub", href: "https://github.com/qrise", icon: Globe },
    { name: "Discord", href: "https://discord.gg/qrise", icon: MessageCircle },
  ],
};

import "./site-footer.css";

export function SiteFooter({ pricingEnabled = true }: { pricingEnabled?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const filteredFooterLinks = {
    ...footerLinks,
    Product: footerLinks.Product.filter(link => link.name !== "Pricing" || pricingEnabled)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("idle");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      setStatus("idle");
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        {/* Newsletter section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">
              Stay up to date
            </h3>
            <p className="newsletter-subtitle">
              Get the latest QR code tips, product updates, and industry news delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="newsletter-form" aria-label="Newsletter signup">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="newsletter-input"
                required
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="newsletter-btn"
                aria-label="Subscribe to newsletter"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : status === "success" ? (
                  <CheckCircle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <nav className="footer-links-grid" aria-label="Footer navigation">
          {Object.entries(filteredFooterLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="footer-col-title">{category}</h4>
              <ul className="footer-link-list">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      {...(link.href.startsWith("http") ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                    >
                      {link.icon && (
                        <link.icon className="h-4 w-4" aria-hidden="true" />
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-brand">
            <QrCode className="brand-icon h-6 w-6" aria-hidden="true" />
            <span className="brand-name">QRise</span>
          </div>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} QRise Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}