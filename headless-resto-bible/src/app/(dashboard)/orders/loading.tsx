export default function OrdersLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="flex bg-slate-100 p-1 rounded-[20px] w-64 h-10"></div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 h-24 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-3 w-48 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
              <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
