"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

// Types for positioning
type Alignment = "start" | "center" | "end"
type Side = "top" | "right" | "bottom" | "left"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

interface DropdownMenuRootProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function DropdownMenu({ 
  children, 
  open: controlledOpen, 
  onOpenChange,
  defaultOpen = false
}: DropdownMenuRootProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLElement>(null)

  const open = controlledOpen ?? internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div data-slot="dropdown-menu">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

// Portal is just a pass-through for compatibility
function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <div data-slot="dropdown-menu-portal">{children}</div>
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  onClick?: (event: React.MouseEvent) => void
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild = false, onClick, className, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

    const handleClick = (event: React.MouseEvent) => {
      context.setOpen(!context.open)
      onClick?.(event)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: (node: HTMLElement) => {
          context.triggerRef.current = node
          if (typeof ref === 'function') ref(node as HTMLButtonElement)
          else if (ref) ref.current = node as HTMLButtonElement
        },
        onClick: handleClick,
        'aria-expanded': context.open,
        'data-slot': 'dropdown-menu-trigger',
        className: cn(className, children.props.className),
        ...props,
      })
    }

    return (
      <button
        ref={(node) => {
          context.triggerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        data-slot="dropdown-menu-trigger"
        onClick={handleClick}
        aria-expanded={context.open}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: Alignment
  side?: Side
  sideOffset?: number
  forceMount?: boolean
  onPointerDown?: (event: React.PointerEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  onCloseAutoFocus?: (event: Event) => void
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ 
    children, 
    className, 
    align = "center", 
    side = "bottom", 
    sideOffset = 4,
    forceMount = false,
    onPointerDown,
    onPointerDownOutside,
    onCloseAutoFocus,
    ...props 
  }, ref) => {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')

    const [position, setPosition] = React.useState({ top: 0, left: 0 })
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Calculate position
    React.useEffect(() => {
      if (context.open && context.triggerRef.current && contentRef.current) {
        const triggerRect = context.triggerRef.current.getBoundingClientRect()
        const contentRect = contentRef.current.getBoundingClientRect()
        const viewport = { width: window.innerWidth, height: window.innerHeight }

        let top = 0
        let left = 0

        // Calculate based on side
        switch (side) {
          case 'bottom':
            top = triggerRect.bottom + sideOffset
            break
          case 'top':
            top = triggerRect.top - contentRect.height - sideOffset
            break
          case 'right':
            left = triggerRect.right + sideOffset
            top = triggerRect.top
            break
          case 'left':
            left = triggerRect.left - contentRect.width - sideOffset
            top = triggerRect.top
            break
        }

        // Calculate based on alignment for top/bottom sides
        if (side === 'bottom' || side === 'top') {
          switch (align) {
            case 'start':
              left = triggerRect.left
              break
            case 'center':
              left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
              break
            case 'end':
              left = triggerRect.right - contentRect.width
              break
          }
        }

        // Adjust for viewport boundaries
        if (left + contentRect.width > viewport.width) {
          left = viewport.width - contentRect.width - 8
        }
        if (left < 8) {
          left = 8
        }
        if (top + contentRect.height > viewport.height) {
          top = viewport.height - contentRect.height - 8
        }
        if (top < 8) {
          top = 8
        }

        setPosition({ top, left })
      }
    }, [context.open, side, align, sideOffset])

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          context.open &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          context.triggerRef.current &&
          !context.triggerRef.current.contains(event.target as Node)
        ) {
          onPointerDownOutside?.(event as PointerEvent)
          context.setOpen(false)
        }
      }

      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [context.open, context.setOpen, onPointerDownOutside])

    if (!context.open && !forceMount) return null

    const content = (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        data-slot="dropdown-menu-content"
        data-side={side}
        data-align={align}
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-md border p-1 shadow-lg",
          "bg-popover text-popover-foreground",
          "animate-in fade-in-0 zoom-in-95",
          side === "bottom" && "slide-in-from-top-2",
          side === "left" && "slide-in-from-right-2", 
          side === "right" && "slide-in-from-left-2",
          side === "top" && "slide-in-from-bottom-2",
          className
        )}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 50,
        }}
        onPointerDown={onPointerDown}
        {...props}
      >
        {children}
      </div>
    )

    return createPortal(content, document.body)
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

