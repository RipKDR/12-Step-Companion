import { useMemo } from "react"
import { AnimatedCounter } from "./AnimatedCounter"
import { AnimatedProgressRing } from "./AnimatedProgressRing"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedSobrietyCounterProps {
  cleanDate: string
  timezone?: string
  showProgress?: boolean
  nextMilestone?: number // days
  className?: string
}

export function EnhancedSobrietyCounter({
  cleanDate,
  timezone = "Australia/Melbourne",
  showProgress = true,
  nextMilestone,
  className,
}: EnhancedSobrietyCounterProps) {
  const { days, hours, minutes, totalDays } = useMemo(() => {
    const now = new Date()
    const clean = new Date(cleanDate)
    const diffMs = now.getTime() - clean.getTime()
    
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days: totalDays, hours, minutes, totalDays }
  }, [cleanDate])

  const progress = nextMilestone
    ? Math.min((totalDays / nextMilestone) * 100, 100)
    : 0

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>Clean Time</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={days}
                  className="text-4xl font-bold"
                />
                <span className="text-lg text-muted-foreground">days</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <AnimatedCounter value={hours} />
                  <span>hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <AnimatedCounter value={minutes} />
                  <span>minutes</span>
                </div>
              </div>
            </div>
            {nextMilestone && showProgress && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {nextMilestone - totalDays} days until next milestone
                </span>
              </div>
            )}
          </div>
          {showProgress && nextMilestone && (
            <AnimatedProgressRing
              progress={progress}
              size={80}
              strokeWidth={6}
              showLabel={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

