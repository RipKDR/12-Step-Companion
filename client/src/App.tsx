import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import UpdateNotification from "@/components/UpdateNotification";
import { useAppStore } from "@/store/useAppStore";
import { registerServiceWorker, skipWaiting } from "@/lib/pwa";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { lazy, Suspense } from "react";
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

// Routes - Lazy loaded for code splitting
const Home = lazy(() => import("@/routes/Home"));
const Steps = lazy(() => import("@/routes/Steps"));
const Journal = lazy(() => import("@/routes/Journal"));
const More = lazy(() => import("@/routes/More"));
const Worksheets = lazy(() => import("@/routes/Worksheets"));
const Meetings = lazy(() => import("@/routes/Meetings"));
const Emergency = lazy(() => import("@/routes/Emergency"));
const Resources = lazy(() => import("@/routes/Resources"));
const Settings = lazy(() => import("@/routes/Settings"));
const Onboarding = lazy(() => import("@/routes/Onboarding"));
const Analytics = lazy(() => import("@/routes/Analytics"));
const Contacts = lazy(() => import("@/routes/Contacts"));
const Achievements = lazy(() => import("@/routes/Achievements"));
const UsageInsights = lazy(() => import("@/routes/UsageInsights"));
const Landing = lazy(() => import("@/routes/Landing"));
const AISponsor = lazy(() => import("@/routes/AISponsor"));
const SponsorConnection = lazy(() => import("@/routes/SponsorConnection"));

function Router() {
  const { isLoading } = useAuth();
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  // Show landing page only while checking auth (brief loading state)
  // In standalone mode, this will be very brief since auth always succeeds
  if (isLoading) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </Switch>
      </Suspense>
    );
  }

  // Show onboarding if not completed
  if (!onboardingComplete) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/" component={Onboarding} />
          <Route component={Onboarding} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <>
      <PageTransition>
        <Suspense fallback={<RouteFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/steps" component={Steps} />
            <Route path="/journal" component={Journal} />
            <Route path="/more" component={More} />
            <Route path="/worksheets" component={Worksheets} />
            <Route path="/meetings" component={Meetings} />
            <Route path="/emergency" component={Emergency} />
            <Route path="/resources" component={Resources} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/usage-insights" component={UsageInsights} />
            <Route path="/contacts" component={Contacts} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/ai-sponsor" component={AISponsor} />
            <Route path="/sponsor-connection" component={SponsorConnection} />
            <Route path="/settings" component={Settings} />
            <Route path="/onboarding" component={Onboarding} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </PageTransition>
      <BottomNav />
    </>
  );
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette();

  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker(() => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    skipWaiting();
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Router />
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          {updateAvailable && (
            <UpdateNotification
              onUpdate={handleUpdate}
              onDismiss={handleDismiss}
            />
          )}
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
