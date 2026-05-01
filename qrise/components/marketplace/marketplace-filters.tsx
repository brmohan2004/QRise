'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
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

  const handleCategoryChange = (category: string | null) => {
    router.push(`/marketplace?${createQueryString('category', category || 'all')}`);
  };

  const handleSortChange = (sort: string | null) => {
    router.push(`/marketplace?${createQueryString('sort', sort || 'newest')}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Search custom types..." 
          className="pl-11 h-10 bg-white border-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-primary focus:border-primary rounded-xl shadow-sm transition-all text-xs"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search') || ''}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 flex-1 md:flex-none">
          <Select onValueChange={handleCategoryChange} defaultValue={searchParams.get('category') || 'all'}>
            <SelectTrigger className="w-full md:w-[180px] h-10 bg-white border-gray-100 text-gray-900 rounded-xl shadow-sm focus:ring-primary text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-[11px] font-bold py-2 rounded-lg">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleSortChange} defaultValue={searchParams.get('sort') || 'newest'}>
            <SelectTrigger className="w-full md:w-[140px] h-10 bg-white border-gray-100 text-gray-900 rounded-xl shadow-sm focus:ring-primary text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl">
              <SelectItem value="newest" className="text-[11px] font-bold py-2 rounded-lg">Newest</SelectItem>
              <SelectItem value="most_used" className="text-[11px] font-bold py-2 rounded-lg">Most Used</SelectItem>
              <SelectItem value="most_scans" className="text-[11px] font-bold py-2 rounded-lg">Most Scans</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
