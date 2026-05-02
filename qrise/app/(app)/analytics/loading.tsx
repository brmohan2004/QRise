import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-muted rounded-xl" />
          <Skeleton className="h-4 w-72 bg-muted/60 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-44 bg-muted rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm space-y-4">
            <Skeleton className="h-4 w-24 bg-muted/40 rounded-full" />
            <Skeleton className="h-8 w-16 bg-muted rounded-lg" />
            <Skeleton className="h-3 w-32 bg-muted/20 rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[450px] bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 bg-muted rounded-lg" />
            <div className="flex gap-2">
               <Skeleton className="h-8 w-20 bg-muted/40 rounded-xl" />
               <Skeleton className="h-8 w-20 bg-muted/40 rounded-xl" />
            </div>
          </div>
          <Skeleton className="w-full h-full bg-muted/10 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 h-[450px] bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 space-y-6">
          <Skeleton className="h-6 w-40 bg-muted rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-muted/40 rounded-full" />
                <Skeleton className="h-4 w-12 bg-muted/60 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
