'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Scan, QrCode, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TypeCardProps {
  type: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon_url: string | null;
    is_verified: boolean;
    scan_count: number;
    qr_count: number;
    creator_name?: string;
    fields_schema: any;
  };
  isLoggedIn?: boolean;
}

export function TypeCard({ type, isLoggedIn }: TypeCardProps) {
  const [showSchema, setShowSchema] = useState(false);

  const handleUseType = () => {
    if (isLoggedIn) {
      window.location.href = `/qr-codes/new?type=custom&template=${type.slug}`;
    } else {
      window.location.href = `/register?returnTo=/marketplace&type=${type.slug}`;
    }
  };

  return (
    <Card className="flex flex-col bg-white border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group rounded-2xl overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform duration-500 shrink-0">
              {type.icon_url ? (
                <img src={type.icon_url} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <QrCode className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-black text-base text-gray-900 leading-tight group-hover:text-primary transition-colors">
                {type.name}
              </h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">/{type.slug}</p>
            </div>
          </div>
          {type.is_verified && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 gap-1 rounded-lg text-[8px] font-black uppercase tracking-wider px-2 py-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-1 space-y-5">
        <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
          {type.description || 'No description provided.'}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg">
            <Scan className="w-3 h-3 text-primary" />
            {type.scan_count?.toLocaleString() || 0} Scans
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg">
            <QrCode className="w-3 h-3 text-primary" />
            {type.qr_count?.toLocaleString() || 0} QRs
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <User className="w-2.5 h-2.5" />
            {type.creator_name || 'System'}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-50">
          <button 
            onClick={() => setShowSchema(!showSchema)}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all"
          >
            {showSchema ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showSchema ? 'Hide Schema' : 'View Schema'}
          </button>
          
          {showSchema && (
            <div className="mt-3 bg-gray-900 rounded-xl p-3 border border-gray-800 shadow-inner overflow-x-auto">
              <pre className="text-[9px] font-mono text-emerald-400">
                {JSON.stringify(type.fields_schema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
          onClick={handleUseType}
        >
          Use this type
        </Button>
      </CardFooter>
    </Card>
  );
}
