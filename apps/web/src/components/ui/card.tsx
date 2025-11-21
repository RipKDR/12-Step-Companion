import * as React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated";
  loading?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", loading = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles with premium depth
        "group relative rounded-xl border border-border/50 bg-card text-card-foreground",
        "shadow-elevation-1 transition-all duration-300 ease-out-expo",
        "overflow-hidden",

        // Variant styles
        {
          // Default - Subtle depth
          "hover:shadow-elevation-2": variant === "default",

          // Interactive - Obvious hover state for clickable cards
          "cursor-pointer hover:shadow-elevation-3 hover:-translate-y-1 hover:border-primary/30":
            variant === "interactive",
          "active:translate-y-0 active:shadow-elevation-1":
            variant === "interactive",

          // Elevated - Premium floating appearance
          "shadow-elevation-2 hover:shadow-elevation-3": variant === "elevated",
        },

        // Performance optimization
        "will-change-transform",

        // Loading state
        { "animate-pulse-subtle pointer-events-none": loading },

        className
      )}
      {...props}
    >
      {props.children}

      {/* Subtle gradient overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </div>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 p-6 pt-0",
      "border-t border-border/30 bg-muted/5",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

