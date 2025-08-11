import * as React from "react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }
>(({ className, name, value, onValueChange, children, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value);
  };

  return (
    <div
      ref={ref}
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            name,
            checked: child.props.value === value,
            onChange: handleChange,
            disabled: props.disabled || child.props.disabled,
          } as any);
        }
        return child;
      })}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="radio"
        data-slot="radio-item"
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary bg-transparent ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary",
          className
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </div>
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
