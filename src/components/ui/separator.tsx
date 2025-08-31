import * as React from "react"

import { cn } from "@/lib/utils"

// Enhanced Separator with Divider functionality for backward compatibility
interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
  children?: React.ReactNode
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, children, ...props },
    ref
  ) => {
    // If children are provided, render as a Divider (Tremor-style)
    if (children) {
      return (
        <div
          ref={ref as any}
          data-slot="separator"
          className={cn(
            // base
            "mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm",
            // text color
            "text-gray-500",
            className,
          )}
          {...(props as any)}
        >
          <div
            className={cn(
              // base
              "h-[1px] w-full",
              // background color
              "bg-linear-to-r from-transparent to-gray-200",
            )}
          />
          <div className="whitespace-nowrap text-inherit">{children}</div>
          <div
            className={cn(
              // base
              "h-[1px] w-full",
              // background color
              "bg-linear-to-l from-transparent to-gray-200",
            )}
          />
        </div>
      )
    }

    // Standard separator
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
          orientation === "horizontal"
            ? "h-[1px] w-full bg-linear-to-l from-transparent via-gray-200 to-transparent"
            : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = "Separator"

// Divider alias for backward compatibility
const Divider = Separator

export { Separator, Divider }
