"use client";

import { 
  QrCode, 
  GitBranch, 
  BarChart3, 
  Palette, 
  FileText, 
  Layers,
  Smartphone,
  MapPin
} from "lucide-react";

import landingData from "@/data/before-auth/landing.json";
import "./features-section.css";

const iconMap = {
  QrCode,
  GitBranch,
  BarChart3,
  Palette,
  FileText,
  Layers,
  Smartphone,
  MapPin
};

const features = landingData.features.map(f => ({
  ...f,
  icon: iconMap[f.icon as keyof typeof iconMap] || QrCode
}));

export function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Everything you need to go beyond basic QR
          </h2>
          <p className="features-subtitle">
            Powerful features designed for modern marketing and data collection
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.name} className="feature-card">
              <div className="feature-icon-wrapper">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="feature-title">{feature.name}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}