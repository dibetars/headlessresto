export default function MenuLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white p-4 rounded-[24px] border border-slate-100 h-64">
            <div className="aspect-video w-full bg-slate-100 rounded-[20px] mb-4"></div>
            <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
            <div className="h-3 w-48 bg-slate-50 rounded"></div>
            <div className="mt-4 flex items-center justify-between">
              <div className="h-6 w-16 bg-slate-100 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
