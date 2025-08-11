import * as React from "react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        data-slot="switch"
        className="sr-only peer"
        {...props}
      />
      <div className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-primary peer-unchecked:bg-input bg-input peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}>
        <div className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform peer-checked:translate-x-5 peer-unchecked:translate-x-0 translate-x-0 peer-checked:translate-x-5" />
      </div>
    </label>
  )
})
Switch.displayName = "Switch"

export { Switch }
