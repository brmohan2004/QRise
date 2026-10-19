"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Globe, Share2 } from "lucide-react";

type FooterLink = { name: string; href: string; icon?: React.ComponentType<{ className?: string }> };

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "API Reference", href: "/docs" },
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
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const filteredFooterLinks = {
    ...footerLinks,
    Product: footerLinks.Product.filter(link => link.name !== "Pricing" || pricingEnabled)
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
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
          <p className="footer-copyright">
            &copy; {currentYear} QRise Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Giant Bottom Brand Display Watermark */}
      <div className="footer-display-brand" aria-hidden="true">
        QRise
      </div>
    </footer>
  );
}