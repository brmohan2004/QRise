"use client";

import landingData from "@/data/before-auth/landing.json";
import "./trusted-by.css";

const companies = landingData.companies;

export function TrustedBy() {
  return (
    <section className="trusted-by-section" aria-label="Trusted Companies">
      <div className="trusted-by-container">
        <div className="trusted-by-header">
          <div className="trusted-by-line" />
          <p className="trusted-by-title">
            Trusted by forward-thinking teams
          </p>
          <div className="trusted-by-line" />
        </div>
        
        <div className="trusted-by-marquee-wrapper">
          {/* Gradient Overlays for smooth fading */}
          <div className="marquee-overlay-left" />
          <div className="marquee-overlay-right" />

          <div className="marquee-container">
            <div className="marquee-content">
              {[...companies, ...companies, ...companies].map((company, index) => (
                <div key={`${company}-${index}`} className="company-item">
                  <span className="company-name">
                    {company}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}