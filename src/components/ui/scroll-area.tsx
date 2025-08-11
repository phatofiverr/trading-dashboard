import * as React from "react"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="base"
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      <div data-slot="viewport" className="h-full w-full rounded-[inherit]">
        {children}
      </div>
    </div>
  )
)

ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="scrollbar"
      data-orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      )}
      {...props}
    >
      <div
        data-slot="thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </div>
  )
)

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
