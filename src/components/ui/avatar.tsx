import * as React from "react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar"
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void
  }
>(({ className, onLoadingStatusChange, ...props }, ref) => {
  const [loadingStatus, setLoadingStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle")

  const handleLoad = () => {
    setLoadingStatus("loaded")
    onLoadingStatusChange?.("loaded")
  }

  const handleError = () => {
    setLoadingStatus("error")
    onLoadingStatusChange?.("error")
  }

  React.useEffect(() => {
    if (props.src) {
      setLoadingStatus("loading")
      onLoadingStatusChange?.("loading")
    }
  }, [props.src, onLoadingStatusChange])

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        display: loadingStatus === "loaded" ? "block" : "none"
      }}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
