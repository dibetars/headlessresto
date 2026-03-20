import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-slate-50 border-slate-200 flex h-10 w-full min-w-0 rounded-xl border px-4 py-2 text-sm shadow-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
