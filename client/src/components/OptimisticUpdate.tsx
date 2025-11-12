import { ReactNode, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptimisticUpdateProps<T> {
  optimisticValue: T
  actualValue?: T
  onUpdate: (value: T) => Promise<void> | void
  onError?: (error: Error) => void
  children: (value: T, isOptimistic: boolean) => ReactNode
  className?: string
}

export function OptimisticUpdate<T>({
  optimisticValue,
  actualValue,
  onUpdate,
  onError,
  children,
  className,
}: OptimisticUpdateProps<T>) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [displayValue, setDisplayValue] = useState<T>(optimisticValue)

  useEffect(() => {
    if (actualValue !== undefined) {
      setDisplayValue(actualValue)
      setIsUpdating(false)
      setError(null)
    } else {
      setDisplayValue(optimisticValue)
      setIsUpdating(true)
      // Trigger update
      Promise.resolve(onUpdate(optimisticValue))
        .then(() => {
          setIsUpdating(false)
        })
        .catch((err) => {
          setError(err)
          setIsUpdating(false)
          onError?.(err)
          // Rollback to previous value
          if (actualValue !== undefined) {
            setDisplayValue(actualValue)
          }
        })
    }
  }, [optimisticValue, actualValue, onUpdate, onError])

  const isOptimistic = isUpdating && actualValue === undefined

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-destructive text-sm"
          >
            <XCircle className="h-4 w-4" />
            <span>Update failed. Please try again.</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(isOptimistic && "opacity-70")}
          >
            {children(displayValue, isOptimistic)}
          </motion.div>
        )}
      </AnimatePresence>
      {isOptimistic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1"
        >
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </motion.div>
      )}
    </div>
  )
}

