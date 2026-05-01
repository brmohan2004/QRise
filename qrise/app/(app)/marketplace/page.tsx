'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TypeCard } from '@/components/marketplace/type-card';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

function MarketplaceContent() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    fetch('/api/marketplace/types?' + searchParams.toString())
      .then(r => r.json())
      .then(data => { 
        setTypes(data.types || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
      <MarketplaceFilters />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[280px] w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : types.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {types.map((type) => (
            <TypeCard key={type.id} type={type} isLoggedIn={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium text-sm">No custom types found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 sm:space-y-12">
        {/* Header Section */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest mb-1">
            <Sparkles className="w-3 h-3" />
            Community Marketplace
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Custom QR <span className="text-primary">Types</span>
          </h1>
          <p className="text-xs sm:text-base text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
            Browse and use custom-built QR templates for specialized industries. 
            From medical patient tracking to logistics and event management.
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        }>
          <MarketplaceContent />
        </Suspense>
      </div>
    </div>
  );
}
