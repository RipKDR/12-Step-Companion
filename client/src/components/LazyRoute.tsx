import { lazy, Suspense, ComponentType } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

interface LazyRouteProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
}

export function LazyRoute({ component, fallback }: LazyRouteProps) {
  const LazyComponent = lazy(component)

  const defaultFallback = (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-32 w-full" />
      </Card>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent />
    </Suspense>
  )
}

