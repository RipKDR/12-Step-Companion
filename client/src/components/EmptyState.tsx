import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: "default" | "minimal" | "card"
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const content = (
    <>
      {icon && (
        <div 
          className={cn(
            "mb-4 text-muted-foreground transition-opacity",
            variant === "minimal" ? "opacity-40" : "opacity-60"
          )} 
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 
        className={cn(
          "font-semibold mb-2",
          variant === "minimal" ? "text-base" : "text-lg"
        )} 
        id="empty-state-title"
      >
        {title}
      </h3>
      <p 
        className={cn(
          "text-muted-foreground max-w-sm",
          variant === "minimal" ? "text-xs mb-4" : "text-sm mb-6"
        )} 
        id="empty-state-description"
      >
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="default"
          className="min-h-[44px] min-w-[44px]"
          aria-describedby="empty-state-title empty-state-description"
        >
          {action.label}
        </Button>
      )}
    </>
  )

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-card-border bg-card",
          className
        )}
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "minimal" ? "py-8 px-4" : "py-12 px-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  )
}

// Pre-built empty states for common scenarios
export function EmptyJournalState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="No journal entries yet"
      description="Start documenting your recovery journey. Your thoughts and reflections are valuable."
      action={{
        label: "Create your first entry",
        onClick: onCreate,
      }}
    />
  )
}

export function EmptyStepsState({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      }
      title="Begin your step work"
      description="The 12 steps are a path to recovery. Start with Step 1 and work through them at your own pace."
      action={{
        label: "Start Step 1",
        onClick: onStart,
      }}
    />
  )
}

export function EmptyHomeState() {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      }
      title="Welcome to your recovery companion"
      description="This is your space for step work, journaling, and tracking your progress. Everything is private and stored locally on your device."
    />
  )
}

