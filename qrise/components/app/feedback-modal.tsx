"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Bug, Sparkles, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [type, setType] = useState<string>("suggestion");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || "");
      }
    };
    if (open) checkUser();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;

    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, content, email }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      setSubmitted(true);
      toast.success("Feedback submitted successfully!");

      // Reset form after 2 seconds and close
      setTimeout(() => {
        onOpenChange(false);
        setTimeout(() => {
          setSubmitted(false);
          setSubject("");
          setContent("");
          setType("suggestion");
        }, 300);
      }, 2000);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (t: string) => {
    switch (t) {
      case "bug": return <Bug className="w-4 h-4 text-red-500" />;
      case "enhancement": return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "suggestion": return <Lightbulb className="w-4 h-4 text-amber-500" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const FormContent = () => (
    <div className="relative overflow-hidden h-full sm:h-auto bg-white">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 z-50" />
      
      {submitted ? (
        <div className="py-12 sm:py-16 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300 px-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Thank You!</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Your feedback helps us make QRise better for everyone.</p>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-gray-900">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                Share Feedback
              </h2>
              {isMobile && (
                <button 
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-[10px] sm:text-sm text-gray-500 font-medium leading-relaxed">
              Found a bug? Have a feature idea? Let us know how we can improve QRise.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="type" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Feedback Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}>
                  <SelectTrigger id="type" className="bg-gray-50 border-gray-100 rounded-xl h-9 sm:h-11 focus:ring-emerald-500/20 text-xs sm:text-sm text-gray-900 shadow-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100 text-gray-900">
                    <SelectItem value="bug" className="focus:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium">Bug Report</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="enhancement" className="focus:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                        <span className="text-xs sm:text-sm font-medium">Enhancement</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="suggestion" className="focus:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                        <span className="text-xs sm:text-sm font-medium">Suggestion</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other" className="focus:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="text-xs sm:text-sm font-medium">Other</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="subject" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Subject</Label>
                <Input 
                  id="subject"
                  placeholder="Brief summary..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-gray-50 border-gray-100 rounded-xl h-9 sm:h-11 focus:ring-emerald-500/20 text-xs sm:text-sm text-gray-900 shadow-sm"
                  required
                />
              </div>

              {!isLoggedIn && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Your Email (Optional)</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="how can we reach you?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border-gray-100 rounded-xl h-9 sm:h-11 focus:ring-emerald-500/20 text-xs sm:text-sm text-gray-900 shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Details</Label>
              <Textarea 
                id="content"
                placeholder="Tell us more about your feedback..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-gray-50 border-gray-100 rounded-2xl min-h-[100px] sm:min-h-[120px] focus:ring-emerald-500/20 resize-none text-xs sm:text-sm text-gray-900 shadow-sm"
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto rounded-xl hover:bg-gray-50 text-xs sm:text-sm text-gray-500 h-9 sm:h-11 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !subject || !content}
                className="w-full sm:w-auto bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-xl h-10 sm:h-11 px-6 shadow-lg shadow-emerald-900/10 gap-2 min-w-[120px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          showCloseButton={false}
          className="bg-white border-t border-gray-100 p-0 rounded-t-[32px] outline-none max-h-[90vh] overflow-y-auto"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
          <FormContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-100 p-0 text-gray-900 rounded-[24px] overflow-hidden outline-none shadow-2xl">
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
