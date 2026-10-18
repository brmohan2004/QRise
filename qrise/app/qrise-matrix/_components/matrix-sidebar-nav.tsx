"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FolderKanban, 
  Code2, 
  Sparkles,
  PanelLeftClose, 
  PanelLeftOpen,
  ArrowLeftRight
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/app/user-menu";
import { useSidebarStore } from "@/stores/sidebar.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { Tag } from "lucide-react";

const matrixNavItems = [
  { label: "Projects", href: "/qrise-matrix/projects", icon: FolderKanban },
  { label: "My Labels", href: "/qrise-matrix/my-labels", icon: Tag },
  { label: "Marketplace", href: "/qrise-matrix/marketplace", icon: ShoppingCart },
  { label: "Developer Hub", href: "/qrise-matrix/devhub", icon: Code2 },
];

export function MatrixSidebarNav({ 
  className, 
  onNavClick, 
  isMobile = false 
}: { 
  className?: string, 
  onNavClick?: () => void,
  isMobile?: boolean 
}) {
  const pathname = usePathname();
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
    name: userData?.fullName || "",
    email: userData?.email || "",
    plan: userData?.plan?.name || "",
    avatar_url: userData?.avatarUrl
  };

  return (
    <TooltipProvider delay={0}>
      <div className={cn("flex flex-col bg-card relative", isMobile ? "h-auto rounded-t-[32px] overflow-hidden" : "h-full", className)}>
        {/* Brand Header */}
        <motion.div 
          animate={{ 
            paddingLeft: isMobile ? 24 : (collapsed ? 16 : 24), 
            paddingRight: isMobile ? 24 : (collapsed ? 16 : 24),
            justifyContent: (collapsed && !isMobile) ? "center" : "space-between"
          }}
          transition={{ duration: 0 }}
          className={cn("flex items-center", isMobile ? "h-10" : "h-16", !isMobile && "border-b")}
        >
          <AnimatePresence mode="wait">
            {(!collapsed && !isMobile) ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0 }}
              >
                <Link 
                  href="/qrise-matrix" 
                  className="flex items-center gap-2.5 font-extrabold text-xl text-primary"
                  onClick={onNavClick}
                >
                  <Image 
                    src="/logo.png" 
                    alt="QRise Matrix" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 object-contain"
                  />
                  <div className="flex items-center gap-1.5">
                    <span>QRise</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white tracking-widest shadow-sm">
                      Matrix
                    </span>
                  </div>
                </Link>
              </motion.div>
            ) : isMobile ? null : (
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
                  alt="QRise Matrix" 
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
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </motion.div>

        {/* Mode Switch Card / Action */}
        {!isMobile && (
          <div className="px-4 py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard" className="w-full block">
                  <Button 
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full gap-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl font-bold transition-all",
                      collapsed ? "justify-center px-0" : "justify-start px-3"
                    )} 
                    size="sm"
                  >
                    <ArrowLeftRight className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0 }}
                          className="whitespace-nowrap text-xs"
                        >
                          Switch to Studio
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Switch to QRise Studio</TooltipContent>}
            </Tooltip>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
          {matrixNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/qrise-matrix" && pathname.startsWith(item.href));
            
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center rounded-xl font-bold transition-all duration-200 overflow-hidden",
                      isMobile ? "py-2.5 px-4 text-[0.8125rem] gap-3" : (collapsed ? "py-2.5 justify-center px-0 text-sm" : "py-2.5 gap-3 px-4 text-sm"),
                      isActive 
                        ? "bg-indigo-600 text-white shadow-sm" 
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

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t">
          <UserMenu user={user} isCollapsed={collapsed} />
        </div>
      </div>
    </TooltipProvider>
  );
}
