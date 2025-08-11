import * as React from "react"
import { createPortal } from "react-dom"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const TooltipContext = React.createContext<TooltipContextType | null>(null)

// Provider component (can be no-op for simple implementation)
function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function Tooltip({ 
  children,
  open: controlledOpen,
  onOpenChange,
  delayDuration = 700
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const open = controlledOpen ?? internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ children, onMouseEnter, onMouseLeave, onFocus, onBlur, asChild = false, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error('TooltipTrigger must be used within Tooltip')

  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    timeoutRef.current = setTimeout(() => {
      context.setOpen(true)
    }, 700)
    onMouseEnter?.(event)
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    context.setOpen(false)
    onMouseLeave?.(event)
  }

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    context.setOpen(true)
    onFocus?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    context.setOpen(false)
    onBlur?.(event)
  }

  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={(node: HTMLElement) => {
        context.triggerRef.current = node
        if (typeof ref === 'function') ref(node as HTMLDivElement)
        else if (ref) ref.current = node as HTMLDivElement
      }}
      data-slot="tooltip-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </Comp>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
  }
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error('TooltipContent must be used within Tooltip')

  if (!context.open) return null

  const content = (
    <div
      ref={ref}
      data-slot="tooltip-content"
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      data-side={side}
      style={{
        position: 'fixed',
        zIndex: 50,
      }}
      role="tooltip"
      {...props}
    />
  )

  return createPortal(content, document.body)
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
