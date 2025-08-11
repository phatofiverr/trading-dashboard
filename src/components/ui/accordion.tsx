import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionContextType {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

function Accordion({ 
  children, 
  type = "single", 
  value, 
  onValueChange,
  collapsible = true,
  className,
  ...props 
}: {
  children: React.ReactNode
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AccordionContext.Provider value={{ type, value, onValueChange, collapsible }}>
      <div data-slot="accordion" className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error('AccordionItem must be used within Accordion')

  const isOpen = React.useMemo(() => {
    if (context.type === "single") {
      return context.value === value
    } else {
      return Array.isArray(context.value) && context.value.includes(value)
    }
  }, [context.value, context.type, value])

  const toggle = React.useCallback(() => {
    if (context.type === "single") {
      const newValue = isOpen && context.collapsible ? "" : value
      context.onValueChange?.(newValue)
    } else {
      const currentValues = Array.isArray(context.value) ? context.value : []
      const newValues = isOpen 
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      context.onValueChange?.(newValues)
    }
  }, [context, isOpen, value])

  return (
    <div
      ref={ref}
      data-slot="accordion-item"
      data-state={isOpen ? "open" : "closed"}
      className={cn("border-b", className)}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, toggle, value } as any)
        }
        return child
      })}
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean
    toggle?: () => void
  }
>(({ className, children, isOpen, toggle, ...props }, ref) => (
  <div className="flex">
    <button
      ref={ref}
      data-slot="accordion-trigger"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={toggle}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  </div>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
  }
>(({ className, children, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="accordion-content"
    data-state={isOpen ? "open" : "closed"}
    className={cn(
      "overflow-hidden text-sm transition-all duration-200",
      isOpen ? "animate-accordion-down" : "animate-accordion-up",
      className
    )}
    style={{
      height: isOpen ? "auto" : "0",
    }}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </div>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
