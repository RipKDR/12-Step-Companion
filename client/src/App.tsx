import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import EmergencyFAB from "@/components/EmergencyFAB";
import { useAppStore } from "@/store/useAppStore";

// Routes
import Home from "@/routes/Home";
import Steps from "@/routes/Steps";
import Journal from "@/routes/Journal";
import Worksheets from "@/routes/Worksheets";
import Emergency from "@/routes/Emergency";
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
        <Route path="/emergency" component={Emergency} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
