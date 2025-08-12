import * as React from "react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { checked?: boolean }
>(({ className, checked, ...props }, ref) => {
  console.log('Switch render:', { checked, propsChecked: props.checked });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Switch onChange:', { 
      targetChecked: e.target.checked, 
      currentChecked: checked,
      propsChecked: props.checked 
    });
    props.onChange?.(e);
  };

  // Use controlled checked prop if provided, otherwise fall back to internal state
  const isChecked = checked !== undefined ? checked : false;

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        data-slot="switch"
        className="sr-only"
        {...props}
        checked={isChecked}
        onChange={handleChange}
      />
      <div className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-green-500" : "bg-gray-600",
        className
      )}>
        <div className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out transform",
          isChecked ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
    </label>
  )
})
Switch.displayName = "Switch"

export { Switch }
