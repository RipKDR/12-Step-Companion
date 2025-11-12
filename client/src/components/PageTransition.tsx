import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "wouter"
import { useRef } from "react"

interface PageTransitionProps {
  children: ReactNode
  route?: string
}

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const transitionVariants = {
  initial: (direction: number) => ({
    opacity: prefersReducedMotion() ? 1 : 0,
    x: prefersReducedMotion() ? 0 : direction > 0 ? 20 : -20,
    scale: prefersReducedMotion() ? 1 : 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    opacity: prefersReducedMotion() ? 1 : 0,
    x: prefersReducedMotion() ? 0 : direction > 0 ? -20 : 20,
    scale: prefersReducedMotion() ? 1 : 0.98,
  }),
}

const transitionConfig = {
  duration: prefersReducedMotion() ? 0 : 0.2,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}

export function PageTransition({ children, route }: PageTransitionProps) {
  const [location] = useLocation()
  const currentRoute = route || location

  // Determine direction based on route order
  const routeOrder = ["/", "/steps", "/journal", "/more"]
  const currentIndex = routeOrder.indexOf(currentRoute)
  const prevIndex = useRef(currentIndex)

  const direction = currentIndex > prevIndex.current ? 1 : -1
  prevIndex.current = currentIndex

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentRoute}
        custom={direction}
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitionConfig}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

