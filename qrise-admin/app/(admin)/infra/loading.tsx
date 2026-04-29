import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InfraLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[120px]" />
        </div>
      </div>

      <div className="w-full space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-[300px]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
