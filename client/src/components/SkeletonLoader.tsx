import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StreakCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </Card>
);

export const ChallengeCardSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </Card>
);

export const DailyCardSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  </Card>
);

export const ProgressRingSkeleton = () => (
  <div className="flex justify-center py-8">
    <div className="relative">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-16 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
    </div>
  </div>
);

export const QuickActionsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
);

