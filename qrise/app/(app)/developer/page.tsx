"use client";

import { useState, useEffect } from "react";
import { 
  Key, 
  Zap, 
  Settings, 
  BarChart3, 
  Plus, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Download, 
  ArrowUpRight,
  Calendar,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function DeveloperHubPage() {
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
    router.push(`/developer?tab=${value}`, { scroll: false });
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">Developer Hub</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Integrate QRise into your existing workflow with our API and webhooks.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AnimatePresence mode="wait">
            {activeTab === "api-keys" && (
              <motion.div
                key="api-keys-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  onClick={() => setIsCreateKeyOpen(true)}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white h-9 sm:h-10 px-4 sm:px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Key
                </Button>
              </motion.div>
            )}
            {activeTab === "custom-types" && (
              <motion.div
                key="custom-types-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  onClick={() => setIsCreateTypeOpen(true)}
                  disabled={isCustomTypesLocked}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white h-9 sm:h-10 px-4 sm:px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm gap-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Define New Type
                </Button>
              </motion.div>
            )}
            {activeTab === "webhooks" && (
              <motion.div
                key="webhooks-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  onClick={() => setIsCreateWebhookOpen(true)}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white h-9 sm:h-10 px-4 sm:px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4 sm:space-y-6">
        <div className="relative overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-gray-50/50 p-1 rounded-2xl border border-gray-100 w-max flex items-center justify-start shadow-sm">
            {TABS.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="rounded-xl px-4 sm:px-6 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="h-3 w-3" />
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
                <div className="p-5 bg-gray-900 rounded-2xl text-white relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Terminal className="h-16 w-16" />
                  </div>
                  <h3 className="text-emerald-400 font-black text-[8px] uppercase tracking-widest mb-1">Quick Start</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 relative z-10">
                    Use your API keys with our SDK for a typed developer experience.
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-white hover:text-black font-black uppercase text-[9px] tracking-widest h-9 rounded-xl transition-all"
                  >
                    <a href="/docs/sdk" target="_blank" rel="noopener noreferrer">View SDK Docs</a>
                  </Button>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-2">
                  <h3 className="text-emerald-700 font-black text-[8px] uppercase tracking-widest">Rate Limits</h3>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                    Keys are subject to rate limits based on your plan. View usage in the list.
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
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-black text-amber-900 text-xs">Custom Types are locked</h3>
                    <p className="text-[11px] text-amber-700 font-medium">Upgrade to start defining your own QR types.</p>
                  </div>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[9px] tracking-widest px-6 h-9 rounded-xl w-full sm:w-auto"
                    asChild
                  >
                    <a href="/pricing">View Plans</a>
                  </Button>
                </div>
              )}

              <TypesGrid />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-900 rounded-2xl text-white space-y-3">
                  <h3 className="text-emerald-400 font-black text-[8px] uppercase tracking-widest">Edge Resolvers</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Connect your custom types to any HTTPS endpoint. QRise handles the scan at the edge.
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-emerald-400"
                    asChild
                  >
                    <a href="/docs" target="_blank" rel="noopener noreferrer">Docs →</a>
                  </Button>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-3">
                  <h3 className="text-emerald-700 font-black text-[8px] uppercase tracking-widest">Marketplace</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Build useful QR types and share them. Verified types earn badges.
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-emerald-600"
                    asChild
                  >
                    <a href="/marketplace">Explore →</a>
                  </Button>
                </div>
              </div>
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
                <div className="p-5 bg-emerald-600 rounded-2xl text-white relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldCheck className="h-16 w-16" />
                  </div>
                  <h3 className="text-emerald-100 font-black text-[8px] uppercase tracking-widest mb-1">Security</h3>
                  <p className="text-xs text-emerald-50 leading-relaxed mb-4 relative z-10">
                    All webhooks are signed with a unique secret. Verify using HMAC-SHA256.
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-emerald-400 text-white hover:bg-white hover:text-emerald-600 font-black uppercase text-[9px] tracking-widest h-9 rounded-xl transition-all relative z-10"
                  >
                    <a href="/docs/webhooks" target="_blank" rel="noopener noreferrer">Guide</a>
                  </Button>
                </div>

                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
                  <h3 className="text-gray-900 font-black text-[8px] uppercase tracking-widest">Retry Policy</h3>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    If fails, QRise retries up to 6 times over 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <CreateKeyDialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen} />
      <CreateTypeDialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen} />
      <CreateWebhookDialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen} />
    </div>
  );
}
