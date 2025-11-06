import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Globe, Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { detectTimezone } from '@/lib/time';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [cleanDate, setCleanDate] = useState('');
  const [cleanTime, setCleanTime] = useState('00:00');
  const [timezone, setTimezone] = useState(detectTimezone());

  const setProfile = useAppStore((state) => state.setProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const handleComplete = () => {
    const profile = {
      id: `user_${Date.now()}`,
      name,
      cleanDate: `${cleanDate}T${cleanTime}:00.000Z`,
      timezone,
      hasPasscode: false,
    };
    
    setProfile(profile);
    completeOnboarding();
    setLocation('/');
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Recovery Companion</CardTitle>
            <CardDescription className="text-base mt-2">
              Your private, offline-first tool for tracking clean time, completing step work, and staying connected to your recovery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">100% Private</p>
                  <p className="text-muted-foreground">All data stays on your device</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Works Offline</p>
                  <p className="text-muted-foreground">Access anytime, anywhere</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-muted-foreground">Watch your clean time grow</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full h-12"
              onClick={() => setStep(2)}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
            <CardDescription>This information stays private on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Preferred Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clean-date">Clean Date</Label>
              <Input
                id="clean-date"
                type="date"
                value={cleanDate}
                onChange={(e) => setCleanDate(e.target.value)}
                data-testid="input-clean-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clean-time">Clean Time</Label>
              <Input
                id="clean-time"
                type="time"
                value={cleanTime}
                onChange={(e) => setCleanTime(e.target.value)}
                data-testid="input-clean-time"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                data-testid="input-timezone"
              />
              <p className="text-xs text-muted-foreground">
                Auto-detected: {detectTimezone()}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={!name || !cleanDate}
                data-testid="button-continue"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
