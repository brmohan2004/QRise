"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, CreditCard, LogOut, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { SignOutDialog } from "./sign-out-dialog";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import { useUsageStats } from "@/lib/hooks/use-usage-stats";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar_url?: string;
    plan: string;
  };
  isCollapsed?: boolean;
  isLoading?: boolean;
}

export function UserMenu({ user, isCollapsed, isLoading }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();
  const { data: usage } = useUsageStats();

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const scansPct = usage?.metrics?.scans?.pct || 0;

  if (isLoading) {
    return (
      <div className={cn(
        "flex w-full items-center rounded-xl p-2 gap-3",
        isCollapsed ? "justify-center" : ""
      )}>
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center rounded-xl p-2 text-left hover:bg-muted/50 transition-all outline-none group border border-transparent hover:border-muted-foreground/10",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <Avatar className="h-9 w-9 border shadow-sm group-hover:scale-105 transition-transform shrink-0">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-left-2 text-left">
            <p className="text-sm font-bold truncate leading-none mb-1.5">{user.name || "User"}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-wider">
                {user.plan || "Free"}
              </span>
            </div>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side={isCollapsed ? "right" : "top"} 
        className="w-[280px] sm:w-72 p-1.5 sm:p-2 rounded-2xl shadow-2xl border-slate-200" 
        sideOffset={12}
      >
        <div className="px-2.5 sm:px-3 py-2.5 sm:py-3 mb-1 sm:mb-2 bg-slate-50/50 rounded-xl">
          <p className="text-xs sm:text-sm font-bold text-slate-900">{user.name}</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate font-medium">{user.email}</p>
          
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span>Usage Overview</span>
              <span className={cn(scansPct > 80 ? "text-amber-600" : "text-emerald-600")}>{scansPct}%</span>
            </div>
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scansPct}%` }}
                className={cn(
                  "h-full transition-all duration-500",
                  scansPct > 80 ? "bg-amber-500" : "bg-emerald-500"
                )} 
              />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 mx-1" />
        
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-10 sm:h-11 focus:bg-slate-50">
          <Link 
            href="?general=true" 
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center w-full font-bold text-slate-600 text-[11px] sm:text-sm"
          >
            <User className="mr-2 sm:mr-3 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            General Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-10 sm:h-11 focus:bg-slate-50">
          <Link 
            href="?usage=true" 
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center w-full font-bold text-slate-600 text-[11px] sm:text-sm"
          >
            <Zap className="mr-2 sm:mr-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-500" />
            System Usage
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-10 sm:h-11 focus:bg-slate-50">
          <Link 
            href="?billing=true" 
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center w-full font-bold text-slate-600 text-[11px] sm:text-sm"
          >
            <CreditCard className="mr-2 sm:mr-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-indigo-500" />
            Subscription & Billing
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 mx-1" />
        
        <DropdownMenuItem 
          onClick={() => setIsSignOutDialogOpen(true)} 
          className="text-destructive focus:text-destructive cursor-pointer rounded-xl h-10 sm:h-11 font-bold text-[11px] sm:text-sm"
        >
          <LogOut className="mr-2 sm:mr-3 h-3.5 sm:h-4 w-3.5 sm:w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <SignOutDialog 
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={handleSignOut}
      />
    </DropdownMenu>
  );
}
