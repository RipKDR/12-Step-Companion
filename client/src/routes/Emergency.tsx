import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, Clock, Heart, FileText, AlertCircle, Loader2, MessageCircle, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Emergency() {
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [groundingActive, setGroundingActive] = useState(false);
  const [copingNotesVisible, setCopingNotesVisible] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (!breathingActive) return;

    const phases = [
      { phase: 'inhale' as const, duration: 4 },
      { phase: 'hold' as const, duration: 4 },
      { phase: 'exhale' as const, duration: 6 },
    ];
    
    let currentPhaseIndex = 0;
    let countdown = phases[0].duration;
    setBreathingPhase(phases[0].phase);
    setBreathingCount(countdown);

    const interval = setInterval(() => {
      countdown--;
      setBreathingCount(countdown);

      if (countdown === 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        countdown = phases[currentPhaseIndex].duration;
        setBreathingPhase(phases[currentPhaseIndex].phase);
        setBreathingCount(countdown);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimeLeft(300);
  };

  const crisisLines = [
    {
      name: 'Lifeline Australia',
      number: '13 11 14',
      tel: '131114',
      description: '24/7 crisis support and suicide prevention',
      testId: 'link-lifeline'
    },
    {
      name: 'Alcohol & Drug Info Service',
      number: '1800 250 015',
      tel: '1800250015',
      description: '24/7 information and support',
      testId: 'link-drug-support'
    },
    {
      name: 'Beyond Blue',
      number: '1300 22 4636',
      tel: '1300224636',
      description: 'Depression, anxiety and mental health support',
      testId: 'link-beyond-blue'
    },
    {
      name: 'Suicide Call Back Service',
      number: '1300 659 467',
      tel: '1300659467',
      description: '24/7 suicide prevention counselling',
      testId: 'link-suicide-callback'
    }
  ];

  const groundingTechniques = [
    {
      title: '5-4-3-2-1 Grounding',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      title: 'Physical Grounding',
      steps: [
        'Place your feet flat on the floor',
        'Press your hands together',
        'Grip the arms of your chair',
        'Touch something cold or textured',
        'Splash cold water on your face'
      ]
    },
    {
      title: 'Mental Grounding',
      steps: [
        'Count backwards from 100 by 7s',
        'Name all the colors you can see',
        'List items in a category (cities, animals, etc.)',
        'Recite a poem, prayer, or song lyrics',
        'Say today\'s date, time, and your location'
      ]
    }
  ];

  const copingStrategies = [
    'Call your sponsor or support person',
    'Go to a meeting (in person or online)',
    'Read recovery literature',
    'Practice the Serenity Prayer',
    'Call a fellowship helpline',
    'Text a recovery friend',
    'Go for a walk',
    'Listen to recovery podcasts',
    'Write in your journal',
    'This too shall pass - ride the wave'
  ];

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe in slowly through your nose';
      case 'hold':
        return 'Hold your breath gently';
      case 'exhale':
        return 'Breathe out slowly through your mouth';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'text-blue-500';
      case 'hold':
        return 'text-amber-500';
      case 'exhale':
        return 'text-green-500';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header className="text-center mb-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2" data-testid="text-emergency-title">Emergency Help</h1>
        <p className="text-muted-foreground">
          You're not alone. Help is available right now.
        </p>
      </header>

      <Card className="bg-destructive/5 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Phone className="h-5 w-5" />
            Crisis Lines - Available 24/7
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {crisisLines.map((line) => (
            <div key={line.tel} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-semibold">{line.name}</div>
                <div className="text-sm text-muted-foreground">{line.description}</div>
              </div>
              <a
                href={`tel:${line.tel}`}
                className="text-primary font-bold hover:underline text-lg whitespace-nowrap"
                data-testid={line.testId}
              >
                {line.number}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant={timerActive ? "default" : "outline"}
          className="h-24 flex-col gap-2"
          onClick={() => timerActive ? stopTimer() : setTimerActive(true)}
          data-testid="button-timer"
        >
          {timerActive ? <Loader2 className="h-8 w-8 animate-spin" /> : <Clock className="h-8 w-8" />}
          <span className="font-medium">{timerActive ? 'Stop Timer' : '5 Minute Timer'}</span>
        </Button>

        <Button
          variant={breathingActive ? "default" : "outline"}
          className="h-24 flex-col gap-2"
          onClick={() => setBreathingActive(!breathingActive)}
          data-testid="button-breathing"
        >
          <Heart className="h-8 w-8" />
          <span className="font-medium">{breathingActive ? 'Stop Breathing' : 'Breathing Exercise'}</span>
        </Button>

        <Button
          variant={groundingActive ? "default" : "outline"}
          className="h-24 flex-col gap-2"
          onClick={() => setGroundingActive(!groundingActive)}
          data-testid="button-grounding"
        >
          <Users className="h-8 w-8" />
          <span className="font-medium">Grounding Techniques</span>
        </Button>

        <Button
          variant={copingNotesVisible ? "default" : "outline"}
          className="h-24 flex-col gap-2"
          onClick={() => setCopingNotesVisible(!copingNotesVisible)}
          data-testid="button-coping"
        >
          <FileText className="h-8 w-8" />
          <span className="font-medium">Coping Strategies</span>
        </Button>
      </div>

      {timerActive && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-center">Just Wait - This Will Pass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-7xl font-bold text-center text-primary mb-4" data-testid="text-timer">
              {formatTime(timeLeft)}
            </div>
            <p className="text-center text-muted-foreground mb-4">
              You're doing great. Ride this wave. It will pass.
            </p>
            <div className="text-center text-sm text-muted-foreground">
              Use this time to breathe, pray, or just be still.
            </div>
          </CardContent>
        </Card>
      )}

      {breathingActive && (
        <Card className={`border-primary transition-colors duration-1000`}>
          <CardHeader>
            <CardTitle className="text-center">Box Breathing Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`text-8xl font-bold text-center transition-colors duration-500 ${getBreathingColor()}`} data-testid="text-breathing-count">
              {breathingCount}
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-semibold" data-testid="text-breathing-phase">
                {breathingPhase.toUpperCase()}
              </div>
              <div className="text-muted-foreground">
                {getBreathingInstruction()}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant={breathingPhase === 'inhale' ? 'default' : 'outline'}>Inhale 4s</Badge>
              <Badge variant={breathingPhase === 'hold' ? 'default' : 'outline'}>Hold 4s</Badge>
              <Badge variant={breathingPhase === 'exhale' ? 'default' : 'outline'}>Exhale 6s</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {groundingActive && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Grounding Techniques</h2>
          <p className="text-muted-foreground text-sm">
            These exercises help you reconnect with the present moment and calm your nervous system.
          </p>
          {groundingTechniques.map((technique, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{technique.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {technique.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex gap-3">
                      <span className="font-semibold text-primary">{stepIdx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {copingNotesVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Coping Strategies for Cravings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Remember these strategies when you're struggling:
            </p>
            <ul className="space-y-2">
              {copingStrategies.map((strategy, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="text-center text-sm text-muted-foreground italic">
              "This too shall pass. Just for today, I don't have to use."
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Remember
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Cravings are temporary - they will pass</p>
            <p>• You have the tools to get through this</p>
            <p>• Reaching out is a sign of strength, not weakness</p>
            <p>• One day at a time - you've got this</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
