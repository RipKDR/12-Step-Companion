import { AnimatedProgressRing } from "./AnimatedProgressRing"
import { NumberCounter } from "./NumberCounter"

interface ProgressRingProps {
  current: number;
  total: number;
  stepNumber: number;
  size?: number;
}

export default function ProgressRing({ 
  current, 
  total, 
  stepNumber,
  size = 140 
}: ProgressRingProps) {
  const strokeWidth = 12;
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  // Use AnimatedProgressRing for better animations
  if (current > 0 || total > 0) {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="progress-ring">
        <AnimatedProgressRing
          progress={progress}
          size={size}
          strokeWidth={strokeWidth}
          showLabel={true}
          label={`Step ${stepNumber}`}
        />
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            <NumberCounter value={Math.round(progress)} />%
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium text-center">
          <NumberCounter value={current} /> of <NumberCounter value={total} />
        </div>
      </div>
    )
  }

  // Fallback for empty state
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference;

  return (
    <div className="flex flex-col items-center gap-4" data-testid="progress-ring">
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Step
          </div>
          <div className="text-4xl font-semibold text-foreground">
            <NumberCounter value={stepNumber} />
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            <NumberCounter value={current} /> of <NumberCounter value={total} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">
          <NumberCounter value={Math.round(progress)} />%
        </span>
      </div>
    </div>
  );
}
