import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import EmergencyFAB from "@/components/EmergencyFAB";
import UpdateNotification from "@/components/UpdateNotification";
import { useAppStore } from "@/store/useAppStore";
import { registerServiceWorker, skipWaiting } from "@/lib/pwa";

// Routes
import Home from "@/routes/Home";
import Steps from "@/routes/Steps";
import Journal from "@/routes/Journal";
import Worksheets from "@/routes/Worksheets";
import Meetings from "@/routes/Meetings";
import Emergency from "@/routes/Emergency";
import Resources from "@/routes/Resources";
import Settings from "@/routes/Settings";
import Onboarding from "@/routes/Onboarding";

function Router() {
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

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
        <Route path="/worksheets" component={Worksheets} />
        <Route path="/meetings" component={Meetings} />
        <Route path="/emergency" component={Emergency} />
        <Route path="/resources" component={Resources} />
        <Route path="/settings" component={Settings} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
      <EmergencyFAB />
    </>
  );
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

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
