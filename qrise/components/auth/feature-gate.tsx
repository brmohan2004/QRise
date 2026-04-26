import { isFeatureEnabled } from "@/lib/feature-flags";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export async function FeatureGate({ 
  flag, 
  children, 
  fallback,
  title = "Feature Disabled",
  description = "This feature is currently disabled by the administrator."
}: FeatureGateProps) {
  const isEnabled = await isFeatureEnabled(flag);

  if (isEnabled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white border rounded-3xl min-h-[400px]">
      <div className="w-20 h-20 bg-gray-50 text-gray-400 flex items-center justify-center rounded-full mb-6">
        <Lock className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 font-medium max-w-sm mb-8">
        {description}
      </p>
      <Button asChild className="bg-[#0F6E56] hover:bg-[#0d5c48] h-12 px-8 font-bold rounded-xl shadow-lg shadow-emerald-100">
        <Link href="/dashboard">
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
