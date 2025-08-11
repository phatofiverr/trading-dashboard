
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Types for the tabs components
interface TabsContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

// Context for managing tabs state
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs compound components must be used within Tabs")
  }
  return context
}

function Tabs({ 
  className, 
  defaultValue, 
  value: controlledValue, 
  onValueChange, 
  children,
  ...props 
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  
  const value = controlledValue ?? internalValue
  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [controlledValue, onValueChange])

  const contextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange
  }), [value, handleValueChange])

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ 
  className, 
  children,
  ...props 
}: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null)
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const triggers = listRef.current?.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>
    if (!triggers) return

    const currentIndex = Array.from(triggers).findIndex(trigger => trigger === event.target)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        nextIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = triggers.length - 1
        break
      default:
        return
    }

    triggers[nextIndex]?.focus()
    triggers[nextIndex]?.click()
  }

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        "flex items-center bg-transparent w-fit p-0.5",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ 
  className, 
  value: triggerValue, 
  children,
  disabled,
  ...props 
}: TabsTriggerProps) {
  const { value, onValueChange } = useTabsContext()
  const isSelected = value === triggerValue

  const handleClick = () => {
    if (!disabled) {
      onValueChange?.(triggerValue)
    }
  }

  return (
    <button
      data-slot="tabs-trigger"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabs-content-${triggerValue}`}
      data-state={isSelected ? "active" : "inactive"}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-white/60 transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-black/20 data-[state=active]:text-white data-[state=active]:shadow-xs [&_svg]:shrink-0",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ 
  className, 
  value: contentValue, 
  children,
  ...props 
}: TabsContentProps) {
  const { value } = useTabsContext()
  const isSelected = value === contentValue

  if (!isSelected) return null

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      id={`tabs-content-${contentValue}`}
      aria-labelledby={`tabs-trigger-${contentValue}`}
      tabIndex={0}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
