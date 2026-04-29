"use client";

import { useState } from "react";
import { X, User, Mail, Globe, Clock, ShieldAlert, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[85vh] h-[90vh] w-[95vw] p-0 overflow-hidden rounded-[32px] md:rounded-[48px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-none">Profile & Workspace</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Global preferences & identity</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-50 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
          ) : (
            <div className="space-y-16">
              <section className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-1.5 h-5 md:h-6 bg-emerald-600 rounded-full" />
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Public Profile</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="relative group shrink-0 mx-auto md:mx-0">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 md:border-8 border-white shadow-2xl shadow-slate-200 overflow-hidden rounded-[32px] md:rounded-[40px]">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 text-2xl md:text-3xl font-bold">
                        {user?.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-white p-2 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-[32px] md:rounded-[40px]">
                      {isUploading ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : <Upload className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-1.5" />}
                      <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Update Photo</span>
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                    <div className="space-y-2 md:space-y-3">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <Input defaultValue={user?.fullName} className="pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-white border-slate-100 focus:border-emerald-200 focus:ring-emerald-500/10 transition-all shadow-sm text-sm" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input value={user?.email} disabled className="pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50/50 text-slate-500 border-slate-100 shadow-none cursor-not-allowed text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-10 pt-16 border-t border-slate-200/40">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Workspace Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white border-slate-100 focus:ring-emerald-500/10 transition-all shadow-sm text-sm">
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

                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white border-slate-100 focus:ring-emerald-500/10 transition-all shadow-sm text-sm">
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

              <section className="pt-10 md:pt-16 border-t border-slate-200/40">
                <div className="p-6 md:p-10 bg-rose-50 border border-rose-100 rounded-[32px] md:rounded-[48px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 md:gap-3 text-rose-600 mb-1">
                      <ShieldAlert className="h-5 w-5 md:h-6 md:w-6" />
                      <h3 className="text-base md:text-lg font-bold tracking-tight">Terminal Action Zone</h3>
                    </div>
                    <p className="text-xs md:text-sm text-rose-900/60 font-medium max-w-md leading-relaxed">
                      Deleting your account is permanent and cannot be undone. All QR codes, forms, and analytics will be purged from our systems.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsDestroyDialogOpen(true)}
                    variant="destructive" 
                    className="h-12 md:h-16 px-8 md:px-12 font-bold rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl shadow-rose-200 uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:scale-[1.02] transition-transform"
                  >
                    Destroy Workspace
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </DialogContent>

      <DestroyWorkspaceDialog 
        isOpen={isDestroyDialogOpen}
        onClose={() => setIsDestroyDialogOpen(false)}
        onConfirm={handleDestroyWorkspace}
      />
    </Dialog>
  );
}
