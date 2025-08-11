import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        data-slot="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary bg-transparent ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary",
          className
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity">
        <Check className="h-3 w-3" />
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
