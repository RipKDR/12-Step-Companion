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
  size = 120 
}: ProgressRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (current / total) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="progress-ring">
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
            className="transition-all duration-300 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-foreground">
            {stepNumber}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {current}/{total}
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {Math.round(progress)}% Complete
      </div>
    </div>
  );
}
