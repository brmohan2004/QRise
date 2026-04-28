"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // This will trigger middleware to redirect to login
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost" 
      className="w-full h-14 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-2xl transition-all duration-300 gap-3"
    >
      <LogOut className="w-5 h-5" />
      Sign Out
    </Button>
  );
}
