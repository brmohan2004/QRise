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

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar_url?: string;
    plan: string;
  };
  isCollapsed?: boolean;
}

export function UserMenu({ user, isCollapsed }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center rounded-xl p-2 text-left hover:bg-muted/50 transition-all outline-none group border border-transparent hover:border-muted-foreground/10",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform shrink-0">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-left-2 text-left">
            <p className="text-sm font-bold truncate leading-none mb-1.5">{user.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-wider">
                {user.plan}
              </span>
            </div>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side={isCollapsed ? "right" : "top"} 
        className="w-64 p-2" 
        sideOffset={12}
      >
        <div className="px-2 py-2 mb-2">
          <p className="text-sm font-bold">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="?general=true" className="flex items-center w-full">
            <User className="mr-3 h-4 w-4" />
            General
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="?backup=true" className="flex items-center w-full">
            <Database className="mr-3 h-4 w-4" />
            Backup
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="?billing=true" className="flex items-center w-full">
            <CreditCard className="mr-3 h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="?usage=true" className="flex items-center w-full">
            <Zap className="mr-3 h-4 w-4" />
            Usage
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
