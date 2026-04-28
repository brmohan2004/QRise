"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { MessageSquare, Send, CheckCircle2, AlertCircle, Bug, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 text-white rounded-[24px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        
        {submitted ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-gray-400">Your feedback helps us make QRise better for everyone.</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                Share Feedback
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Found a bug? Have a feature idea? Let us know how we can improve.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="type" className="text-gray-400">Feedback Type</Label>
                  <Select value={type} onValueChange={(v) => v && setType(v)}>
                    <SelectTrigger id="type" className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                      <SelectItem value="bug" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4 text-red-500" />
                          <span>Bug Report</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="enhancement" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>Enhancement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="suggestion" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Suggestion</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="subject" className="text-gray-400">Subject</Label>
                  <Input 
                    id="subject"
                    placeholder="Brief summary..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {!isLoggedIn && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email" className="text-gray-400">Your Email (Optional)</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="how can we reach you?"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-blue-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-400">Details</Label>
                <Textarea 
                  id="content"
                  placeholder="Tell us more..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:ring-blue-500/20 resize-none"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !subject || !content}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-6 shadow-lg shadow-blue-600/20 gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
