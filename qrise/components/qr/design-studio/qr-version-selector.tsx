"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Info, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

  // Auto toggle state: default is ON (true)
  const [isAuto, setIsAuto] = useState<boolean>(
    design.qrVersion === undefined || design.qrVersion === 0
  );

  const [localVersion, setLocalVersion] = useState(
    design.qrVersion && design.qrVersion > 0
      ? Math.max(design.qrVersion, minVersion)
      : minVersion
  );

  // When auto is toggled
  const handleToggleAuto = (checked: boolean) => {
    setIsAuto(checked);
    if (checked) {
      // Auto deduce: 0 triggers QRCodeStyling to auto-compute minimal version
      setDesign({ qrVersion: 0 });
    } else {
      // Manual mode: set to current local version
      const targetVersion = Math.max(localVersion, minVersion);
      setLocalVersion(targetVersion);
      setDesign({ qrVersion: targetVersion });
    }
  };

  // Metrics based on version
  const activeVersion = isAuto ? minVersion : localVersion;
  const modules = 4 * activeVersion + 17;
  const sizeStr = `${modules}×${modules}`;

  let capacity = "Low";
  if (activeVersion > 10 && activeVersion <= 20) capacity = "Medium";
  else if (activeVersion > 20 && activeVersion <= 30) capacity = "High";
  else if (activeVersion > 30) capacity = "Very High";

  let scannability = "Good";
  if (activeVersion > 25) scannability = "Harder";

  return (
    <div className="space-y-4">
      {/* Auto vs Manual Toggle Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="space-y-0.5 min-w-0 pr-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Auto QR Density & Version
            </span>
            {isAuto && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Auto
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {isAuto
              ? `Auto-deducted (V${minVersion} • ${sizeStr})`
              : "Manual mode: choose custom matrix density"}
          </p>
        </div>

        <Switch
          id="auto-qr-version"
          checked={isAuto}
          onCheckedChange={handleToggleAuto}
        />
      </div>

      {/* Manual Matrix & Density Settings (Hidden when Auto is ON) */}
      {!isAuto && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Manual Density Slider
            </label>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              Version {localVersion}
            </span>
          </div>

          <input
            type="range"
            min={minVersion}
            max={40}
            step={1}
            value={localVersion}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLocalVersion(val);
              setDesign({ qrVersion: val });
            }}
            className="range-slider w-full accent-emerald-600"
          />

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Version Matrix Settings</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
                  Size
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">{sizeStr}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
                  Capacity
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {capacity}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
                  Scannability
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {scannability}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
