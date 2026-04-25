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

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

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
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter section */}
        <div className="border-b border-gray-800 pb-12">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              Stay up to date
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest news and updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                required
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="px-4 py-2 bg-[#0F6E56] rounded-lg font-medium hover:bg-[#0d5c48] transition-colors disabled:opacity-50"
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
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
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-[#0F6E56]" />
            <span className="font-semibold">QRise</span>
          </div>
          <p className="text-sm text-gray-400">
            Built with love for QR enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}