import { useMemo, useState, useEffect } from "react"
import { AnimatedCounter } from "./AnimatedCounter"
import { AnimatedProgressRing } from "./AnimatedProgressRing"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Flame, Trophy, Target, Heart } from "lucide-react"
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
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const { days, hours, minutes, totalDays, weeks, monthsEst, dayStreak } = useMemo(() => {
    const now = currentTime
    const clean = new Date(cleanDate)
    const diffMs = now.getTime() - clean.getTime()

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const weeks = Math.floor(totalDays / 7)
    const monthsEst = Math.floor(totalDays / 30)
    const dayStreak = totalDays // Assuming continuous streak

    return { days: totalDays, hours, minutes, totalDays, weeks, monthsEst, dayStreak }
  }, [cleanDate, currentTime])

  const progress = nextMilestone
    ? Math.min((totalDays / nextMilestone) * 100, 100)
    : 0

  // Celebration milestones
  const isMilestone = [7, 30, 90, 180, 365].includes(totalDays)
  const isNewWeek = totalDays > 0 && totalDays % 7 === 0

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-0 shadow-xl",
      isMilestone && "ring-2 ring-amber-400/50 shadow-amber-500/20",
      className
    )}>
      {/* Subtle background pattern */}
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%)] pointer-events-none" />

      <CardContent className="relative p-4 sm:p-6 lg:p-8">
        {/* Header with enhanced styling */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/20 dark:border-emerald-800/20">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Clean Time Streak
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Continuous, from your last reset
              </div>
            </div>
          </div>

          {/* Enhanced badge with glow effect */}
          <div className="relative">
            <Badge
              variant="secondary"
              className={cn(
                "px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-0 shadow-sm",
                "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
                "shadow-emerald-500/25",
                isMilestone && "animate-pulse"
              )}
            >
              <Flame className="h-3 w-3 mr-1.5" />
              Streak Intact
            </Badge>
            {isMilestone && (
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-md blur opacity-30 animate-pulse" />
            )}
          </div>
        </div>

        {/* Main counter with enhanced visual hierarchy */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          {/* Circular progress with enhanced styling */}
          <div className="relative mb-4 sm:mb-6 flex items-center justify-center">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-500/20 blur-xl animate-pulse" />

              {/* Main progress ring */}
              <AnimatedProgressRing
                progress={100}
                size={220}
                strokeWidth={8}
                showLabel={false}
                className="drop-shadow-lg sm:w-[220px] sm:h-[220px] w-[180px] h-[180px]"
                color="hsl(160 84% 39%)" // emerald-600
              />

              {/* Inner content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    {/* Large counter with enhanced typography */}
                    <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-slate-100 leading-none tracking-tight">
                      <AnimatedCounter value={days} />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Days Clean
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement indicator for milestones */}
              {isMilestone && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                  <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg animate-bounce">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inspirational message */}
          <div className="text-center max-w-xs px-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isMilestone
                ? "🎉 Milestone achieved! Your strength inspires others."
                : isNewWeek
                ? "✨ Another week stronger. Keep going!"
                : "Every day clean is a victory worth celebrating."
              }
            </p>
          </div>
        </div>

        {/* Enhanced stats grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { value: weeks, label: "Weeks", icon: Heart, color: "from-rose-500 to-pink-600" },
            { value: monthsEst, label: "Months est.", icon: Target, color: "from-blue-500 to-indigo-600" },
            { value: dayStreak, label: "Day streak", icon: Flame, color: "from-amber-500 to-orange-600" }
          ].map(({ value, label, icon: Icon, color }) => (
            <div
              key={label}
              className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              {/* Subtle gradient background */}
              <div className={cn("absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity", color)} />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 mb-2 shadow-sm">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator for next milestone */}
        {nextMilestone && progress < 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Next Milestone</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{nextMilestone} days</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500 ease-out"
                // eslint-disable-next-line react/forbid-dom-props
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

