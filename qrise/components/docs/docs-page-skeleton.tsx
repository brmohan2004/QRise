"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DocsPageSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-8" />
      
      <Skeleton className="h-6 w-32 mb-4" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
      
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}