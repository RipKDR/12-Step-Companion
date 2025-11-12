import { useEffect, useState } from "react"
import { motion, useSpring, useTransform, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  className,
  prefix = "",
  suffix = "",
  formatter,
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  })
  const display = useTransform(spring, (current) => {
    if (formatter) {
      return formatter(current)
    }
    return current.toFixed(decimals)
  })

  const [displayValue, setDisplayValue] = useState<string>("0")

  useMotionValueEvent(display, "change", (latest) => {
    setDisplayValue(latest)
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  )
}

// Hook version for more control
export function useAnimatedCounter(
  value: number,
  duration = 1.5
) {
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return spring
}

