import { Suspense, ComponentType, lazy } from "react";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Route fallback component
const RouteFallback = () => (
  <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
    <Card className="p-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </Card>
  </div>
);

/**
 * Creates a wrapped route component with error boundary and suspense
 * @param importFn - Function that imports the route component
 * @param routeName - Name of the route for error messages
 * @returns Wrapped component ready for wouter Route
 */
export function createRouteWrapper(
  importFn: () => Promise<{ default: ComponentType }>,
  routeName: string
): ComponentType {
  const LazyComponent = lazy(importFn);

  return function WrappedRoute() {
    return (
      <Suspense fallback={<RouteFallback />}>
        <RouteErrorBoundary routeName={routeName}>
          <LazyComponent />
        </RouteErrorBoundary>
      </Suspense>
    );
  };
}

