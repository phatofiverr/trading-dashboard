
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Native Slot implementation
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { 
        ...props, 
        ref,
        ...children.props
      })
    }
    return <div ref={ref as React.Ref<HTMLDivElement>} {...props}>{children}</div>
  }
)

Slot.displayName = "Slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        modern: "bg-black/20 text-white border border-white/10 backdrop-filter backdrop-blur-sm hover:bg-black/30 transition-all shadow-sm",
        minimal: "bg-black/15 border-none hover:bg-black/25 text-white/90 hover:text-white transition-colors",
        glass: "bg-white/5 backdrop-filter backdrop-blur-md border border-white/10 text-white/90 hover:bg-white/10 hover:text-white shadow-sm transition-all",
        flat: "bg-transparent border border-white/10 text-white/80 hover:bg-white/5 hover:text-white transition-all",
        social: "bg-black/10 text-white/90 border border-positive/20 hover:bg-positive/20 hover:border-positive/30 transition-all",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
