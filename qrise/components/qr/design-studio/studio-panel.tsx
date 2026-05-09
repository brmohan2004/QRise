"use client";
// Design studio panel for QR customization

import { useWizardStore } from "@/stores/qr-wizard.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "./color-picker";
import { DotPatternSelector } from "./dot-pattern-selector";
import { LogoUploader } from "./logo-uploader";
import { FrameSelector } from "./frame-selector";
import { EyeShapeSelector } from "./eye-shape-selector";
import { EyeAndFrameColorPicker } from "./eye-frame-color-picker";
import { QRVersionSelector } from "./qr-version-selector";
import { SizeSelector } from "./size-selector";
import { RotateCcw } from "lucide-react";

export function StudioPanel() {
  const { design, setDesign } = useWizardStore();

  const handleReset = () => {
    setDesign({
      dotColor: "#000000",
      bgColor: "#ffffff",
      logoUrl: undefined,
      frameStyle: "none",
      dotStyle: "square",
      qrVersion: 0,
      shape: "square",
      width: 300,
      height: 300,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">Design Studio</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">Customize the look and feel of your QR code</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-100 hover:border-emerald-100 active:scale-95 shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="frame">Frame & Eyes</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-6 mt-6">
          <SizeSelector />
          <div className="h-px bg-gray-200 w-full" />
          <ColorPicker />
          <div className="h-px bg-gray-200 w-full" />
          <DotPatternSelector />
          <div className="h-px bg-gray-200 w-full" />
          <QRVersionSelector />
        </TabsContent>

        <TabsContent value="logo" className="mt-6">
          <LogoUploader />
        </TabsContent>

        <TabsContent value="frame" className="space-y-6 mt-6">
          <FrameSelector />
          <div className="h-px bg-gray-200 w-full" />
          <EyeShapeSelector />
          <div className="h-px bg-gray-200 w-full" />
          <EyeAndFrameColorPicker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
