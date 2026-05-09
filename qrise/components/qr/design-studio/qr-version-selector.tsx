"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Info } from "lucide-react";

export function QRVersionSelector() {
  const { design, setDesign, config, qrType, isDynamic, editingQrId } =
    useWizardStore();

  // Build preview data to calculate actual data length
  const getPreviewData = () => {
    if (!qrType) return "https://qrise.com";
    if (isDynamic) {
      const shortCode =
        (config as any)?.shortCode || editingQrId || "preview-code";
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://qrise.com";
      return `${origin}/s/${shortCode}`;
    }
    if (qrType === "url")
      return (config as any)?.targetUrl || "https://qrise.com";
    if (qrType === "smart_routing")
      return (config as any)?.defaultUrl || "https://qrise.com";
    return "https://qrise.com/preview";
  };
  const data = getPreviewData();

  // Alphanumeric capacity at EC-level Q for versions 1-40
  const getMinVersion = (length: number) => {
    const capacities = [
      0, 13, 22, 34, 48, 62, 76, 88, 110, 132, 154, 180, 206, 244, 261, 292,
      322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751, 805, 868, 908,
      982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663,
    ];
    for (let i = 1; i <= 40; i++) {
      if (length <= capacities[i]) return i;
    }
    return 40;
  };

  const minVersion = getMinVersion(data.length);
  const globalVersion = design.qrVersion
    ? Math.max(design.qrVersion, minVersion)
    : minVersion;

  const [localVersion, setLocalVersion] = useState(globalVersion);

  useEffect(() => {
    setLocalVersion(globalVersion);
  }, [globalVersion]);

  // Metrics based on version
  const modules = 4 * localVersion + 17;
  const sizeStr = `${modules}×${modules}`;

  let capacity = "Low";
  if (localVersion > 10 && localVersion <= 20) capacity = "Medium";
  else if (localVersion > 20 && localVersion <= 30) capacity = "High";
  else if (localVersion > 30) capacity = "Very High";

  let scannability = "Good";
  if (localVersion > 25) scannability = "Harder";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">
          QR Version (Density)
        </label>
        <span className="text-xs font-medium text-gray-500 tabular-nums">
          Version {localVersion}{" "}
          {localVersion === minVersion && "(Auto-minimum)"}
        </span>
      </div>

      <input
        type="range"
        min={minVersion}
        max={40}
        step={1}
        value={localVersion}
        onChange={(e) => setLocalVersion(Number(e.target.value))}
        onMouseUp={() => setDesign({ qrVersion: localVersion })}
        onTouchEnd={() => setDesign({ qrVersion: localVersion })}
        className="range-slider w-full"
      />

      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
          <Info className="w-3.5 h-3.5" />
          <span>Version Metrics</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2 rounded border border-gray-100 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Size
            </div>
            <div className="text-xs font-semibold text-gray-700">{sizeStr}</div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Capacity
            </div>
            <div className="text-xs font-semibold text-gray-700">
              {capacity}
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Scannability
            </div>
            <div className="text-xs font-semibold text-gray-700">
              {scannability}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
