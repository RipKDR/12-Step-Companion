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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (current / total) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4" data-testid="progress-ring">
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
            {stepNumber}
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            {current} of {total}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
