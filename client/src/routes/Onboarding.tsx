import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Calendar, Globe, Lock, Award, Sparkles, Shield, CheckCircle, BookOpen, PenLine, UserPlus, MapPin } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { detectTimezone } from '@/lib/time';
import SobrietyCounter from '@/components/SobrietyCounter';
import NotificationPermissionPrimer from '@/components/NotificationPermissionPrimer';
import { getTodayDate } from '@/lib/time';

const TOTAL_STEPS = 7;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [cleanDate, setCleanDate] = useState('');
  const [cleanTime, setCleanTime] = useState('00:00');
  const [timezone] = useState(detectTimezone());
  const [gratitude, setGratitude] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const setProfile = useAppStore((state) => state.setProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const addContact = useAppStore((state) => state.addContact);

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

    // Save emergency contact if entered
    if (emergencyName.trim() && emergencyPhone.trim()) {
      addContact({
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationshipType: 'sponsor',
        isEmergencyContact: true,
      });
    }

    completeOnboarding();
    setLocation('/');
  };

  // Step 1: Welcome & Value Proposition
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl">Recovery Companion</CardTitle>
            <CardDescription className="text-base mt-4">
              Your private, offline-first companion for recovery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Your data never leaves your device</p>
                  <p className="text-muted-foreground">100% private & secure</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No sign-up required</p>
                  <p className="text-muted-foreground">Start using immediately</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Works completely offline</p>
                  <p className="text-muted-foreground">Access anytime, anywhere</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Free & open source</p>
                  <p className="text-muted-foreground">No ads, no subscriptions</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full h-12 mt-6"
              size="lg"
              onClick={() => setStep(2)}
              data-testid="button-get-started"
            >
              Get Started →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Quick Profile
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome! 👋</CardTitle>
            <CardDescription>Let's get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Label htmlFor="clean-date">When did you start your recovery journey?</Label>
              <Input
                id="clean-date"
                type="date"
                value={cleanDate}
                onChange={(e) => setCleanDate(e.target.value)}
                data-testid="input-clean-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clean-time">
                What time? <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="clean-time"
                type="time"
                value={cleanTime}
                onChange={(e) => setCleanTime(e.target.value)}
                data-testid="input-clean-time"
              />
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Progress: {step}/{TOTAL_STEPS}
            </p>

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
                onClick={() => setStep(3)}
                disabled={!name || !cleanDate}
                data-testid="button-continue"
              >
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Show Sobriety Counter (Immediate Value)
  if (step === 3) {
    const cleanDateISO = `${cleanDate}T${cleanTime}:00.000Z`;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">That's...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-8">
              <SobrietyCounter cleanDate={cleanDateISO} timezone={timezone} />
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-medium">...of courage and strength!</p>
              <p className="text-muted-foreground">Every moment counts.</p>
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Progress: {step}/{TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(4)}
              >
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: First Quick Win - Gratitude
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-2xl">Quick Win</CardTitle>
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
                placeholder="My sobriety"
                className="resize-none"
                rows={3}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This builds positive habits and trains your brain to see the good in recovery
              </p>
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Progress: {step}/{TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(5)}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(5)}
                disabled={!gratitude.trim()}
              >
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 5: Emergency Setup
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-2xl">Safety First 🛟</CardTitle>
            </div>
            <CardDescription>
              Add your sponsor or an emergency contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Name</Label>
                <Input
                  id="emergency-name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Sponsor name"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Phone number</Label>
                <Input
                  id="emergency-phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Quick access in crisis mode
              </p>
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Progress: {step}/{TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(6)}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(6)}
                disabled={!emergencyName.trim() || !emergencyPhone.trim()}
              >
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 6: Notification Permission
  if (step === 6) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            <NotificationPermissionPrimer
              onComplete={() => setStep(7)}
            />

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Progress: {step}/{TOTAL_STEPS}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 7: Success & Next Steps
  if (step === 7) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl">You're All Set!</CardTitle>
            <CardDescription className="text-base mt-2">
              Here are some ways to start:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <BookOpen className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Answer your first Step 1 question</p>
                  <p className="text-sm text-muted-foreground">Begin your step work journey</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <PenLine className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Write a journal entry</p>
                  <p className="text-sm text-muted-foreground">Track your thoughts and feelings</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Sparkles className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Add more gratitude items</p>
                  <p className="text-sm text-muted-foreground">Build your daily practice</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <MapPin className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Log a meeting</p>
                  <p className="text-sm text-muted-foreground">Track your fellowship attendance</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
              Or just explore! Everything is saved automatically.
            </div>

            <Progress value={100} className="h-2" />

            <Button
              className="w-full h-12"
              size="lg"
              onClick={handleComplete}
              data-testid="button-finish"
            >
              Go to Home →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
