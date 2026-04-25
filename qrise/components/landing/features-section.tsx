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
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to go beyond basic QR
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern marketing and data collection
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative rounded-xl border border-gray-200 p-6 hover:border-[#0F6E56] hover:shadow-lg transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0F6E56]/10 mb-4 group-hover:bg-[#0F6E56] transition-colors">
                <feature.icon className="h-6 w-6 text-[#0F6E56] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}