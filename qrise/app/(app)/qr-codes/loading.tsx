import { Plus, Search, LayoutGrid, List } from "lucide-react";

export default function QrCodesLoading() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg shadow-sm" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="h-10 w-full max-w-md bg-white border border-slate-100 rounded-xl" />
        
        <div className="flex gap-2 items-center ml-auto">
          <div className="h-10 w-28 bg-white border border-slate-100 rounded-lg" />
          <div className="h-10 w-28 bg-white border border-slate-100 rounded-lg" />
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-[320px] rounded-2xl border border-slate-100 bg-white shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 bg-slate-100 rounded-xl" />
              <div className="h-8 w-8 bg-slate-50 rounded-lg" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
            </div>
            <div className="pt-6 flex justify-between items-end">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded-md" />
              </div>
              <div className="h-8 w-20 bg-slate-900/5 rounded-lg border border-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
