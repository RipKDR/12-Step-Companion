import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2, Check } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = "default",
    size = "default",
    loading = false,
    success = false,
    icon,
    iconPosition = "left",
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          // Base styles with premium transitions
          "group relative inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-all duration-200 ease-out-expo",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Premium interactions
          "active:scale-[0.98]",

          // Variant styles with depth and sophistication
          {
            // Primary - Bold with elevation
            "bg-primary text-primary-foreground shadow-elevation-1":
              variant === "default",
            "hover:shadow-elevation-2 hover:-translate-y-0.5":
              variant === "default" && !isDisabled,
            "active:shadow-elevation-1 active:translate-y-0":
              variant === "default" && !isDisabled,

            // Secondary - Subtle with depth
            "bg-secondary text-secondary-foreground shadow-sm border border-secondary-foreground/10":
              variant === "secondary",
            "hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5":
              variant === "secondary" && !isDisabled,

            // Destructive - Clear but not alarming
            "bg-destructive text-destructive-foreground shadow-elevation-1":
              variant === "destructive",
            "hover:bg-destructive/90 hover:shadow-elevation-2 hover:-translate-y-0.5":
              variant === "destructive" && !isDisabled,

            // Outline - Elegant border with hover fill
            "border-2 border-primary/20 bg-background text-foreground":
              variant === "outline",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-glow-primary":
              variant === "outline" && !isDisabled,

            // Ghost - Minimal with smooth transition
            "text-foreground hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",

            // Link - Text-only with underline
            "text-primary underline-offset-4 hover:underline":
              variant === "link",
          },

          // Size variants with optical sizing
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-9 px-3 text-xs rounded-md": size === "sm",
            "h-11 px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },

          // Performance optimization
          "will-change-transform",

          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}

        {/* Success State */}
        {success && !loading && (
          <Check
            className="h-4 w-4 animate-scale-in text-green-500"
            aria-hidden="true"
          />
        )}

        {/* Icon Left */}
        {!loading && !success && icon && iconPosition === "left" && (
          <span className="transition-transform group-hover:scale-110" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Button Content */}
        {children && (
          <span className="relative inline-flex items-center">
            {children}
          </span>
        )}

        {/* Icon Right */}
        {!loading && !success && icon && iconPosition === "right" && (
          <span className="transition-transform group-hover:scale-110" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Ripple effect container */}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-75" />
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

