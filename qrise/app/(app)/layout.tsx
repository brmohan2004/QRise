"use client";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { AppHeader } from "@/components/app/app-header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, Suspense, useEffect } from "react";
import { GeneralDialog } from "@/components/settings/general-dialog";
import { BackupDialog } from "@/components/settings/backup-dialog";
import { ManagementDialog } from "@/components/app/management-dialog";
import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

import { useUsageLimit } from "@/lib/hooks/use-usage-limit";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { CreateSheet } from "@/components/app/create-sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { openModal } = useUsageLimit();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error: any) => {
          if (error?.status === 429 || error?.message?.includes('429')) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        onError: (error: any) => {
          // Detect 429 Rate Limit Errors
          if (error?.status === 429 || error?.message?.includes('429')) {
            try {
              // Try to extract metadata from error message if JSON
              const message = error.message?.replace('Error: ', '') || '';
              const data = JSON.parse(message);
              if (data.error === 'QUOTA_EXCEEDED') {
                openModal(data.plan || 'free', data.can_enable_overages || false);
                return;
              }
            } catch (e) {
              // Fallback to defaults
              openModal('free', false);
            }
          }
        }
      }
    },
  }));

  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-desktop-compact flex h-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 80 : 256 }}
          transition={{ duration: 0 }}
          className="hidden lg:flex border-r"
          suppressHydrationWarning
        >
          <SidebarNav className="w-full" isMobile={false} />
        </motion.div>

        <div className="flex flex-1 flex-col overflow-hidden relative min-h-0">
          <AppHeader />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-[30px] pb-32 lg:pb-[30px]">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <CreateSheet />
      <Suspense fallback={null}>
        <GeneralDialog />
        <BackupDialog />
        <ManagementDialog />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
