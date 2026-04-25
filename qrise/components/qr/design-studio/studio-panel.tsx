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
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Design Studio</h2>
          <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your QR code</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to default
        </button>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="frame">Frame & Eyes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="space-y-6 mt-6">
          <ColorPicker />
          <div className="h-px bg-gray-200 w-full" />
          <DotPatternSelector />
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
