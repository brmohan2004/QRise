"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Globe, Clock, ShieldAlert, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
} from "@/components/ui/sheet";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DestroyWorkspaceDialog } from "./destroy-workspace-dialog";

export function GeneralDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDestroyDialogOpen, setIsDestroyDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const isOpen = searchParams.get("general") === "true";

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    },
    enabled: isOpen
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    }
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      updateMutation.mutate({ avatarUrl: publicUrl });
    } catch (err) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("general");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleDestroyWorkspace = async () => {
    try {
      const res = await fetch("/api/user/suspend", { method: "POST" });
      if (res.ok) {
        toast.success("Workspace destroyed. Signing out...");
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
      } else {
        toast.error("Failed to destroy workspace");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const FormContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#0F6E56] px-6 sm:px-8 py-5 sm:py-6 text-white relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight leading-none">Profile & Workspace</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Global preferences & identity</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white group sm:flex hidden"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 custom-scrollbar">
        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            <section className="space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1 h-5 md:h-6 bg-emerald-600 rounded-full" />
                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">Public Profile</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                <div className="relative group shrink-0 mx-auto md:mx-0">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white shadow-xl shadow-slate-200 overflow-hidden rounded-3xl">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-emerald-50 text-emerald-600 text-xl font-bold">
                      {user?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-white p-2 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-3xl">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mb-1" />}
                    <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Update Photo</span>
                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      <Input defaultValue={user?.fullName} className="pl-12 h-11 md:h-12 rounded-xl bg-white border-slate-100 focus:border-emerald-200 focus:ring-emerald-500/10 transition-all shadow-sm text-sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input value={user?.email} disabled className="pl-12 h-11 md:h-12 rounded-xl bg-slate-50/50 text-slate-500 border-slate-100 shadow-none cursor-not-allowed text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-10 sm:pt-12 border-t border-slate-200/40">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-emerald-600 rounded-full" />
                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">System Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Workspace Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger className="h-11 md:h-12 rounded-xl bg-white border-slate-100 focus:ring-emerald-500/10 transition-all shadow-sm text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Select timezone" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">Universal Coordinated Time (UTC)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="h-11 md:h-12 rounded-xl bg-white border-slate-100 focus:ring-emerald-500/10 transition-all shadow-sm text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Select language" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="pt-8 sm:pt-12 border-t border-slate-200/40">
              <div className="p-6 sm:p-8 bg-rose-50 border border-rose-100 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-rose-600 mb-0.5">
                    <ShieldAlert className="h-5 w-5" />
                    <h3 className="text-base font-bold tracking-tight">Terminal Action Zone</h3>
                  </div>
                  <p className="text-[11px] text-rose-900/60 font-medium max-w-sm leading-relaxed mx-auto sm:mx-0">
                    Deleting your account is permanent and cannot be undone. All data will be purged.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsDestroyDialogOpen(true)}
                  variant="destructive" 
                  className="h-11 md:h-12 px-8 font-bold rounded-xl shadow-lg shadow-rose-200 uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-transform w-full sm:w-auto"
                >
                  Destroy Workspace
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <SheetContent side="bottom" className="p-0 h-[92vh] rounded-t-3xl overflow-hidden border-none outline-none">
            {FormContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent showCloseButton={false} className="sm:max-w-3xl md:h-[80vh] h-[90vh] w-[95vw] p-0 overflow-hidden rounded-3xl border-none shadow-2xl flex flex-col">
            {FormContent()}
          </DialogContent>
        </Dialog>
      )}
      <DestroyWorkspaceDialog 
        isOpen={isDestroyDialogOpen}
        onClose={() => setIsDestroyDialogOpen(false)}
        onConfirm={handleDestroyWorkspace}
      />
    </>
  );
}
