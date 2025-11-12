import { useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface NumberCounterProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

export function NumberCounter({
  value,
  duration = 1.5,
  decimals = 0,
  className,
  prefix = "",
  suffix = "",
  formatter,
}: NumberCounterProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  })
  
  const display = useTransform(springValue, (val) => {
    if (formatter) {
      return formatter(val)
    }
    return val.toFixed(decimals)
  })

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  return (
    <motion.span
      className={cn("tabular-nums inline-block", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {prefix}
      <motion.span>
        {display}
      </motion.span>
      {suffix}
    </motion.span>
  )
}

