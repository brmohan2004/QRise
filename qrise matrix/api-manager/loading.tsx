export default function ApiManagerLoading() {
  return (
    <div className="space-y-8 animate-pulse text-slate-100 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-44 bg-slate-100 rounded-xl" />
      </div>

      <div className="flex gap-1.5 p-1.5 rounded-2xl w-fit bg-slate-50 border border-slate-100">
        <div className="h-10 w-32 bg-white rounded-xl shadow-sm" />
        <div className="h-10 w-32 bg-slate-50 rounded-xl" />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-50">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-40 bg-slate-900/5 rounded-xl border border-slate-100" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
