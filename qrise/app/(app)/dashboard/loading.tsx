export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse p-1">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded-lg shadow-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[400px] bg-white border border-slate-100 rounded-2xl shadow-sm" />
        <div className="lg:col-span-4 h-[400px] bg-white border border-slate-100 rounded-2xl shadow-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        <div className="lg:col-span-7 h-[500px] bg-white border border-slate-100 rounded-2xl shadow-sm" />
        <div className="lg:col-span-5 h-[500px] bg-white border border-slate-100 rounded-2xl shadow-sm" />
      </div>
    </div>
  );
}
