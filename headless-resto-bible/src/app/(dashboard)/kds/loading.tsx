export default function KDSLoading() {
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden animate-pulse">
      {/* KDS Header Loading */}
      <div className="bg-slate-900 text-white p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          <div className="flex items-center space-x-6">
            <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
            <div className="flex space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-32 bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
          <div className="h-8 w-40 bg-slate-800 rounded-lg"></div>
        </div>
      </div>

      {/* KDS Grid Loading */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-slate-200 h-[400px] flex flex-col">
              <div className="h-16 bg-slate-100 p-3 flex justify-between items-center">
                <div className="h-6 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-12 bg-slate-200 rounded"></div>
              </div>
              <div className="p-4 flex-1 space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 w-full bg-slate-50 rounded"></div>
                ))}
              </div>
              <div className="p-3 border-t bg-slate-50 flex gap-2">
                <div className="h-12 flex-1 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
