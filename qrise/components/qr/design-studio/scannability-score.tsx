"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { calculateScannabilityScore } from "@/lib/scannability";
import { useEffect, useState } from "react";

export function ScannabilityScore({ onWarning }: { onWarning?: (warn: boolean) => void }) {
  const { design } = useWizardStore();
  const [score, setScore] = useState(100);

   useEffect(() => {
     const dotColor = design.dotColor || "#000000";
     const bgColor = design.bgColor || "#ffffff";
     
     // Estimate logo coverage (for a QR, logo typically takes 10-30% when added)
     // This is an estimate since we don't have actual image dimensions
     const logoCoverage = design.logoUrl ? 20 : 0;
     
     const calculated = calculateScannabilityScore(dotColor, bgColor, logoCoverage);
    
    setScore(calculated);
    
    if (onWarning) {
      onWarning(calculated < 60);
    }
  }, [design, onWarning]);

  let statusColor = "text-green-600";
  let bgGradient = "conic-gradient(#16a34a var(--score), #f3f4f6 0deg)";
  let Icon = CheckCircle2;
  let message = "Excellent scannability";

  if (score < 60) {
    statusColor = "text-red-600";
    bgGradient = "conic-gradient(#dc2626 var(--score), #f3f4f6 0deg)";
    Icon = AlertCircle;
    message = "Poor scannability — increase contrast or reduce logo size. Cannot finish.";
  } else if (score < 80) {
    statusColor = "text-amber-600";
    bgGradient = "conic-gradient(#d97706 var(--score), #f3f4f6 0deg)";
    Icon = AlertTriangle;
    message = "Acceptable — minor adjustments recommended";
  }

  return (
    <div className="flex flex-col items-center mt-6 p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
        style={{ 
          background: bgGradient.replace('--score', `${score * 3.6}deg`),
          position: "relative"
        }}
      >
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-lg font-bold text-gray-900">
          {score}
        </div>
      </div>
      
      <div className={`flex items-start gap-2 ${statusColor} text-sm max-w-[250px]`}>
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="leading-snug text-left">{message}</p>
      </div>
    </div>
  );
}
