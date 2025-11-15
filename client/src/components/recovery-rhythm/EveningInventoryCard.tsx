import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { haptics } from '@/lib/haptics';
import type { DailyCard } from '@/types';

interface EveningInventoryCardProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (
    stayedClean: DailyCard['eveningStayedClean'],
    stayedConnected: DailyCard['eveningStayedConnected'],
    gratitude?: string,
    improvement?: string
  ) => void;
}

export default function EveningInventoryCard({
  date,
  dailyCard,
  onComplete,
}: EveningInventoryCardProps) {
  const [, setLocation] = useLocation();
  const [stayedClean, setStayedClean] = useState<DailyCard['eveningStayedClean']>(
    dailyCard?.eveningStayedClean
  );
  const [stayedConnected, setStayedConnected] = useState<
    DailyCard['eveningStayedConnected']
  >(
    dailyCard?.eveningStayedConnected ?? {
      meetings: false,
      sponsor: false,
      recoveryFriends: false,
    }
  );
  const [gratitude, setGratitude] = useState(dailyCard?.eveningGratitude || '');
  const [improvement, setImprovement] = useState(dailyCard?.eveningImprovement || '');
  const [isOpen, setIsOpen] = useState(!dailyCard?.eveningCompleted || !dailyCard?.eveningStayedClean);

  const isCompleted = dailyCard?.eveningCompleted && dailyCard?.eveningStayedClean;

  const toggleConnection = (key: keyof NonNullable<DailyCard['eveningStayedConnected']>) => {
    haptics.light();
    setStayedConnected((prev) => ({
      ...prev!,
      [key]: !prev?.[key],
    }));
  };

  const handleComplete = () => {
    if (!stayedClean) return;

    haptics.success();
    onComplete(
      stayedClean,
      stayedConnected,
      gratitude.trim() || undefined,
      improvement.trim() || undefined
    );
    setIsOpen(false);
  };

  const canComplete = stayedClean !== undefined;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full transition-all duration-200" data-testid="evening-inventory-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`p-3 rounded-lg ${
                isCompleted
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              } transition-colors`}
            >
              <Moon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <CardTitle className="text-lg">Tiny Inventory</CardTitle>
              {isCompleted && !isOpen && (
                <p className="text-sm text-muted-foreground truncate">
                  {stayedClean === 'yes' ? 'Stayed clean ✓' : stayedClean === 'no' ? 'Did not stay clean' : 'Close call'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="h-8">
                <Check className="h-3 w-3 mr-1" />
                Done
              </Badge>
            )}
            <CollapsibleTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Did I stay clean today?</Label>
              <RadioGroup
                value={stayedClean}
                onValueChange={(value) => {
                  haptics.light();
                  setStayedClean(value as DailyCard['eveningStayedClean']);
                }}
                className="space-y-3"
                data-testid="stayed-clean-radio"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="clean-yes" />
                  <Label htmlFor="clean-yes" className="text-base cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="clean-no" />
                  <Label htmlFor="clean-no" className="text-base cursor-pointer">
                    No
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="close-call" id="clean-close" />
                  <Label htmlFor="clean-close" className="text-base cursor-pointer">
                    Close call
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Did I stay connected?</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="connected-meetings" className="text-base cursor-pointer">
                    Meetings
                  </Label>
                  <Switch
                    id="connected-meetings"
                    checked={stayedConnected?.meetings ?? false}
                    onCheckedChange={() => toggleConnection('meetings')}
                    data-testid="connected-meetings"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="connected-sponsor" className="text-base cursor-pointer">
                    Sponsor
                  </Label>
                  <Switch
                    id="connected-sponsor"
                    checked={stayedConnected?.sponsor ?? false}
                    onCheckedChange={() => toggleConnection('sponsor')}
                    data-testid="connected-sponsor"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="connected-friends" className="text-base cursor-pointer">
                    Recovery Friends
                  </Label>
                  <Switch
                    id="connected-friends"
                    checked={stayedConnected?.recoveryFriends ?? false}
                    onCheckedChange={() => toggleConnection('recoveryFriends')}
                    data-testid="connected-friends"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evening-gratitude" className="text-base font-semibold">
                One thing I'm grateful for (optional)
              </Label>
              <Textarea
                id="evening-gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Something I'm grateful for today..."
                className="min-h-20 resize-none"
                data-testid="evening-gratitude-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evening-improvement" className="text-base font-semibold">
                One thing I'd like to do differently tomorrow (optional)
              </Label>
              <Textarea
                id="evening-improvement"
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder="Something I'd like to improve..."
                className="min-h-20 resize-none"
                data-testid="evening-improvement-input"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                const reflectionContext = `Can you help me reflect on today? I ${stayedClean === 'yes' ? 'stayed clean' : stayedClean === 'no' ? 'did not stay clean' : 'had a close call'} today. ${stayedConnected?.meetings ? 'I went to a meeting. ' : ''}${stayedConnected?.sponsor ? 'I connected with my sponsor. ' : ''}${stayedConnected?.recoveryFriends ? 'I connected with recovery friends. ' : ''}${gratitude ? `I'm grateful for: ${gratitude}. ` : ''}${improvement ? `I'd like to improve: ${improvement}. ` : ''}Can you help me process today and prepare for tomorrow?`;
                sessionStorage.setItem('copilot_initial_message', reflectionContext);
                setLocation('/ai-sponsor');
              }}
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Reflect on Today
            </Button>

            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="w-full h-12"
              data-testid="complete-evening-inventory"
              aria-label="Complete evening inventory"
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Inventory
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

