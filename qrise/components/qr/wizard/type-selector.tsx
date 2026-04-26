"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { useRouter } from "next/navigation";
import { Link, Globe, Lock, Layers, Grid3X3, Shuffle, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QRType } from "@/types/qr.types";

const qrTypes = [
  {
    type: "url" as QRType,
    name: "URL QR",
    icon: Globe,
    description: "Standard link QR code",
  },
  {
    type: "smart_routing" as QRType,
    name: "Smart Routing",
    icon: Shuffle,
    description: "Route scans by device, location, or time",
  },
  {
    type: "password" as QRType,
    name: "Password Protected",
    icon: Lock,
    description: "Gate your URL behind a password",
  },
  {
    type: "multi_action" as QRType,
    name: "Multiple Action",
    icon: Layers,
    description: "Let users pick from multiple destinations",
  },
  {
    type: "bulk" as QRType,
    name: "Bulk Generator",
    icon: Grid3X3,
    description: "Generate hundreds of QRs from a spreadsheet",
  },
];

export function TypeSelector({ 
  enabledFlags = { password: true, multiAction: true, bulk: true, smartRouting: true, designStudio: true } 
}: { 
  enabledFlags?: { password: boolean; multiAction: boolean; bulk: boolean; smartRouting: boolean; designStudio: boolean } 
}) {
  const router = useRouter();
  const { qrType, isDynamic, setType, setDynamic, reset } = useWizardStore();
  const [selected, setSelected] = useState<QRType | null>(null);

  // Always start fresh when landing on the type selector
  useEffect(() => {
    reset();
  }, [reset]);

  const filteredTypes = qrTypes.filter(item => {
    if (item.type === "password") return enabledFlags.password;
    if (item.type === "multi_action") return enabledFlags.multiAction;
    if (item.type === "bulk") return enabledFlags.bulk;
    if (item.type === "smart_routing") return enabledFlags.smartRouting;
    return true;
  });

  const handleContinue = () => {
    if (selected) {
      setType(selected);
      router.push(`/create/${selected}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Choose QR Type</h2>
        <p className="text-sm text-gray-500 mt-1">Select the type of QR code you want to create</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => setSelected(item.type)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all",
              selected === item.type
                ? "border-[#0F6E56] bg-[#0F6E56]/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            {selected === item.type && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#0F6E56] flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <item.icon className={cn("h-8 w-8 mb-3", selected === item.type ? "text-[#0F6E56]" : "text-gray-400")} />
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </button>
        ))}
      </div>

      {/* Dynamic QR Toggle */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center h-5">
          <input
            id="dynamic"
            type="checkbox"
            checked={isDynamic}
            onChange={(e) => setDynamic(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#0F6E56] focus:ring-[#0F6E56]"
          />
        </div>
        <div className="ml-2">
          <label htmlFor="dynamic" className="text-sm font-medium text-gray-900">
            Make this QR dynamic
          </label>
          <p className="text-xs text-gray-500">
            Change your destination URL anytime without reprinting
          </p>
        </div>
        <div className="ml-auto group relative">
          <HelpCircle className="h-4 w-4 text-gray-400" />
          <div className="absolute right-0 w-64 p-2 bg-gray-900 text-white text-xs rounded hidden group-hover:block z-10">
            Dynamic QRs store a short link that points to your URL. You can update the destination anytime in your dashboard.
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}