import { useState, useRef, ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion"
import { Trash2, Archive } from "lucide-react"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface SwipeableItemProps {
  children: ReactNode
  onDelete?: () => void
  onArchive?: () => void
  deleteThreshold?: number
  className?: string
  disabled?: boolean
}

const SWIPE_THRESHOLD = 100
const DELETE_THRESHOLD = 150

export function SwipeableItem({
  children,
  onDelete,
  onArchive,
  deleteThreshold = DELETE_THRESHOLD,
  className,
  disabled = false,
}: SwipeableItemProps) {
  const hasActions = !!(onDelete || onArchive)
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const springX = useSpring(x, {
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  })

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) {
      x.set(0)
      return
    }

    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(offset) > deleteThreshold || Math.abs(velocity) > 500) {
      if (offset < 0 && onDelete) {
        haptics.success()
        onDelete()
      } else if (offset > 0 && onArchive) {
        haptics.medium()
        onArchive()
      }
      x.set(0)
    } else {
      x.set(0)
    }
    setIsDragging(false)
  }

  const handleDragStart = () => {
    if (!disabled) {
      setIsDragging(true)
      haptics.light()
    }
  }

  const deleteOpacity = useSpring(
    springX,
    (value) => Math.max(0, Math.min(1, -value / deleteThreshold))
  )

  const archiveOpacity = useSpring(
    springX,
    (value) => Math.max(0, Math.min(1, value / deleteThreshold))
  )

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Action buttons behind */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive text-destructive-foreground"
          aria-hidden="true"
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </motion.div>
      </div>
      {onArchive && (
        <div className="absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
          <motion.div
            style={{ opacity: archiveOpacity }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <Archive className="h-5 w-5" aria-hidden="true" />
          </motion.div>
        </div>
      )}

      {/* Swipeable content */}
      <motion.div
        drag={hasActions && !disabled ? "x" : false}
        dragConstraints={{ left: onArchive ? -deleteThreshold : 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x: springX }}
        className={cn(
          "relative bg-card",
          isDragging && "cursor-grabbing"
        )}
        role={hasActions ? "button" : undefined}
        aria-label={hasActions ? (onDelete ? "Swipe left to delete" : "Swipe to archive") : undefined}
        tabIndex={hasActions && !disabled ? 0 : undefined}
        onKeyDown={(e) => {
          if (!hasActions || disabled) return
          if (e.key === "Delete" && onDelete) {
            e.preventDefault()
            onDelete()
          } else if (e.key === "a" && onArchive) {
            e.preventDefault()
            onArchive()
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

