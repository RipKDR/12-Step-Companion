import * as React from "react";
import { cn } from "../../lib/utils";
import { Check, AlertCircle, Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "floating" | "filled";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success = false,
      helperText,
      leftIcon,
      rightIcon,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const shouldFloat = variant === "floating" && (isFocused || hasValue);

    return (
      <div className="w-full">
        <div className="relative">
          {/* Floating Label */}
          {label && variant === "floating" && (
            <label
              className={cn(
                "absolute left-3 transition-all duration-200 ease-out-expo pointer-events-none",
                "text-muted-foreground",
                shouldFloat
                  ? "top-0 -translate-y-1/2 text-xs bg-background px-1 text-primary"
                  : "top-1/2 -translate-y-1/2 text-sm"
              )}
            >
              {label}
            </label>
          )}

          {/* Static Label */}
          {label && variant !== "floating" && (
            <label className="block text-sm font-medium text-foreground mb-2">
              {label}
            </label>
          )}

          <div className="relative">
            {/* Left Icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {leftIcon}
              </div>
            )}

            {/* Input Field */}
            <input
              type={inputType}
              className={cn(
                // Base styles
                "flex w-full rounded-lg border bg-background px-4 py-2.5 text-sm",
                "transition-all duration-200 ease-out-expo",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
                "disabled:cursor-not-allowed disabled:opacity-50",

                // Variant styles
                {
                  "border-input hover:border-primary/50": variant === "default",
                  "bg-muted border-transparent focus:bg-background focus:border-input":
                    variant === "filled",
                },

                // State styles
                {
                  "border-destructive focus:ring-destructive/20 animate-shake":
                    error,
                  "border-green-500 focus:ring-green-500/20": success,
                },

                // Icon padding
                {
                  "pl-10": leftIcon,
                  "pr-10": rightIcon || isPasswordType || success || error,
                },

                className
              )}
              ref={ref}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
              }
              {...props}
            />

            {/* Right Icons Container */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Success Icon */}
              {success && !error && (
                <Check className="h-4 w-4 text-green-500 animate-scale-in" />
              )}

              {/* Error Icon */}
              {error && (
                <AlertCircle className="h-4 w-4 text-destructive animate-scale-in" />
              )}

              {/* Password Toggle */}
              {isPasswordType && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Custom Right Icon */}
              {rightIcon && !success && !error && (
                <div className="text-muted-foreground">{rightIcon}</div>
              )}
            </div>

            {/* Focus Glow Effect */}
            {isFocused && !error && (
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  boxShadow: "0 0 0 3px hsl(var(--ring) / 0.1)",
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-2 text-sm text-destructive animate-slide-down"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-2 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea component with similar polish
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            className={cn(
              // Base styles
              "flex min-h-[100px] w-full rounded-lg border bg-background px-4 py-3 text-sm",
              "transition-all duration-200 ease-out-expo",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-y",

              // State styles
              {
                "border-input hover:border-primary/50": !error && !success,
                "border-destructive focus:ring-destructive/20 animate-shake":
                  error,
                "border-green-500 focus:ring-green-500/20": success,
              },

              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-2 text-sm text-destructive animate-slide-down"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-2 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
