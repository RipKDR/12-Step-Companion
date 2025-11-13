import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorStateProps {
  title?: string
  description: string
  error?: Error | string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "destructive"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: "default" | "alert" | "minimal"
  icon?: ReactNode
}

export function ErrorState({
  title = "Something went wrong",
  description,
  error,
  action,
  secondaryAction,
  className,
  variant = "default",
  icon,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={cn("my-4", className)} role="alert">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          {errorMessage && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">Technical details</summary>
              <pre className="mt-2 text-xs overflow-auto">{errorMessage}</pre>
            </details>
          )}
        </AlertDescription>
        {action && (
          <div className="mt-4">
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="min-h-[44px] min-w-[44px]"
            >
              {action.label}
            </Button>
          </div>
        )}
      </Alert>
    )
  }

  const defaultIcon = icon || <AlertTriangle className="h-12 w-12" />

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "minimal" ? "py-8 px-4" : "py-12 px-4",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 text-destructive opacity-80" aria-hidden="true">
        {defaultIcon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground" id="error-state-title">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6" id="error-state-description">
        {description}
      </p>
      {errorMessage && variant !== "minimal" && (
        <details className="mb-6 text-left max-w-sm">
          <summary className="cursor-pointer text-xs text-muted-foreground mb-2">
            Technical details
          </summary>
          <pre className="text-xs text-muted-foreground overflow-auto p-2 bg-muted rounded border border-border">
            {errorMessage}
          </pre>
        </details>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="min-h-[44px] min-w-[44px]"
            aria-describedby="error-state-title error-state-description"
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="min-h-[44px] min-w-[44px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Pre-built error states for common scenarios
export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Connection error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      action={{
        label: "Retry",
        onClick: onRetry,
      }}
      icon={<RefreshCw className="h-12 w-12" />}
    />
  )
}

export function NotFoundErrorState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Not found"
      description="The page or resource you're looking for doesn't exist or has been moved."
      action={
        onGoHome
          ? {
              label: "Go home",
              onClick: onGoHome,
            }
          : undefined
      }
      icon={<Home className="h-12 w-12" />}
    />
  )
}

export function PermissionErrorState({ onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <ErrorState
      title="Permission required"
      description="This feature requires additional permissions. Please grant access to continue."
      action={{
        label: "Grant permission",
        onClick: onRequestPermission,
      }}
    />
  )
}

