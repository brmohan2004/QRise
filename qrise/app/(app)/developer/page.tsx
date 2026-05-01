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
import { UsageCards } from "@/components/app/usage/usage-cards";
import { UsageChart } from "@/components/app/usage/usage-chart";
import { PlanSelector } from "@/components/app/usage/plan-selector";
import { AlertChannelsSection } from "@/components/app/usage/alert-channels-section";

const TABS = [
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "custom-types", label: "Custom Types", icon: Zap },
  { id: "webhooks", label: "Webhooks", icon: Settings },
  { id: "usage", label: "Usage & Billing", icon: BarChart3 },
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
  const [exportLoading, setExportLoading] = useState(false);

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

  const { data: usageData } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/usage");
      return (await res.json()).data;
    }
  });

  const nextResetDate = usageData?.period?.resets_at ? new Date(usageData.period.resets_at) : null;
  const daysToReset = nextResetDate ? Math.ceil((nextResetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const maxCustomTypes = userData?.planLimits?.maxCustomTypes ?? 0;
  const isCustomTypesLocked = maxCustomTypes === 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Developer Center</p>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Developer Hub</h1>
              </div>
            </div>
            <p className="text-gray-500 font-medium max-w-2xl text-sm leading-relaxed">
              Integrate QRise into your existing workflow with our powerful API, webhooks, and custom processing logic.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <AnimatePresence mode="wait">
              {activeTab === "api-keys" && (
                <motion.div
                  key="api-keys-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full md:w-auto"
                >
                  <Button 
                    onClick={() => setIsCreateKeyOpen(true)}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                  className="w-full md:w-auto"
                >
                  <Button 
                    onClick={() => setIsCreateTypeOpen(true)}
                    disabled={isCustomTypesLocked}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                  className="w-full md:w-auto"
                >
                  <Button 
                    onClick={() => setIsCreateWebhookOpen(true)}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Webhook
                  </Button>
                </motion.div>
              )}
              {activeTab === "usage" && (
                <motion.div
                  key="usage-btns"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2 w-full md:w-auto"
                >
                   <Button 
                    variant="outline"
                    className="flex-1 md:flex-none h-10 px-6 border-gray-200 bg-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    onClick={() => {
                      setExportLoading(true);
                      setTimeout(() => {
                        setExportLoading(false);
                        window.open("/api/v1/usage/export", "_blank");
                      }, 1000);
                    }}
                    disabled={exportLoading}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {exportLoading ? "Exporting..." : "Export"}
                  </Button>
                  <Button 
                    className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                    asChild
                  >
                    <a href="/pricing">
                      Upgrade
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6 sm:space-y-8">
          <div className="relative overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="bg-white/50 p-1 rounded-2xl border border-gray-200/50 backdrop-blur-sm w-max md:w-max flex items-center justify-start shadow-sm min-w-full sm:min-w-0">
              {TABS.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="rounded-xl px-5 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative min-h-[500px]">
            {/* API Keys Content */}
            <TabsContent value="api-keys" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8"
              >
                <div className="lg:col-span-8 space-y-6">
                  <KeysList />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Terminal className="h-20 w-20" />
                    </div>
                    <h3 className="text-emerald-400 font-black text-[9px] uppercase tracking-widest">Quick Start</h3>
                    <p className="text-xs text-gray-300 font-medium leading-relaxed mb-5 relative z-10">
                      Use your API keys with our SDK for a typed developer experience.
                    </p>
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-white hover:text-black font-black uppercase text-[9px] tracking-widest h-10 rounded-xl transition-all relative z-10"
                    >
                      <a href="/docs/sdk">View SDK Docs</a>
                    </Button>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3">
                    <h3 className="text-primary font-black text-[9px] uppercase tracking-widest">Rate Limits</h3>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                      Each key is subject to rate limits based on your plan. View usage in the list or the dedicated Usage page.
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-primary"
                      onClick={() => handleTabChange("usage")}
                    >
                      Detailed Usage →
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Custom Types Content */}
            <TabsContent value="custom-types" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6 sm:space-y-8"
              >
                {isCustomTypesLocked && (
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-500 shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                      <h3 className="font-black text-amber-900 text-sm">Custom Types are locked on your plan</h3>
                      <p className="text-xs text-amber-700 font-medium">
                        Upgrade to start defining your own QR types and processing logic.
                      </p>
                    </div>
                    <Button 
                      className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[9px] tracking-widest px-6 h-10 rounded-xl w-full md:w-auto"
                      asChild
                    >
                      <a href="/pricing">View Plans</a>
                    </Button>
                  </div>
                )}

                <TypesGrid />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-900 rounded-3xl text-white space-y-4">
                    <h3 className="text-primary font-black text-[9px] uppercase tracking-widest">Edge Resolvers</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                      Connect your custom types to any HTTPS endpoint. QRise handles the scan at the edge and proxies the request to your server.
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-primary"
                      asChild
                    >
                      <a href="/docs">Read Documentation →</a>
                    </Button>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                    <h3 className="text-emerald-700 font-black text-[9px] uppercase tracking-widest">Marketplace</h3>
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Build useful QR types and share them with the world. Verified types earn badges and increased scan limits.
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-emerald-600"
                      asChild
                    >
                      <a href="/marketplace">Explore Marketplace →</a>
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
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8"
              >
                <div className="lg:col-span-8 space-y-6">
                  <WebhooksList />
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 bg-emerald-600 rounded-3xl text-white relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck className="h-20 w-20" />
                    </div>
                    <h3 className="text-emerald-100 font-black text-[9px] uppercase tracking-widest mb-3">Security</h3>
                    <p className="text-xs text-emerald-50 font-medium leading-relaxed mb-5 relative z-10">
                      All webhooks are signed with a unique secret. Verify signatures using HMAC-SHA256 to ensure authenticity.
                    </p>
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full border-emerald-400 text-white hover:bg-white hover:text-emerald-600 font-black uppercase text-[9px] tracking-widest h-10 rounded-xl transition-all relative z-10"
                    >
                      <a href="/docs/webhooks">Signature Guide</a>
                    </Button>
                  </div>

                  <div className="p-6 bg-gray-100/50 rounded-3xl border border-gray-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-200/50 rounded-lg">
                        <Activity className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 font-black text-[9px] uppercase tracking-widest">Retry Policy</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                      If your server fails, QRise will retry delivery up to 6 times over 24 hours using an exponential backoff strategy.
                    </p>
                    <div className="pt-1">
                      <p className="text-[8px] font-black uppercase text-primary tracking-widest cursor-pointer hover:underline">Learn more →</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Usage Content */}
            <TabsContent value="usage" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6 sm:space-y-8"
              >
                <UsageCards />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  <div className="lg:col-span-8">
                    <UsageChart />
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 bg-gray-900 rounded-3xl text-white space-y-4 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-20 w-20" />
                      </div>
                      <h3 className="text-emerald-400 font-black text-[9px] uppercase tracking-widest">Next Reset</h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-black">{daysToReset} Days</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {nextResetDate ? nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed relative z-10">
                        Your limits will reset automatically at 00:00 UTC. Unused calls do not roll over.
                      </p>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <h3 className="text-amber-900 font-black text-[9px] uppercase tracking-widest">Plan: {userData?.plan?.name || "Free"}</h3>
                      </div>
                      <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                        You are currently using {usageData?.consumed?.api_calls?.pct || 0}% of your resources. Consider upgrading for unlimited codes.
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-amber-600"
                        asChild
                      >
                        <a href="/settings/billing">Manage Subscription →</a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-black text-gray-900 tracking-tight ml-1">Subscription Plans</h2>
                  <PlanSelector />
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <AlertChannelsSection />
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateKeyDialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen} />
      <CreateTypeDialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen} />
      <CreateWebhookDialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen} />
    </div>
  );
}
