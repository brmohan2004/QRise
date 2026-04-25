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

export function GeneralDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[85vh] h-screen w-screen p-0 overflow-hidden rounded-none md:rounded-[40px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 italic uppercase tracking-tight">Profile & Workspace</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global preferences & identity</p>
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
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Public Profile</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl overflow-hidden rounded-[32px]">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 text-3xl font-black">
                        {user?.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[32px]">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 mb-1" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input defaultValue={user?.fullName} className="pl-12 h-12 rounded-xl bg-white border-slate-100" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input value={user?.email} disabled className="pl-12 h-12 rounded-xl bg-slate-100 italic border-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-12 border-t border-slate-200/60">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-black text-slate-900 tracking-tight italic">System Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Workspace Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-300" />
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

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-300" />
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

              <section className="pt-12 border-t border-slate-200/60">
                <div className="p-10 bg-red-50 border border-red-100 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <ShieldAlert className="h-5 w-5" />
                      <h3 className="text-lg font-black uppercase tracking-tight italic">Terminal Action Zone</h3>
                    </div>
                    <p className="text-sm text-red-900/60 font-bold max-w-md">
                      Deleting your account is permanent and cannot be undone. All QR codes, forms, and analytics will be purged from our systems.
                    </p>
                  </div>
                  <Button variant="destructive" className="h-14 px-10 font-black rounded-2xl shadow-xl shadow-red-200 uppercase tracking-widest text-xs">
                    Destroy Workspace
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
