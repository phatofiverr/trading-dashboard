import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface HoverCardContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const HoverCardContext = React.createContext<HoverCardContextType | null>(null)

function HoverCard({ 
  children,
  openDelay = 700,
  closeDelay = 300
}: {
  children: React.ReactNode
  openDelay?: number
  closeDelay?: number
}) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const openTimeoutRef = React.useRef<NodeJS.Timeout>()
  const closeTimeoutRef = React.useRef<NodeJS.Timeout>()

  const handleOpen = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    openTimeoutRef.current = setTimeout(() => setOpen(true), openDelay)
  }, [openDelay])

  const handleClose = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
  }, [closeDelay])

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, setOpen, triggerRef }}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = React.useContext(HoverCardContext)
  if (!context) throw new Error('HoverCardTrigger must be used within HoverCard')

  return (
    <div
      ref={(node) => {
        context.triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      data-slot="hover-card-trigger"
      {...props}
    >
      {children}
    </div>
  )
})
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
  }
>(({ className, align = "center", side = "bottom", sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(HoverCardContext)
  if (!context) throw new Error('HoverCardContent must be used within HoverCard')

  if (!context.open) return null

  const content = (
    <div
      ref={ref}
      data-slot="hover-card-content"
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      data-side={side}
      style={{
        position: 'fixed',
        zIndex: 50,
      }}
      {...props}
    />
  )

  return createPortal(content, document.body)
})
HoverCardContent.displayName = "HoverCardContent"
