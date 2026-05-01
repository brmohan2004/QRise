'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'Categories' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'events', label: 'Events' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' },
];

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || !value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    router.push(`/marketplace?${createQueryString('search', term)}`);
  };

  const handleCategoryChange = (category: string) => {
    router.push(`/marketplace?${createQueryString('category', category)}`);
  };

  const handleSortChange = (sort: string) => {
    router.push(`/marketplace?${createQueryString('sort', sort)}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input 
            placeholder="Search custom types..." 
            className="pl-8 h-7 sm:h-8 bg-white border-gray-100 rounded-xl text-[11px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('search') || ''}
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 items-center">
          <div className="flex-1 sm:flex-none">
            <select 
              value={searchParams.get('category') || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-auto h-7 sm:h-8 bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none cursor-pointer shadow-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:flex-none">
            <select 
              value={searchParams.get('sort') || 'newest'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-auto h-7 sm:h-8 bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none cursor-pointer shadow-sm"
            >
              <option value="newest">Newest</option>
              <option value="most_used">Most Used</option>
              <option value="most_scans">Most Scans</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
