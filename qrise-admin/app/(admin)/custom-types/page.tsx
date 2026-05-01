'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypesTable } from '@/components/admin/custom-types/types-table';
import { MarketplaceQueueTable } from '@/components/admin/custom-types/marketplace-queue-table';
import { ShieldCheck, List, Upload } from 'lucide-react';

export default function CustomTypesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Custom Types Moderation</h2>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="all" className="gap-2"><List className="h-4 w-4" /> All Types</TabsTrigger>
          <TabsTrigger value="queue" className="gap-2"><Upload className="h-4 w-4" /> Marketplace Queue</TabsTrigger>
          <TabsTrigger value="verified" className="gap-2"><ShieldCheck className="h-4 w-4" /> Verified</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><TypesTable scope="all" /></TabsContent>
        <TabsContent value="queue"><MarketplaceQueueTable /></TabsContent>
        <TabsContent value="verified"><TypesTable scope="verified" /></TabsContent>
      </Tabs>
    </div>
  );
}
