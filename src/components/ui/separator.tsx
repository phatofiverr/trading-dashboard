import * as React from "react"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement> & {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    const Component = orientation === "horizontal" ? "hr" : "div"
    
    return (
      <Component
        ref={ref as any}
        data-slot="separator"
        data-orientation={orientation}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation}
        className={cn(
          "shrink-0 bg-border border-none",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
