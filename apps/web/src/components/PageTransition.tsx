"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Premium page transition component that provides smooth fade-in animations
 * when navigating between pages. Respects prefers-reduced-motion.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Reset visibility on route change
    setIsVisible(false);

    // Trigger fade-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out-expo",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stagger animation container for lists and grids
 */
interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function StaggerContainer({ children, delay = 50, className }: StaggerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * delay}ms`,
            animationFillMode: "both",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Fade-in section for content that should animate on mount
 */
interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInSection({ children, delay = 0, className }: FadeInSectionProps) {
  return (
    <div
      className={cn("animate-fade-in", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Slide-in section from various directions
 */
interface SlideInSectionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}

export function SlideInSection({
  children,
  direction = "up",
  delay = 0,
  className,
}: SlideInSectionProps) {
  const animationMap = {
    left: "animate-slide-in-left",
    right: "animate-slide-in-right",
    up: "animate-slide-up",
    down: "animate-slide-down",
  };

  return (
    <div
      className={cn(animationMap[direction], className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
