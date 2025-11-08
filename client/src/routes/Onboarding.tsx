import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Lock, Globe, Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { detectTimezone } from '@/lib/time';
import { getTodayDate } from '@/lib/time';

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [cleanDate, setCleanDate] = useState('');
  const [cleanTime, setCleanTime] = useState('00:00');
  const [timezone] = useState(detectTimezone());
  const [gratitude, setGratitude] = useState('');

  const setProfile = useAppStore((state) => state.setProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);

  const progress = useMemo(() => ((step - 1) / (TOTAL_STEPS - 1)) * 100, [step]);

  const handleComplete = () => {
    // Save profile
    const profile = {
      id: `user_${Date.now()}`,
      name,
      cleanDate: `${cleanDate}T${cleanTime}:00.000Z`,
      timezone,
      hasPasscode: false,
    };
    setProfile(profile);

    // Save gratitude if entered
    if (gratitude.trim()) {
      const today = getTodayDate(timezone);
      updateDailyCard(today, {
        gratitudeItems: [gratitude.trim()],
      });
    }

    completeOnboarding();
    setLocation('/');
  };

  // Step 1: Welcome & Essential Setup
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Recovery Companion</CardTitle>
            <CardDescription className="text-base mt-3">
              Your private, offline-first companion for recovery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">100% Private</p>
                  <p className="text-muted-foreground">Your data never leaves your device</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">No sign-up</p>
                  <p className="text-muted-foreground">Start using immediately</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Works offline</p>
                  <p className="text-muted-foreground">Access anytime, anywhere</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name or nickname"
                  autoFocus
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clean-date">When did you start your recovery?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="clean-date"
                    type="date"
                    value={cleanDate}
                    onChange={(e) => setCleanDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    data-testid="input-clean-date"
                  />
                  <Input
                    id="clean-time"
                    type="time"
                    value={cleanTime}
                    onChange={(e) => setCleanTime(e.target.value)}
                    data-testid="input-clean-time"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-11 mt-6"
              onClick={() => setStep(2)}
              disabled={!name.trim() || !cleanDate}
              data-testid="button-continue-step-1"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Quick Win - Gratitude
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Quick Win</CardTitle>
            </div>
            <CardDescription>
              Name one thing you're grateful for right now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="My sobriety, my family, this moment..."
                className="resize-none min-h-[100px]"
                autoFocus
                data-testid="input-gratitude"
              />
              <p className="text-xs text-muted-foreground">
                Gratitude builds positive habits and helps you see the good in recovery
              </p>
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1"
                data-testid="button-continue-step-2"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: You're Ready!
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">You're All Set!</CardTitle>
            <CardDescription className="text-base mt-3">
              Here's what you can do:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Track your clean time</p>
                  <p className="text-muted-foreground">See your progress every day</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Journal your thoughts</p>
                  <p className="text-muted-foreground">Record your recovery journey</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Work the steps</p>
                  <p className="text-muted-foreground">Guided recovery program</p>
                </div>
              </div>
            </div>

            <Progress value={100} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Complete!
            </p>

            <Button
              className="w-full h-11 mt-6"
              onClick={handleComplete}
              data-testid="button-finish-onboarding"
            >
              Start My Recovery Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
