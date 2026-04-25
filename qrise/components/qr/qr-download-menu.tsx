"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QRDownloadMenuProps {
  id: string;
  name: string;
}

export function QRDownloadMenu({ id, name }: QRDownloadMenuProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const toast = useToast();

  const handleDownload = async (format: string, dpi?: number) => {
    const key = dpi ? `${format}-${dpi}` : format;
    setDownloading(key);

    try {
      let url = `/api/qr/${id}/export?format=${format}`;
      if (dpi) url += `&dpi=${dpi}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `qrise-${name.replace(/\s+/g, '-').toLowerCase()}-${format}${dpi ? `-${dpi}dpi` : ''}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error("Download failed: There was a problem downloading your QR code.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleDownload('png', 72)}
          disabled={downloading !== null}
        >
          {downloading === 'png-72' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          PNG (72 DPI)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDownload('png', 300)}
          disabled={downloading !== null}
        >
          {downloading === 'png-300' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          PNG (300 DPI)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDownload('svg')}
          disabled={downloading !== null}
        >
          {downloading === 'svg' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          SVG Vector
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDownload('pdf')}
          disabled={downloading !== null}
        >
          {downloading === 'pdf' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          PDF Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
