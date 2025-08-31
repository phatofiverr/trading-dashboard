import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

// Enhanced Separator with Divider functionality for backward compatibility
interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  children?: React.ReactNode
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, children, ...props },
    ref
  ) => {
    // If children are provided, render as a Divider (Tremor-style)
    if (children) {
      return (
        <div
          className={cn(
            "mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm text-muted-foreground",
            className,
          )}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-border" />
          <div className="whitespace-nowrap text-inherit">{children}</div>
          <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-border" />
        </div>
      )
    }

    // Standard separator using Radix primitive
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = SeparatorPrimitive.Root.displayName

// Divider alias for backward compatibility
const Divider = Separator

export { Separator, Divider }