import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

interface ContextMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
  position: { x: number; y: number }
  triggerRef: React.RefObject<HTMLElement>
}

const ContextMenuContext = React.createContext<ContextMenuContextType | null>(null)

function ContextMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open) {
        const contextMenuContent = document.querySelector('[data-slot="context-menu-content"]')
        if (contextMenuContent && !contextMenuContent.contains(event.target as Node)) {
          setOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleContextMenu = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setPosition({ x: event.clientX, y: event.clientY })
    setOpen(true)
  }, [])

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, triggerRef }}>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
    </ContextMenuContext.Provider>
  )
}

const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = React.useContext(ContextMenuContext)
  if (!context) throw new Error('ContextMenuTrigger must be used within ContextMenu')

  return (
    <div
      ref={(node) => {
        context.triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      data-slot="context-menu-trigger"
      {...props}
    >
      {children}
    </div>
  )
})
ContextMenuTrigger.displayName = "ContextMenuTrigger"

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(ContextMenuContext)
  if (!context) throw new Error('ContextMenuContent must be used within ContextMenu')

  if (!context.open) return null

  const content = (
    <div
      ref={ref}
      data-slot="context-menu-content"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95",
        className
      )}
      style={{
        position: 'fixed',
        left: context.position.x,
        top: context.position.y,
        zIndex: 50,
      }}
      {...props}
    />
  )

  return createPortal(content, document.body)
})
ContextMenuContent.displayName = "ContextMenuContent"

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
    disabled?: boolean
    onSelect?: () => void
  }
>(({ className, inset, disabled, onSelect, onClick, ...props }, ref) => {
  const context = React.useContext(ContextMenuContext)
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      onSelect?.()
      context?.setOpen(false)
    }
    onClick?.(event)
  }

  return (
    <div
      ref={ref}
      data-slot="context-menu-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
ContextMenuItem.displayName = "ContextMenuItem"

const ContextMenuSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    data-slot="context-menu-separator"
    className={cn("-mx-1 my-1 h-px bg-border border-none", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="context-menu-label"
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = "ContextMenuLabel"

const ContextMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="context-menu-shortcut"
    className={cn(
      "ml-auto text-xs tracking-widest text-muted-foreground",
      className
    )}
    {...props}
  />
))
ContextMenuShortcut.displayName = "ContextMenuShortcut"

// Simplified versions of complex components
const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-slot="context-menu-group">{children}</div>
)

const ContextMenuCheckboxItem = ContextMenuItem
const ContextMenuRadioItem = ContextMenuItem
const ContextMenuRadioGroup = ContextMenuGroup
const ContextMenuSub = React.Fragment
const ContextMenuSubTrigger = ContextMenuItem
const ContextMenuSubContent = ContextMenuContent
const ContextMenuPortal = React.Fragment

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}