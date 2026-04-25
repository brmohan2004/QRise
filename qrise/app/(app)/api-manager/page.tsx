"use client";

import { useState } from "react";
import { Key, Globe, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeysSection } from "@/components/app/api-keys-section";
import { WebhooksSection } from "@/components/app/webhooks-section";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function ApiManagerPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks">("keys");

  // Fetch user profile to check plan features
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
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userData && !userData.plan?.has_api) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border rounded-3xl">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-full mb-6">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">API Access Required</h2>
        <p className="text-slate-500 font-medium max-w-sm mb-8">
          The API Manager is only available on our Business and Enterprise plans. Upgrade today to unlock automated QR management.
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-bold rounded-xl shadow-lg shadow-indigo-100">
          Upgrade Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Developer Hub</h1>
          <p className="text-slate-500 font-medium">Build, automate, and integrate QRise into your workflows.</p>
        </div>
        
        <Button variant="outline" asChild className="gap-2 font-bold border-indigo-100">
          <Link href="/docs">
            <BookOpen className="h-4 w-4" />
            API Documentation
          </Link>
        </Button>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("keys")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "keys" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Key className="h-4 w-4" />
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "webhooks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Globe className="h-4 w-4" />
          Webhooks
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {activeTab === "keys" ? <ApiKeysSection /> : <WebhooksSection />}
      </div>
    </div>
  );
}
