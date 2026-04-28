"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import "./hero.css";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          {/* Text content */}
          <div className="hero-content">
            <h1 className="hero-title">
              The QR platform built for{" "}
              <span>real results</span>
            </h1>
            <p className="hero-description">
              Create dynamic QR codes that track every scan — change destinations anytime without
              reprinting. Powerful analytics, design tools, and integrations for modern
              teams.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="hero-btn-primary">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#demo" className="hero-btn-secondary">
                See it live
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats">
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

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span className="scroll-text">Scroll to explore</span>
      </div>
    </section>
  );
}