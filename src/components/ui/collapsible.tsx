import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null)

function Collapsible({ 
  children, 
  open: controlledOpen, 
  onOpenChange,
  defaultOpen = false,
  ...props 
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  
  const open = controlledOpen ?? internalOpen
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div data-slot="collapsible" data-state={open ? "open" : "closed"} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error('CollapsibleTrigger must be used within Collapsible')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    context.onOpenChange(!context.open)
    onClick?.(event)
  }

  return (
    <button
      ref={ref}
      data-slot="collapsible-trigger"
      data-state={context.open ? "open" : "closed"}
      aria-expanded={context.open}
      onClick={handleClick}
      {...props}
    />
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error('CollapsibleContent must be used within Collapsible')

  return (
    <div
      ref={ref}
      data-slot="collapsible-content"
      data-state={context.open ? "open" : "closed"}
      className={cn(
        "overflow-hidden transition-all duration-200",
        context.open ? "animate-accordion-down" : "animate-accordion-up",
        className
      )}
      style={{
        height: context.open ? "auto" : "0",
      }}
      {...props}
    />
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
