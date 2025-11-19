import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { TRPCProvider } from "./lib/trpc-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import UpdateNotification from "@/components/UpdateNotification";
import { useAppStore } from "@/store/useAppStore";
import { registerServiceWorker, skipWaiting } from "@/lib/pwa";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { lazy, Suspense } from "react";
import { createRouteWrapper } from "@/components/RouteWrapper";
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

// Routes - Lazy loaded for code splitting with error boundaries
const Home = createRouteWrapper(() => import("@/routes/Home"), "Home");
const Steps = createRouteWrapper(() => import("@/routes/Steps"), "Steps");
const Journal = createRouteWrapper(() => import("@/routes/Journal"), "Journal");
const More = createRouteWrapper(() => import("@/routes/More"), "More");
const Worksheets = createRouteWrapper(() => import("@/routes/Worksheets"), "Worksheets");
const Meetings = createRouteWrapper(() => import("@/routes/Meetings"), "Meetings");
const Emergency = createRouteWrapper(() => import("@/routes/Emergency"), "Emergency");
const Resources = createRouteWrapper(() => import("@/routes/Resources"), "Resources");
const Settings = createRouteWrapper(() => import("@/routes/Settings"), "Settings");
const Onboarding = createRouteWrapper(() => import("@/routes/Onboarding"), "Onboarding");
const Analytics = createRouteWrapper(() => import("@/routes/Analytics"), "Analytics");
const Contacts = createRouteWrapper(() => import("@/routes/Contacts"), "Contacts");
const Achievements = createRouteWrapper(() => import("@/routes/Achievements"), "Achievements");
const UsageInsights = createRouteWrapper(() => import("@/routes/UsageInsights"), "Usage Insights");
const Landing = createRouteWrapper(() => import("@/routes/Landing"), "Landing");
const AISponsor = createRouteWrapper(() => import("@/routes/AISponsor"), "AI Sponsor");
const SponsorConnection = createRouteWrapper(() => import("@/routes/SponsorConnection"), "Sponsor Connection");
const NotFound = createRouteWrapper(() => import("@/pages/not-found"), "Not Found");

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
    <TRPCProvider>
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
    </TRPCProvider>
  );
}

export default App;
