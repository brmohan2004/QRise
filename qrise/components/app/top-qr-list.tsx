"use client";

import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TopQR {
  id: string;
  name: string;
  scans: number;
  type: string;
}

interface TopQRListProps {
  data: TopQR[];
  isLoading?: boolean;
}

export function TopQRList({ data, isLoading }: TopQRListProps) {
  if (isLoading) {
    return (
      <Card className="h-full shadow-sm border-muted/60">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxScans = data.length > 0 ? Math.max(...data.map(q => q.scans)) : 100;

  return (
    <Card className="h-full shadow-sm border-muted/60">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-bold">Top Performing</CardTitle>
        <Link 
          href="/qr-codes" 
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <QrCode className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No data yet</p>
          </div>
        ) : (
          data.map((qr) => (
            <div key={qr.id} className="group cursor-pointer">
              <Link href={`/qr-codes/${qr.id}/analytics`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate pr-2">
                    {qr.name}
                  </p>
                  <span className="text-xs font-bold text-muted-foreground">
                    {qr.scans.toLocaleString()} scans
                  </span>
                </div>
                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${(qr.scans / maxScans) * 100}%` }}
                  />
                </div>
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
