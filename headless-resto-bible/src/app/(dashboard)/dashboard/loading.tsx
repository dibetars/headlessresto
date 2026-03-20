export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 h-32">
            <div className="h-4 w-24 bg-slate-100 rounded mb-4"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 h-96">
          <div className="h-6 w-48 bg-slate-100 rounded mb-8"></div>
          <div className="h-full w-full bg-slate-50 rounded-[32px]"></div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] h-96">
          <div className="h-6 w-48 bg-slate-800 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-white/5 rounded-[24px]"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
