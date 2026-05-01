'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TypeCard } from '@/components/marketplace/type-card';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import '@/components/pricing/pricing.css';

function ExploreContent() {
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
    <div className="pricing-container space-y-12">
      <MarketplaceFilters />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[320px] w-full rounded-3xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : types.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {types.map((type) => (
            <TypeCard key={type.id} type={type} isLoggedIn={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No matching QR types found</p>
        </div>
      )}
      
      {/* Marketing Footer */}
      <div className="bg-gray-900 rounded-[2rem] p-8 sm:p-16 text-center relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ready to build your own?</h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join the community of creators building next-gen QR experiences. No coding required.
          </p>
          <div className="pt-4">
            <Link 
              href="/register"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30"
            >
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="pricing-section">
      <div className="pricing-container">
        {/* Hero Section */}
        <div className="pricing-header max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Template Marketplace
          </div>
          <h1 className="pricing-title">
            Explore the <span className="text-primary">Next Generation</span> of QR Codes
          </h1>
          <p className="pricing-description">
            Browse our curated collection of verified QR types. From industry-specific solutions to creative templates, find the perfect base for your next project.
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[320px] w-full rounded-3xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        }>
          <ExploreContent />
        </Suspense>
      </div>
    </div>
  );
}
