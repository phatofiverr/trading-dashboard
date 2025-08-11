"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Context for managing select state
interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select component")
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }, [value, onValueChange])
  
  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen, 
      disabled 
    }}>
      <div data-slot="select" className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectGroupProps {
  children: React.ReactNode
  className?: string
}

function SelectGroup({ children, className }: SelectGroupProps) {
  return (
    <div data-slot="select-group" className={className}>
      {children}
    </div>
  )
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValueContext = React.createContext<{
  setSelectedContent: (content: React.ReactNode) => void
} | undefined>(undefined)

function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useSelectContext()
  const [selectedContent, setSelectedContent] = React.useState<React.ReactNode | undefined>()
  
  // Find and display content for current value
  const displayContent = React.useMemo(() => {
    if (!value) return placeholder
    return selectedContent || value // Fallback to value if no content is set
  }, [value, selectedContent, placeholder])
  
  // Reset selected content when value changes to undefined
  React.useEffect(() => {
    if (!value) {
      setSelectedContent(undefined)
    }
  }, [value])
  
  return (
    <SelectValueContext.Provider value={{ setSelectedContent }}>
      <span 
        data-slot="select-value" 
        className={cn("flex items-center gap-2", className)}
        data-placeholder={!value ? "" : undefined}
      >
        {displayContent}
      </span>
    </SelectValueContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen, disabled, value } = useSelectContext()
  
  const handleClick = () => {
    if (!disabled) {
      setOpen(!open)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  
  return (
    <button
      type="button"
      data-slot="select-trigger"
      className={cn(
        "border-input text-foreground data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>span]:line-clamp-1",
        !value && "text-muted-foreground",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-expanded={open}
      aria-haspopup="listbox"
      role="combobox"
      {...props}
    >
      {children}
      <ChevronDownIcon
        size={16}
        className={cn(
          "text-muted-foreground/80 in-aria-invalid:text-destructive/80 shrink-0 transition-transform",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
  position?: "popper"
}

function SelectContent({ className, children, position = "popper" }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        const trigger = document.querySelector('[data-slot="select-trigger"]')
        if (trigger && !trigger.contains(event.target as Node)) {
          setOpen(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])
  
  // Handle escape key
  React.useEffect(() => {
    if (!open) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      className={cn(
        "border-input bg-popover text-popover-foreground absolute z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        "w-full mt-1",
        className
      )}
      role="listbox"
    >
      <SelectScrollUpButton />
      <div className="p-1 max-h-80 overflow-y-auto">
        {children}
      </div>
      <SelectScrollDownButton />
    </div>
  )
}

interface SelectLabelProps {
  className?: string
  children: React.ReactNode
}

function SelectLabel({ className, children }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      className={cn(
        "text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  className?: string
  children: React.ReactNode
  value: string
  disabled?: boolean
}

function SelectItem({ className, children, value, disabled }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const valueContext = React.useContext(SelectValueContext)
  const isSelected = selectedValue === value
  
  // Update selected content when this item becomes selected
  React.useEffect(() => {
    if (isSelected && valueContext) {
      valueContext.setSelectedContent(children)
    }
  }, [isSelected, children, valueContext])
  
  const handleClick = () => {
    if (!disabled && onValueChange) {
      onValueChange(value)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onValueChange?.(value)
    }
  }
  
  return (
    <div
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded py-1.5 ps-8 pe-2 text-sm outline-hidden select-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={disabled ? -1 : 0}
    >
      <span className="absolute start-2 flex size-3.5 items-center justify-center">
        {isSelected && <CheckIcon size={16} />}
      </span>
      <span>{children}</span>
    </div>
  )
}

interface SelectSeparatorProps {
  className?: string
}

function SelectSeparator({ className }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
    />
  )
}

interface SelectScrollUpButtonProps {
  className?: string
}

function SelectScrollUpButton({ className }: SelectScrollUpButtonProps) {
  // For now, we'll render nothing as native scrolling handles this
  // Could be enhanced with custom scroll buttons if needed
  return null
}

interface SelectScrollDownButtonProps {
  className?: string
}

function SelectScrollDownButton({ className }: SelectScrollDownButtonProps) {
  // For now, we'll render nothing as native scrolling handles this
  // Could be enhanced with custom scroll buttons if needed
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
