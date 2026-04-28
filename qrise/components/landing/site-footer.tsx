"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, MessageCircle, Loader2, CheckCircle, Globe, Share2 } from "lucide-react";

type FooterLink = { name: string; href: string; icon?: React.ComponentType<{ className?: string }> };

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "API", href: "/docs" },
  ],
  Resources: [
    { name: "Blog", href: "#" },
    { name: "Changelog", href: "#" },
    { name: "Status", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ],
  Connect: [
    { name: "Twitter", href: "#", icon: Share2 },
    { name: "GitHub", href: "#", icon: Globe },
    { name: "Discord", href: "#", icon: MessageCircle },
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
    <footer className="site-footer">
      <div className="footer-container">
        {/* Newsletter section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">
              Stay up to date
            </h3>
            <p className="newsletter-subtitle">
              Get the latest news and updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="newsletter-btn"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links-grid">
          {Object.entries(filteredFooterLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="footer-col-title">{category}</h4>
              <ul className="footer-link-list">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                    >
                      {link.icon && (
                        <link.icon className="h-4 w-4" />
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-brand">
            <QrCode className="brand-icon h-6 w-6" />
            <span className="brand-name">QRise</span>
          </div>
          <p className="footer-copyright">
            Built with love for QR enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}