function DropdownMenuGroup({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-group" className={className} {...props}>
      {children}
    </div>
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  variant?: "default" | "destructive"
  disabled?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, variant = "default", disabled, children, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)
    
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(event)
      // Close dropdown on item click unless prevented
      if (!event.defaultPrevented) {
        context?.setOpen(false)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault()
        handleClick(event as any)
      }
    }

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        data-disabled={disabled}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground",
          variant === "destructive" && [
            "text-destructive-foreground",
            "focus:bg-destructive/10 focus:text-destructive-foreground",
            "dark:focus:bg-destructive/40",
            "*:[svg]:!text-destructive-foreground"
          ],
          disabled && "pointer-events-none opacity-50",
          inset && "pl-8",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, disabled, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(event)
      onCheckedChange?.(!checked)
    }

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-checkbox-item"
        role="menuitemcheckbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && <CheckIcon size={16} />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

interface DropdownMenuRadioGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const DropdownMenuRadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
} | null>(null)

function DropdownMenuRadioGroup({ 
  children, 
  value, 
  onValueChange, 
  className, 
  ...props 
}: DropdownMenuRadioGroupProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DropdownMenuRadioGroupContext.Provider value={{ value, onValueChange }}>
      <div data-slot="dropdown-menu-radio-group" className={className} role="group" {...props}>
        {children}
      </div>
    </DropdownMenuRadioGroupContext.Provider>
  )
}

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, value, disabled, onClick, ...props }, ref) => {
    const radioContext = React.useContext(DropdownMenuRadioGroupContext)
    const dropdownContext = React.useContext(DropdownMenuContext)
    const checked = radioContext?.value === value

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(event)
      radioContext?.onValueChange?.(value)
      dropdownContext?.setOpen(false)
    }

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-radio-item"
        role="menuitemradio"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && <CircleIcon className="size-2 fill-current" />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-label"
        data-inset={inset}
        className={cn(
          "px-2 py-1.5 text-xs font-medium text-muted-foreground",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-separator"
        role="separator"
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
      />
    )
  }
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        data-slot="dropdown-menu-shortcut"
        className={cn(
          "ms-auto -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium",
          "bg-background text-muted-foreground/70",
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Sub-menu components (simplified implementation)
interface DropdownMenuSubProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenuSubContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function DropdownMenuSub({ children, open: controlledOpen, onOpenChange }: DropdownMenuSubProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  return (
    <DropdownMenuSubContext.Provider value={{ open, setOpen }}>
      <div data-slot="dropdown-menu-sub">
        {children}
      </div>
    </DropdownMenuSubContext.Provider>
  )
}

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  disabled?: boolean
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, disabled, ...props }, ref) => {
    const subContext = React.useContext(DropdownMenuSubContext)

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-sub-trigger"
        data-inset={inset}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={subContext?.open}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground",
          subContext?.open && "bg-accent text-accent-foreground",
          inset && "pl-8",
          className
        )}
        onMouseEnter={() => subContext?.setOpen(true)}
        onMouseLeave={() => subContext?.setOpen(false)}
        {...props}
      >
        {children}
        <ChevronRightIcon size={16} className="ml-auto text-muted-foreground/80" />
      </div>
    )
  }
)
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => {
    const subContext = React.useContext(DropdownMenuSubContext)

    if (!subContext?.open) return null

    const content = (
      <div
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-md border p-1 shadow-lg",
          "bg-popover text-popover-foreground",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
          className
        )}
        style={{
          position: 'absolute',
          left: '100%',
          top: 0,
          marginLeft: sideOffset,
        }}
        onMouseEnter={() => subContext.setOpen(true)}
        onMouseLeave={() => subContext.setOpen(false)}
        {...props}
      />
    )

    return content
  }
)
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}