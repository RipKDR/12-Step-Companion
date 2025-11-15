import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { haptics } from '@/lib/haptics';
import type { DailyCard } from '@/types';

interface MorningIntentionCardProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (intention: DailyCard['morningIntention'], custom?: string, reminder?: string) => void;
}

const INTENTION_OPTIONS = [
  { value: 'stay-clean' as const, label: 'Stay Clean', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  { value: 'stay-connected' as const, label: 'Stay Connected', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  { value: 'be-gentle' as const, label: 'Be Gentle with Myself', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
];

export default function MorningIntentionCard({
  date,
  dailyCard,
  onComplete,
}: MorningIntentionCardProps) {
  const [selectedIntention, setSelectedIntention] = useState<DailyCard['morningIntention']>(
    dailyCard?.morningIntention
  );
  const [showCustom, setShowCustom] = useState(false);
  const [customIntention, setCustomIntention] = useState(dailyCard?.morningIntentionCustom || '');
  const [showReminder, setShowReminder] = useState(false);
  const [reminder, setReminder] = useState(dailyCard?.morningReminder || '');
  const [isOpen, setIsOpen] = useState(!dailyCard?.morningCompleted || !dailyCard?.morningIntention);

  const isCompleted = dailyCard?.morningCompleted && dailyCard?.morningIntention;

  const handleIntentionSelect = (intention: DailyCard['morningIntention']) => {
    haptics.light();
    setSelectedIntention(intention);
    setShowCustom(intention === 'custom');
  };

  const handleComplete = () => {
    if (!selectedIntention) return;
    
    haptics.success();
    onComplete(
      selectedIntention,
      selectedIntention === 'custom' ? customIntention : undefined,
      showReminder && reminder ? reminder : undefined
    );
    setIsOpen(false);
  };

  const canComplete = selectedIntention && (selectedIntention !== 'custom' || customIntention.trim());

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full transition-all duration-200" data-testid="morning-intention-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`p-3 rounded-lg ${
                isCompleted
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              } transition-colors`}
            >
              <Sunrise className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <CardTitle className="text-lg">Set the Tone</CardTitle>
              {isCompleted && !isOpen && (
                <p className="text-sm text-muted-foreground truncate">
                  {selectedIntention === 'custom'
                    ? customIntention
                    : INTENTION_OPTIONS.find((opt) => opt.value === selectedIntention)?.label}
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
          <CardContent className="space-y-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Pick one intention for today (or create your own)
              </p>
              <div className="grid grid-cols-1 gap-3">
                {INTENTION_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedIntention === option.value ? 'default' : 'outline'}
                    className={`h-14 text-base justify-start ${
                      selectedIntention === option.value ? option.color : ''
                    }`}
                    onClick={() => handleIntentionSelect(option.value)}
                    aria-label={`Select intention: ${option.label}`}
                    data-testid={`intention-${option.value}`}
                  >
                    {option.label}
                  </Button>
                ))}
                <Button
                  variant={selectedIntention === 'custom' ? 'default' : 'outline'}
                  className="h-14 text-base justify-start"
                  onClick={() => handleIntentionSelect('custom')}
                  aria-label="Select custom intention"
                  data-testid="intention-custom"
                >
                  Custom
                </Button>
              </div>
            </div>

            {showCustom && (
              <div className="space-y-2">
                <label htmlFor="custom-intention" className="text-sm font-medium">
                  Your custom intention
                </label>
                <Textarea
                  id="custom-intention"
                  value={customIntention}
                  onChange={(e) => setCustomIntention(e.target.value)}
                  placeholder="What's your intention for today?"
                  className="min-h-20 resize-none"
                  data-testid="custom-intention-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReminder(!showReminder)}
                className="w-full"
                aria-expanded={showReminder}
              >
                {showReminder ? 'Hide' : 'Add'} reminder
              </Button>
              {showReminder && (
                <div className="space-y-2">
                  <label htmlFor="reminder" className="text-sm font-medium">
                    If today gets hard, remember...
                  </label>
                  <Textarea
                    id="reminder"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    placeholder="One thing to remember if things get difficult..."
                    className="min-h-20 resize-none"
                    data-testid="reminder-input"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="w-full h-12"
              data-testid="complete-morning-intention"
              aria-label="Complete morning intention"
            >
              <Check className="h-4 w-4 mr-2" />
              Set Intention
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

