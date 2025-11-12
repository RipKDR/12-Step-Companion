import { ReactNode, useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion"
import { useLocation } from "wouter"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface SwipeableRouteProps {
  children: ReactNode
  routes: string[]
  onRouteChange?: (route: string) => void
  disabled?: boolean
}

const SWIPE_THRESHOLD = 50

export function SwipeableRoute({
  children,
  routes,
  onRouteChange,
  disabled = false,
}: SwipeableRouteProps) {
  const [location, setLocation] = useLocation()
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const springX = useSpring(x, {
    stiffness: 400,
    damping: 35,
    mass: 0.5,
  })

  const currentIndex = routes.indexOf(location)
  const canSwipeLeft = currentIndex < routes.length - 1
  const canSwipeRight = currentIndex > 0

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) {
      x.set(0)
      setIsDragging(false)
      return
    }

    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 300) {
      if (offset < 0 && canSwipeLeft) {
        // Swipe left - go to next route
        const nextRoute = routes[currentIndex + 1]
        setLocation(nextRoute)
        onRouteChange?.(nextRoute)
        haptics.light()
      } else if (offset > 0 && canSwipeRight) {
        // Swipe right - go to previous route
        const prevRoute = routes[currentIndex - 1]
        setLocation(prevRoute)
        onRouteChange?.(prevRoute)
        haptics.light()
      }
    }
    x.set(0)
    setIsDragging(false)
  }

  useEffect(() => {
    x.set(0)
  }, [location, x])

  return (
    <motion.div
      drag="x"
      dragConstraints={{
        left: canSwipeLeft ? -SWIPE_THRESHOLD * 2 : 0,
        right: canSwipeRight ? SWIPE_THRESHOLD * 2 : 0,
      }}
      dragElastic={0.1}
      onDragStart={() => !disabled && setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x: springX }}
      className={cn(
        "w-full",
        isDragging && "cursor-grabbing"
      )}
    >
      {children}
    </motion.div>
  )
}

