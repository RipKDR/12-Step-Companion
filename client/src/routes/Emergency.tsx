import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Heart, FileText } from 'lucide-react';
import { useState } from 'react';

export default function Emergency() {
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const startTimer = () => {
    setTimerActive(true);
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // TODO: Make these configurable in settings
  const emergencyActions = [
    {
      id: 'call-sponsor',
      label: 'Call My Sponsor',
      icon: <Phone className="h-8 w-8" />,
      type: 'call',
      data: 'tel:+61400000000',
    },
    {
      id: 'breathing',
      label: 'Breathing Exercise',
      icon: <Heart className="h-8 w-8" />,
      type: 'exercise',
      data: 'breathing',
    },
    {
      id: 'timer',
      label: '5 Minute Timer',
      icon: <Clock className="h-8 w-8" />,
      type: 'timer',
      data: '300',
    },
    {
      id: 'coping-notes',
      label: 'Coping Notes',
      icon: <FileText className="h-8 w-8" />,
      type: 'notes',
      data: 'View your coping strategies',
    },
  ];

  const handleAction = (action: typeof emergencyActions[0]) => {
    switch (action.type) {
      case 'call':
        window.location.href = action.data;
        break;
      case 'timer':
        startTimer();
        break;
      case 'exercise':
        console.log('Start grounding exercise:', action.data);
        break;
      case 'notes':
        console.log('Show coping notes');
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Emergency Help</h1>
        <p className="text-muted-foreground">
          You're not alone. Choose an action below.
        </p>
      </header>

      {timerActive && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-center">Breathe and wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-center text-primary mb-4">
              {formatTime(timeLeft)}
            </div>
            <p className="text-center text-muted-foreground">
              This feeling will pass. You're doing great.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {emergencyActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="h-24 flex-col gap-2 text-base"
            onClick={() => handleAction(action)}
            data-testid={`emergency-${action.id}`}
          >
            <div className="text-primary">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h2 className="font-semibold mb-2">National Crisis Lines</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Lifeline Australia</span>
              <a
                href="tel:131114"
                className="text-primary font-semibold hover:underline"
                data-testid="link-lifeline"
              >
                13 11 14
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span>Alcohol & Drug Support</span>
              <a
                href="tel:1800250015"
                className="text-primary font-semibold hover:underline"
                data-testid="link-drug-support"
              >
                1800 250 015
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
