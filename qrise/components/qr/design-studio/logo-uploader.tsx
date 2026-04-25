"use client";

import { useState, useRef } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { useUserStore } from "@/stores/user.store";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";

export function LogoUploader() {
  const { design, setDesign } = useWizardStore();
  const { user } = useUserStore();
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const blobUrlRef = useRef<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("File too large: Logo must be under 500KB");
      return;
    }

    setIsUploading(true);

    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;

    setDesign({ ...design, logoUrl: blobUrl });

    try {
      const userId = user?.id || 'anonymous';
      const result = await uploadFileToCloudinary(file, `qrise/logos/${userId}`);

      setDesign({
        ...design,
        logoUrl: result.secure_url,
        logoPublicId: result.public_id,
      });

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.warn('Cloudinary upload failed, using blob URL:', error);
      toast.warning("Logo saved for this session");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setDesign({
      ...design,
      logoUrl: undefined,
      logoPublicId: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Center Logo</h3>
        
        {design.logoUrl ? (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="h-16 w-16 bg-white border rounded-lg flex items-center justify-center p-1 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={design.logoUrl} 
                alt="Logo preview" 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Logo applied</p>
              <button
                onClick={handleRemove}
                className="text-xs text-red-600 hover:text-red-700 mt-1 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Remove logo
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-colors">
            <Upload className="h-6 w-6 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">
              {isUploading ? "Uploading..." : "Click to upload logo"}
            </span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG or SVG (max 500KB)</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Logo Size</h3>
        <input
          type="range"
          min="10"
          max="30"
          defaultValue="20"
          disabled={!design.logoUrl}
          className="w-full accent-[#0F6E56] disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={(e) => {
            // Note: Add logoSize to QRDesign type if needed for sizing
            // setDesign({ ...design, logoSize: parseInt(e.target.value) })
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Small (Better scannability)</span>
          <span>Large (Harder to scan)</span>
        </div>
      </div>
    </div>
  );
}
