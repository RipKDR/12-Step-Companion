// Landing page - standalone mode (no auth required)
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BookOpen, FileText, Phone } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function Landing() {
  const [, setLocation] = useLocation();
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  const handleGetStarted = () => {
    // Navigate directly to onboarding or home based on completion status
    if (onboardingComplete) {
      setLocation("/");
    } else {
      setLocation("/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Wellness Journey</h1>
          <p className="text-lg text-muted-foreground">
            Track your progress, journal your thoughts, and access support when you need it most.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Step-by-Step Progress
              </CardTitle>
              <CardDescription>
                Follow guided steps to build healthy habits and track your journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Personal Journal
              </CardTitle>
              <CardDescription>
                Record your thoughts, feelings, and daily reflections
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interactive Worksheets
              </CardTitle>
              <CardDescription>
                Work through exercises designed to support your wellbeing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Support
              </CardTitle>
              <CardDescription>
                Quick access to crisis resources and hotlines when you need them
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            data-testid="button-login"
          >
            Get Started
          </Button>
          <p className="text-sm text-muted-foreground">
            Start your wellness journey
          </p>
        </div>
      </div>
    </div>
  );
}
