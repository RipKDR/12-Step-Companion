import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface OptimisticUpdateOptions<T> {
  onUpdate: (value: T) => Promise<void> | void
  onError?: (error: Error, rollbackValue: T) => void
  onSuccess?: (value: T) => void
  delay?: number // Delay before showing success state
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options: OptimisticUpdateOptions<T>
) {
  const [value, setValue] = useState<T>(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const rollbackValueRef = useRef<T>(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const update = useCallback(
    async (newValue: T) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Store current value for rollback
      rollbackValueRef.current = value
      
      // Optimistically update UI
      setValue(newValue)
      setIsUpdating(true)
      setError(null)
      setIsSuccess(false)
      haptics.light()

      try {
        // Perform actual update
        await Promise.resolve(options.onUpdate(newValue))
        
        // Show success state briefly
        setIsSuccess(true)
        setIsUpdating(false)
        haptics.success()

        // Clear success state after delay
        timeoutRef.current = setTimeout(() => {
          setIsSuccess(false)
        }, options.delay || 1500)

        options.onSuccess?.(newValue)
      } catch (err) {
        // Rollback on error
        const error = err instanceof Error ? err : new Error("Update failed")
        setValue(rollbackValueRef.current)
        setError(error)
        setIsUpdating(false)
        setIsSuccess(false)
        haptics.error()
        options.onError?.(error, rollbackValueRef.current)
      }
    },
    [value, options]
  )

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(null)
    setIsUpdating(false)
    setIsSuccess(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [initialValue])

  return {
    value,
    isUpdating,
    error,
    isSuccess,
    update,
    reset,
  }
}

// Component wrapper for optimistic updates
interface OptimisticWrapperProps {
  isUpdating: boolean
  isSuccess: boolean
  error: Error | null
  children: React.ReactNode
  className?: string
}

export function OptimisticWrapper({
  isUpdating,
  isSuccess,
  error,
  children,
  className,
}: OptimisticWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-destructive text-sm mb-2"
          >
            <XCircle className="h-4 w-4" />
            <span>Update failed. Please try again.</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: isUpdating ? 0.7 : 1 }}
            exit={{ opacity: 0 }}
            className={cn(isUpdating && "opacity-70")}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1 z-10"
        >
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </motion.div>
      )}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-1 -right-1 z-10"
        >
          <CheckCircle2 className="h-3 w-3 text-green-600" />
        </motion.div>
      )}
    </div>
  )
}

