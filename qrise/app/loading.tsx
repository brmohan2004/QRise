import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
          <Loader2 className="absolute top-0 left-0 h-12 w-12 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading QRise...
        </p>
      </div>
    </div>
  );
}