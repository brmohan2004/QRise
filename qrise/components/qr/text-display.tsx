"use client";

import React from 'react';
import { Type, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface TextDisplayProps {
  name: string;
  content: string;
}

export function TextDisplay({ name, content }: TextDisplayProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Text copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F6E56] to-[#1a8e71] p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Type className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium tracking-wide uppercase opacity-90">Text Content</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 min-h-[200px] flex flex-col">
            <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap break-words flex-1">
              {content}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleCopy}
              className="flex-1 bg-[#0F6E56] hover:bg-[#0d5c48] text-white h-12 rounded-xl text-lg font-semibold transition-all active:scale-[0.98]"
            >
              {copied ? (
                <><Check className="w-5 h-5 mr-2" /> Copied</>
              ) : (
                <><Copy className="w-5 h-5 mr-2" /> Copy Text</>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={handleShare}
              className="flex-1 border-slate-200 text-slate-700 h-12 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-8 pb-8">
          <Link href="/" className="block">
            <Button 
              className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:animate-pulse" />
              Create your own QR Code
            </Button>
          </Link>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
            Free • No Credit Card Required
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
          <p className="text-slate-500 text-sm">
            Powered by <span className="font-bold text-[#0F6E56]">QRise</span>
          </p>
        </div>
      </div>
    </div>
  );
}
