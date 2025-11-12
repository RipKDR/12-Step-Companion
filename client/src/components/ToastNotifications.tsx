import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced toast notifications with animations
export function useEnhancedToast() {
  const { toast } = useToast()

  return {
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
        className: "border-green-500/50 bg-green-500/10",
      })
    },
    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "destructive",
      })
    },
    info: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
      })
    },
    warning: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
        className: "border-yellow-500/50 bg-yellow-500/10",
      })
    },
  }
}

