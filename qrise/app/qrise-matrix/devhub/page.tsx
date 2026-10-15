"use client";

import { useState, useEffect } from "react";
import { 
  Key, 
  Zap, 
  Settings, 
  Plus, 
  Terminal, 
  ShieldCheck, 
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { DevHubHeader } from "./components/devhub-header";
import { cn } from "@/lib/utils";

// Components from existing pages
import { KeysList } from "@/components/app/api-keys/keys-list";
import { CreateKeyDialog } from "@/components/app/api-keys/create-key-dialog";
import { TypesGrid } from "@/components/app/custom-types/types-grid";
import { CreateTypeDialog } from "@/components/app/custom-types/create-type-dialog";
import { WebhooksList } from "@/components/app/webhooks/webhooks-list";
import { CreateWebhookDialog } from "@/components/app/webhooks/create-webhook-dialog";

const TABS = [
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "custom-types", label: "Custom Types", icon: Zap },
  { id: "webhooks", label: "Webhooks", icon: Settings },
];

export default function MatrixDevHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "api-keys";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Dialog states
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/qrise-matrix/devhub?tab=${value}`, { scroll: false });
  };

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    }
  });

  const maxCustomTypes = userData?.planLimits?.maxCustomTypes ?? 0;
  const isCustomTypesLocked = maxCustomTypes === 0;

  const handleFloatingCreate = () => {
    if (activeTab === "api-keys") {
      setIsCreateKeyOpen(true);
    } else if (activeTab === "custom-types") {
      if (!isCustomTypesLocked) {
        setIsCreateTypeOpen(true);
      }
    } else if (activeTab === "webhooks") {
      setIsCreateWebhookOpen(true);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Mobile Back Button */}
      <div className="flex items-center justify-between lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="h-9 w-9 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 shadow-sm shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4 sm:space-y-6">
        <div className="relative overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-gray-100/70 dark:bg-slate-800/60 p-1 rounded-2xl border border-gray-200/60 dark:border-slate-800 w-max flex items-center justify-start shadow-sm">
            {TABS.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="rounded-xl px-4 sm:px-6 py-1.5 text-xs font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="relative min-h-[400px]">
          {/* API Keys Content */}
          <TabsContent value="api-keys" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6"
            >
              <div className="lg:col-span-8">
                <KeysList />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 bg-slate-950 rounded-2xl text-white relative overflow-hidden group shadow-sm border border-slate-800">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Terminal className="h-16 w-16" />
                  </div>
                  <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">Quick Start</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">
                    Use your API keys with our SDK for industrial barcode generation and webhook ingestion.
                  </p>
                  <Button 
                    asChild
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold uppercase text-xs tracking-wider h-9 rounded-xl transition-all shadow-sm border-none relative z-10"
                  >
                    <a href="/docs/sdk" target="_blank" rel="noopener noreferrer">View SDK Docs</a>
                  </Button>
                </div>

                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 space-y-2">
                  <h3 className="text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">Rate Limits</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Keys are subject to plan throughput rates. Monitor telemetry & scan quotas in real time.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Custom Types Content */}
          <TabsContent value="custom-types" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {isCustomTypesLocked && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-amber-900 dark:text-amber-200 text-xs">Custom Types are locked</h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">Upgrade your plan to define specialized industrial QR and barcode types.</p>
                  </div>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-xs tracking-wider px-6 h-9 rounded-xl w-full sm:w-auto"
                    asChild
                  >
                    <a href="/pricing">View Plans</a>
                  </Button>
                </div>
              )}

              <TypesGrid />
            </motion.div>
          </TabsContent>

          {/* Webhooks Content */}
          <TabsContent value="webhooks" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6"
            >
              <div className="lg:col-span-8">
                <WebhooksList />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 bg-indigo-600 rounded-2xl text-white relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldCheck className="h-16 w-16" />
                  </div>
                  <h3 className="text-indigo-100 font-bold text-xs uppercase tracking-wider mb-1">Security</h3>
                  <p className="text-xs text-indigo-50 leading-relaxed mb-4 relative z-10">
                    All webhook events are digitally signed with an HMAC-SHA256 signature header.
                  </p>
                  <Button 
                    asChild
                    className="w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold uppercase text-xs tracking-wider h-9 rounded-xl transition-all shadow-sm border-none relative z-10"
                  >
                    <a href="/docs/webhooks" target="_blank" rel="noopener noreferrer">Guide</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating Action Button (Fixed Bottom-Right, tab-adaptive) */}
      <button
        type="button"
        onClick={handleFloatingCreate}
        disabled={activeTab === "custom-types" && isCustomTypesLocked}
        className={cn(
          "fixed bottom-6 sm:bottom-8 right-5 sm:right-8 z-40 w-14 h-14 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl shadow-black/35 flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 outline-none ring-4 ring-white/90 dark:ring-slate-900/90 group",
          activeTab === "custom-types" && isCustomTypesLocked && "opacity-50 cursor-not-allowed hover:scale-100"
        )}
        aria-label={
          activeTab === "api-keys" 
            ? "Create New Key" 
            : activeTab === "custom-types" 
            ? "Define New Type" 
            : "Add Webhook"
        }
        title={
          activeTab === "api-keys" 
            ? "Create New Key" 
            : activeTab === "custom-types" 
            ? "Define New Type" 
            : "Add Webhook"
        }
      >
        <Plus className="w-6 h-6 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90 group-active:scale-90" />
      </button>

      {/* Dialogs */}
      <CreateKeyDialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen} />
      <CreateTypeDialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen} />
      <CreateWebhookDialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen} />
    </div>
  );
}
