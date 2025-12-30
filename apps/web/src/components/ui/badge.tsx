import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  dismissible = false,
  onDismiss,
  icon,
  children,
  ...props
}: BadgeProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        // Base styles with premium feel
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        "transition-all duration-200 ease-out-expo animate-fade-in",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",

        // Size variants
        {
          "px-2 py-0.5 text-2xs": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
          "px-3 py-1.5 text-sm": size === "lg",
        },

        // Variant styles with sophistication
        {
          // Primary - Bold with subtle shadow
          "border-transparent bg-primary text-primary-foreground shadow-sm":
            variant === "default",
          "hover:bg-primary/90": variant === "default",

          // Secondary - Muted elegance
          "border-transparent bg-secondary text-secondary-foreground":
            variant === "secondary",
          "hover:bg-secondary/80": variant === "secondary",

          // Destructive - Clear error state
          "border-transparent bg-destructive text-destructive-foreground shadow-sm":
            variant === "destructive",
          "hover:bg-destructive/90": variant === "destructive",

          // Success - Positive feedback
          "border-transparent bg-green-500 text-white shadow-sm":
            variant === "success",
          "hover:bg-green-600": variant === "success",

          // Warning - Attention needed
          "border-transparent bg-amber-500 text-white shadow-sm":
            variant === "warning",
          "hover:bg-amber-600": variant === "warning",

          // Info - Informative state
          "border-transparent bg-blue-500 text-white shadow-sm":
            variant === "info",
          "hover:bg-blue-600": variant === "info",

          // Outline - Subtle border style
          "bg-background text-foreground border-border/50":
            variant === "outline",
          "hover:bg-accent": variant === "outline",
        },

        className
      )}
      {...props}
    >
      {/* Status dot indicator */}
      {dot && (
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            {
              "bg-primary-foreground": variant === "default",
              "bg-secondary-foreground": variant === "secondary",
              "bg-destructive-foreground": variant === "destructive",
              "bg-white": variant === "success" || variant === "warning" || variant === "info",
              "bg-foreground": variant === "outline",
            },
            pulse && "animate-ping-once"
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && (
        <span className="inline-flex" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Badge content */}
      {children}

      {/* Dismissible button */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex items-center justify-center rounded-full hover:bg-black/10 transition-colors p-0.5 -mr-1"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export { Badge };

