"use client";

import { useState } from "react";
import { Key, Globe, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeysSection } from "@/components/app/api-keys-section";
import { WebhooksSection } from "@/components/app/webhooks-section";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ApiManagerClient() {
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks">("keys");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data || json;
    }
  });

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-600/20" />
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Initializing Hub...</p>
      </div>
    );
  }

  if (userData && !userData.plan?.has_api) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-[2rem] mb-8 shadow-inner border border-emerald-100/50">
          <Lock className="h-10 w-10" />
        </div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Premium Feature</p>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">API Access Required</h2>
        <p className="text-gray-500 font-medium max-w-sm mb-10 leading-relaxed">
          The Developer Hub is exclusive to our Business and Enterprise plans. Upgrade to automate your workflow.
        </p>
        <Button className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95">
          Upgrade Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Developer Hub</p>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Overview</h2>
          <p className="text-gray-500 text-sm font-medium">
            Professional-grade API & Webhook management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">API System Active</span>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="h-9 font-black text-[10px] uppercase tracking-widest bg-white shadow-sm border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
          >
            <Link href="/docs">
              <BookOpen className="h-3.5 w-3.5 mr-2" />
              API Documentation
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("keys")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "keys" 
                ? "bg-white text-emerald-600 shadow-sm border border-emerald-50" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Key className="h-3.5 w-3.5" />
            <span>API Keys</span>
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "webhooks" 
                ? "bg-white text-emerald-600 shadow-sm border border-emerald-50" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Webhooks</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-emerald-500/5 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active System</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 pt-4">
        {activeTab === "keys" ? <ApiKeysSection /> : <WebhooksSection />}
      </div>
    </div>
  );
}
