
import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface PopoverContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const PopoverContext = React.createContext<PopoverContextType | null>(null)

function Popover({ 
  children, 
  open: controlledOpen, 
  onOpenChange 
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)

  const open = controlledOpen ?? internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const popoverContent = document.querySelector('[data-slot="popover-content"]')
        if (popoverContent && !popoverContent.contains(event.target as Node)) {
          setOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }
>(({ children, onClick, asChild = false, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used within Popover')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open)
    onClick?.(event)
  }

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref: (node: HTMLButtonElement) => {
        context.triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(event)
        ;(children as React.ReactElement).props.onClick?.(event)
      },
      'aria-expanded': context.open,
      'data-slot': 'popover-trigger'
    })
  }

  return (
    <button
      ref={(node) => {
        context.triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      data-slot="popover-trigger"
      onClick={handleClick}
      aria-expanded={context.open}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
  }
>(({ className, align = "center", side = "bottom", sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverContent must be used within Popover')

  if (!context.open) return null

  const content = (
    <div
      ref={ref}
      data-slot="popover-content"
      className={cn(
        "z-[9999] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      data-side={side}
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: context.triggerRef.current ? context.triggerRef.current.getBoundingClientRect().bottom + sideOffset : 0,
        left: align === 'start' ? context.triggerRef.current?.getBoundingClientRect().left : 
              align === 'end' ? (context.triggerRef.current?.getBoundingClientRect().right || 0) - 320 : 
              ((context.triggerRef.current?.getBoundingClientRect().left || 0) + (context.triggerRef.current?.getBoundingClientRect().width || 0) / 2) - 144,
      }}
      {...props}
    />
  )

  return createPortal(content, document.body)
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
