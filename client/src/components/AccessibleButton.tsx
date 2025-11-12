import { ButtonHTMLAttributes, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-busy"?: boolean
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      "aria-busy": ariaBusy,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading || ariaBusy}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="sr-only" aria-live="polite">
            Loading
          </span>
        )}
        {children}
      </Button>
    )
  }
)
AccessibleButton.displayName = "AccessibleButton"

