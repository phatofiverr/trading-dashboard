"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLElement>
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog")
  }
  return context
}

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentRef = React.useRef<HTMLElement>(null)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setUncontrolledOpen(newOpen)
    }
  }, [isControlled, onOpenChange])

  const value = React.useMemo(() => ({
    open,
    setOpen,
    triggerRef,
    contentRef,
  }), [open, setOpen])

  return (
    <DialogContext.Provider value={value} data-slot="dialog">
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen, triggerRef } = useDialog()
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true)
      onClick?.(event)
    }, [setOpen, onClick])

    const mergedRef = React.useCallback((node: HTMLButtonElement | null) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
      if (triggerRef) {
        ;(triggerRef as any).current = node
      }
    }, [ref, triggerRef])

    if (asChild) {
      return React.cloneElement(
        React.Children.only(props.children as React.ReactElement),
        {
          ...props,
          ref: mergedRef,
          onClick: handleClick,
          'data-slot': 'dialog-trigger',
        }
      )
    }

    return (
      <button
        ref={mergedRef}
        onClick={handleClick}
        data-slot="dialog-trigger"
        {...props}
      />
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(
    <div data-slot="dialog-portal">{children}</div>,
    document.body
  )
}

interface DialogCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = useDialog()
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false)
      onClick?.(event)
    }, [setOpen, onClick])

    if (asChild) {
      return React.cloneElement(
        React.Children.only(props.children as React.ReactElement),
        {
          ...props,
          ref,
          onClick: handleClick,
          'data-slot': 'dialog-close',
        }
      )
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        data-slot="dialog-close"
        {...props}
      />
    )
  }
)
DialogClose.displayName = "DialogClose"

interface DialogOverlayProps extends React.ComponentProps<"div"> {}

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useDialog()
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        setOpen(false)
      }
      onClick?.(event)
    }, [setOpen, onClick])

    return (
      <div
        ref={ref}
        onClick={handleClick}
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
        {...props}
      />
    )
  }
)
DialogOverlay.displayName = "DialogOverlay"

interface DialogContentProps extends React.ComponentProps<"div"> {
  hideClose?: boolean
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, hideClose = false, onKeyDown, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentRef } = useDialog()
    
    // Focus management
    const previousFocusRef = React.useRef<HTMLElement | null>(null)
    
    React.useEffect(() => {
      if (open) {
        // Store current focus
        previousFocusRef.current = document.activeElement as HTMLElement
        
        // Focus the content
        const content = contentRef.current
        if (content) {
          content.focus()
        }
      } else {
        // Restore focus to trigger when closed
        const previousFocus = previousFocusRef.current || triggerRef.current
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus()
        }
      }
    }, [open, contentRef, triggerRef])

    // Escape key handler
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
      onKeyDown?.(event)
    }, [setOpen, onKeyDown])

    // Prevent scrolling when dialog is open
    React.useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = originalOverflow
        }
      }
    }, [open])

    const mergedRef = React.useCallback((node: HTMLDivElement | null) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
      if (contentRef) {
        ;(contentRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
    }, [ref, contentRef])

    if (!open) {
      return null
    }

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={mergedRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          data-slot="dialog-content"
          className={cn(
            "bg-background fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
          {!hideClose && (
            <DialogClose className="group focus-visible:border-ring focus-visible:ring-ring/50 absolute top-3 right-3 flex size-7 items-center justify-center rounded transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none">
              <XIcon
                size={16}
                className="opacity-60 transition-opacity group-hover:opacity-100"
              />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </div>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = "DialogContent"

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

interface DialogTitleProps extends React.ComponentProps<"h2"> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        data-slot="dialog-title"
        className={cn("text-lg leading-none font-semibold", className)}
        {...props}
      />
    )
  }
)
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps extends React.ComponentProps<"p"> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="dialog-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
      />
    )
  }
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
