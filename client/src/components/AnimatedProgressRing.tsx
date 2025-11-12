import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
  color?: string
  backgroundColor?: string
}

export function AnimatedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = false,
  label,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
}: AnimatedProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progressValue = useMotionValue(0)
  const springProgress = useSpring(progressValue, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  })

  useEffect(() => {
    progressValue.set(progress)
  }, [progress, progressValue])

  const offset = useSpring(
    springProgress,
    (value) => circumference - (value / 100) * circumference
  )

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.1))" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
          }}
          initial={{ strokeDashoffset: circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {label && (
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
            )}
            <motion.div
              className="text-lg font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

