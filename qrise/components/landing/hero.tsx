"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./hero.css";

export function Hero() {
  return (
    <section className="hero-section" aria-label="Dynamic QR Code Generator">
      <div className="hero-container">
        <div className="hero-grid">
          {/* Text content */}
          <div className="hero-content">
            <h1 className="hero-title flex flex-wrap items-center justify-center gap-x-2">
              <span className="text-gray-900 animate-blur-focus-in stagger-delay-1">The</span>
              <strong className="animate-blur-focus-in stagger-delay-2">QR code platform</strong>
              <span className="text-gray-900 animate-blur-focus-in stagger-delay-3">built for</span>
              <span className="text-[#0F6E56] animate-blur-focus-in stagger-delay-4">real results</span>
            </h1>
            <p className="hero-description animate-blur-focus-in stagger-delay-5">
              Create <strong>dynamic QR codes</strong>, <strong>multiple action menus</strong>, and <strong>password protected</strong> links that track every scan. Change destinations anytime without
              reprinting. Powerful <strong>analytics</strong>, <strong>design studio</strong>, and integrations for modern
              teams. Free to start.
            </p>
            <div className="hero-actions animate-blur-focus-in stagger-delay-6">
              <Link href="/register" className="hero-btn-primary" aria-label="Create your free QR code — sign up for QRise">
                Start for free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#demo" className="hero-btn-secondary" aria-label="See the QRise analytics dashboard demo">
                See it live
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats animate-blur-focus-in stagger-delay-7" role="group" aria-label="QRise platform statistics">
              <div className="stat-item">
                <p className="stat-value">10,000+</p>
                <p className="stat-label">QR codes created</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">2M+</p>
                <p className="stat-label">scans tracked</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">Free</p>
                <p className="stat-label">forever to start</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}