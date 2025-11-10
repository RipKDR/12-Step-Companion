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
      // Importing custom hooks
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Importing performance monitoring utility
import { initPerformanceMonitoring } from "@/lib/performance";

// Importing routes
import Home from "@/routes/Home";
import Steps from "@/routes/Steps";
import Journal from "@/routes/Journal";
import More from "@/routes/More";
import Worksheets from "@/routes/Worksheets";
import Meetings from "@/routes/Meetings";
import Emergency from "@/routes/Emergency";
import Resources from "@/routes/Resources";
import Settings from "@/routes/Settings";
import Onboarding from "@/routes/Onboarding";
import Analytics from "@/routes/Analytics";
import Contacts from "@/routes/Contacts";
import Achievements from "@/routes/Achievements";
import UsageInsights from "@/routes/UsageInsights";
import Landing from "@/routes/Landing";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  if (!onboardingComplete) {
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/" component={Onboarding} />
        <Route component={Onboarding} />
      </Switch>
    );
  }

  return (
    <>
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
        <Route path="/settings" component={Settings} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const featureFlags = useAppStore((state) => state.settings.featureFlags);

  // Initialize keyboard shortcuts if enabled
  useKeyboardShortcuts({ enabled: featureFlags?.keyboardShortcuts ?? true });

  // Initialize performance monitoring if enabled
  useEffect(() => {
    if (featureFlags?.performanceMonitoring ?? true) {
      initPerformanceMonitoring();
    }
  }, [featureFlags?.performanceMonitoring]);

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
        <Toaster />
        <Router />
        {updateAvailable && (
          <UpdateNotification onUpdate={handleUpdate} onDismiss={handleDismiss} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
