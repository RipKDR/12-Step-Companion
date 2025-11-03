import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import EmergencyFAB from "@/components/EmergencyFAB";

// Routes
import Home from "@/routes/Home";
import Steps from "@/routes/Steps";
import Journal from "@/routes/Journal";
import Worksheets from "@/routes/Worksheets";
import Emergency from "@/routes/Emergency";
import Settings from "@/routes/Settings";
import Onboarding from "@/routes/Onboarding";

function Router() {
  // TODO: Check if onboarding is complete from store
  const onboardingComplete = true; // Temporarily set to true for demo

  if (!onboardingComplete) {
    return <Route path="/" component={Onboarding} />;
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
