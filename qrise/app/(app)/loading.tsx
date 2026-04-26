import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-24 bg-muted rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card border border-border rounded-2xl p-6" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[400px] bg-card border border-border rounded-2xl" />
        <div className="lg:col-span-4 h-[400px] bg-card border border-border rounded-2xl" />
      </div>
    </div>
  );
}
