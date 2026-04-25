import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Mock */}
      <div className="w-64 border-r p-6 space-y-6 hidden lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Header Mock */}
        <div className="h-16 border-b px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        
        {/* Content Mock */}
        <div className="flex-1 p-6 space-y-8 overflow-hidden">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-[400px] rounded-2xl" />
            <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}