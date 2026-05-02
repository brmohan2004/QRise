import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 bg-[#111]" />
          <Skeleton className="h-4 w-96 bg-[#111]/60" />
        </div>
        <Skeleton className="h-10 w-32 bg-[#111]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl" />
        ))}
      </div>

      <div className="rounded-3xl border border-[#1a1a1a] bg-[#0a0a0a] p-1">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between">
           <Skeleton className="h-8 w-48 bg-[#111]" />
           <Skeleton className="h-8 w-24 bg-[#111]" />
        </div>
        <div className="p-8 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
               <Skeleton className="h-10 w-10 rounded-full bg-[#111]" />
               <Skeleton className="h-6 flex-1 bg-[#111]/40" />
               <Skeleton className="h-6 w-24 bg-[#111]/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
