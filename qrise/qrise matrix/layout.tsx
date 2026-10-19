"use client";

import { AppHeader } from "@/components/app/app-header";
import { MatrixSidebarNav } from "./_components/matrix-sidebar-nav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, Suspense, useEffect } from "react";
import { GeneralDialog } from "@/components/settings/general-dialog";
import { BackupDialog } from "@/components/settings/backup-dialog";
import { ManagementDialog } from "@/components/app/management-dialog";
import { useSidebarStore } from "@/stores/sidebar.store";
import { motion } from "framer-motion";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { CreateSheet } from "@/components/app/create-sheet";

export default function MatrixLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error: any) => {
          if (error?.status === 429 || error?.message?.includes('429')) return false;
          return failureCount < 3;
        },
      },
    },
  }));

  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
        {/* Desktop Matrix Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 80 : 256 }}
          transition={{ duration: 0 }}
          className="hidden lg:flex border-r"
          suppressHydrationWarning
        >
          <MatrixSidebarNav className="w-full" isMobile={false} />
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
