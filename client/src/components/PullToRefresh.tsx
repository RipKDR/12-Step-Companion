import { useState, useRef, useEffect, ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  threshold?: number
  disabled?: boolean
  className?: string
}

const PULL_THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({
  onRefresh,
  children,
  threshold = PULL_THRESHOLD,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [announcement, setAnnouncement] = useState<string>("")
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(true)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)
  const springY = useSpring(y, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  })

  const pullProgress = useTransform(springY, [0, threshold], [0, 1])
  const rotation = useTransform(
    pullProgress,
    [0, 1],
    prefersReducedMotion() ? [0, 0] : [0, 180]
  )
  const opacity = useTransform(pullProgress, [0, 0.5, 1], [0, 0.5, 1])

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return
      const scrollTop = container.scrollTop || window.scrollY
      if (scrollTop === 0) {
        setCanPull(true)
        startY.current = e.touches[0].clientY
      } else {
        setCanPull(false)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - startY.current

      if (deltaY > 0 && container.scrollTop === 0) {
        e.preventDefault()
        setIsPulling(true)
        const pullDistance = Math.min(deltaY * 0.5, MAX_PULL)
        y.set(pullDistance)

        if (pullDistance >= threshold && !isPulling) {
          haptics.medium()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) return

      const currentY = springY.get()
      setIsPulling(false)

      if (currentY >= threshold) {
        setIsRefreshing(true)
        haptics.success()
        y.set(threshold)

        try {
          await onRefresh()
        } finally {
          setTimeout(() => {
            y.set(0)
            setIsRefreshing(false)
          }, 300)
        }
      } else {
        y.set(0)
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [canPull, isRefreshing, onRefresh, springY, threshold, y, disabled])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      role="region"
      aria-label="Pull to refresh"
      aria-live="polite"
      aria-atomic="true"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          y: useTransform(springY, (value) => value - 40),
          opacity,
        }}
        role="status"
        aria-live="polite"
        aria-label={isRefreshing ? "Refreshing content" : "Pull down to refresh"}
      >
        <motion.div
          style={{ rotate: rotation }}
          className="rounded-full bg-card border border-card-border p-2 shadow-lg"
          aria-hidden="true"
        >
          <RefreshCw
            className={cn(
              "h-5 w-5 text-primary",
              isRefreshing && "animate-spin"
            )}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
      <motion.div
        style={{
          y: springY,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

