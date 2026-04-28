"use client";

import Link from "next/link";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  QrCode, 
  FormInput, 
  Code2, 
  Settings, 
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { useSidebarStore } from "@/stores/sidebar.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My QR Codes", href: "/qr-codes", icon: QrCode },
  { label: "Form Builder", href: "/forms", icon: FormInput },
  { label: "API Manager", href: "/api-manager", icon: Code2 },
];

export function SidebarNav({ 
  className, 
  onNavClick, 
  isMobile = false 
}: { 
  className?: string, 
  onNavClick?: () => void,
  isMobile?: boolean 
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resetWizard = useWizardStore((state) => state.reset);
  const { isCollapsed, toggle } = useSidebarStore();

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    }
  });

  const collapsed = isCollapsed && !isMobile;

  const user = {
    name: userData?.fullName || "Mohan",
    email: userData?.email || "mohan@example.com",
    plan: userData?.plan?.name || "Pro",
    avatar_url: userData?.avatarUrl
  };

  return (
    <TooltipProvider delay={0}>
      <div className={cn("flex flex-col h-full bg-card relative", className)}>
        <motion.div 
          animate={{ 
            paddingLeft: collapsed ? 16 : 24, 
            paddingRight: collapsed ? 16 : 24,
            justifyContent: collapsed ? "center" : "space-between"
          }}
          transition={{ duration: 0 }}
          className="flex h-16 items-center border-b"
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0 }}
              >
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 font-bold text-xl text-primary"
                  onClick={onNavClick}
                >
                  <Image 
                    src="/logo.png" 
                    alt="QRise" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 object-contain"
                  />
                  <span>QRise</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="mini-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0 }}
                className="shrink-0"
              >
                <Image 
                  src="/logo.png" 
                  alt="QRise" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 text-muted-foreground hover:bg-muted transition-all duration-200", 
                collapsed 
                  ? "absolute -right-3.5 top-20 z-50 bg-background border shadow-sm rounded-full h-7 w-7 flex items-center justify-center hover:scale-110 hover:text-primary active:scale-95" 
                  : ""
              )}
              onClick={toggle}
            >
              {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </motion.div>

        <div className="px-4 py-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild 
                className={cn(
                  "w-full gap-2 h-10 shadow-sm rounded-xl font-bold transition-all",
                  collapsed ? "justify-center px-0" : "justify-start"
                )} 
                size="sm"
                onClick={() => { resetWizard(); onNavClick?.(); }}
              >
                <Link href="/create">
                  <Plus className="w-4 h-4 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0 }}
                        className="whitespace-nowrap ml-2"
                      >
                        Create QR
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Create QR</TooltipContent>}
          </Tooltip>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
          {navItems.map((item) => {
            const isSettings = item.label === "Settings";
            const isActive = isSettings 
              ? searchParams.get("settings") === "true" 
              : pathname === item.href;
            
            const href = isSettings ? `?settings=true` : item.href;
            
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center rounded-xl py-2.5 text-sm font-bold transition-all duration-200 overflow-hidden",
                      collapsed ? "justify-center px-0" : "gap-3 px-4",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0 }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t space-y-3">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-3 space-y-2.5 mb-2 bg-primary/5 rounded-2xl border border-primary/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Plan Usage</span>
                </div>
                <span className="text-[11px] font-black text-primary">850 / 1000</span>
              </div>
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                />
              </div>
              <Link 
                href="?usage=true" 
                className="flex items-center justify-center gap-1.5 w-full py-2 text-[10px] font-black text-primary hover:bg-primary/10 rounded-xl transition-all border border-primary/20 bg-white/50"
              >
                VIEW DETAILED USAGE
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}
          <UserMenu 
            user={user} 
            isCollapsed={collapsed}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}