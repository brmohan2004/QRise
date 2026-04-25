export default function FormBuilderLoading() {
  return (
    <div className="h-full flex flex-col bg-slate-50 animate-pulse">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-slate-100 rounded-lg" />
          <div className="h-6 w-px bg-slate-200" />
          <div className="h-6 w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 bg-slate-100 rounded-lg" />
          <div className="h-9 w-40 bg-slate-200 rounded-lg shadow-sm" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Palette Skeleton */}
        <div className="w-[280px] bg-white border-r p-6 space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-slate-50 border border-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Skeleton */}
        <div className="flex-1 overflow-y-auto p-12 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-12 space-y-8 min-h-[800px]">
             <div className="space-y-3">
               <div className="h-10 w-1/3 bg-slate-200 rounded-lg" />
               <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
             </div>
             
             <div className="space-y-6 pt-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="space-y-3">
                   <div className="h-4 w-20 bg-slate-100 rounded" />
                   <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl" />
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Settings Skeleton (Hidden on small but always wired in layout) */}
        <div className="w-80 bg-white border-l p-8 hidden xl:block">
          <div className="h-8 w-32 bg-slate-200 rounded-lg mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-10 w-full bg-slate-50 border border-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
