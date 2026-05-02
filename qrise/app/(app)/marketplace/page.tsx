'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TypeCard } from '@/components/marketplace/type-card';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Search } from 'lucide-react';

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
    <div className="space-y-4 sm:space-y-6">
      <MarketplaceFilters />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[280px] w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : types.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type) => (
            <TypeCard key={type.id} type={type} isLoggedIn={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No custom types found</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Try adjusting your search or category filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">Custom QR Types</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Browse and use custom-built QR templates for specialized industries.</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] w-full rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      }>
        <MarketplaceContent />
      </Suspense>
    </div>
  );
}
