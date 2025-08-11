
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AspectRatioProps {
  ratio?: number
  children: React.ReactNode
  className?: string
}

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  AspectRatioProps
>(({ ratio = 1, children, className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="base"
    className={cn("relative w-full", className)}
    style={{ aspectRatio: ratio }}
    {...props}
  >
    {children}
  </div>
))

AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
