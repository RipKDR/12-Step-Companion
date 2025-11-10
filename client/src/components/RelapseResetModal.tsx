import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { HeartHandshake, RefreshCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRIGGER_OPTIONS = [
  'Stress or overwhelm',
  'Loneliness',
  'Celebration',
  'Conflict',
  'Fatigue',
  'Social pressure',
  'Boredom',
  'Difficult emotions',
];

const IMPLEMENTATION_TEMPLATES = [
  'If I notice cravings building, then I will pause, breathe, and text my sponsor for support.',
  'If I feel isolated, then I will step outside, call a trusted friend, and ask for what I need.',
  'If I am heading into a risky situation, then I will plan an exit, line up support, and practice my grounding tool.',
];

const DEFAULT_SELF_COMPASSION =
  'I am worthy of care even when I stumble. I can learn from this moment and choose the next right action.';

const toDatetimeLocal = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface RelapseResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RelapseResetModal({ open, onOpenChange }: RelapseResetModalProps) {
  const resetPlan = useAppStore((state) => state.resetPlan);
  const logUseEpisode = useAppStore((state) => state.logUseEpisode);
  const completeResetPlan = useAppStore((state) => state.completeResetPlan);

  const [occurredAt, setOccurredAt] = useState<string>(toDatetimeLocal(new Date()));
  const [whatHappened, setWhatHappened] = useState('');
  const [feelings, setFeelings] = useState('');
  const [needMet, setNeedMet] = useState('');
  const [supportAction, setSupportAction] = useState('');
  const [implementationIntention, setImplementationIntention] = useState('');
  const [selfCompassion, setSelfCompassion] = useState(DEFAULT_SELF_COMPASSION);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [markPlanComplete, setMarkPlanComplete] = useState(false);

  const actionPreview = useMemo(() => {
    if (!resetPlan) return null;
    return {
      checkIns: resetPlan.checkInActions.slice(0, 2),
      grounding: resetPlan.groundingActions.slice(0, 2),
      growth: resetPlan.growthCommitments.slice(0, 1),
    };
  }, [resetPlan]);

  const initializeForm = () => {
    const now = new Date();
    setOccurredAt(toDatetimeLocal(now));
    setWhatHappened('');
    setFeelings('');
    setNeedMet('');
    setSupportAction('');
    setTriggers([]);
    setMarkPlanComplete(false);
    setImplementationIntention(
      resetPlan?.implementationIntentionTemplate || IMPLEMENTATION_TEMPLATES[0]
    );
    setSelfCompassion(resetPlan?.selfCompassionReminder || DEFAULT_SELF_COMPASSION);
  };

  useEffect(() => {
    if (open) {
      initializeForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((item) => item !== trigger) : [...prev, trigger]
    );
  };

  const handleTemplateSelect = (template: string) => {
    setImplementationIntention(template);
  };

  const handleSave = () => {
    if (!whatHappened.trim() || !feelings.trim() || !supportAction.trim() || !implementationIntention.trim()) {
      return;
    }

    const episode = logUseEpisode({
      occurredAtISO: occurredAt ? new Date(occurredAt).toISOString() : undefined,
      triggers,
      whatHappened: whatHappened.trim(),
      feelingsExperienced: feelings.trim(),
      needItTriedToMeet: needMet.trim(),
      supportAction: supportAction.trim(),
      implementationIntention: implementationIntention.trim(),
      selfCompassionStatement: (selfCompassion || DEFAULT_SELF_COMPASSION).trim(),
    });

    if (markPlanComplete) {
      completeResetPlan(episode.id);
    }

    onOpenChange(false);
  };

  const isValid =
    whatHappened.trim().length > 0 &&
    feelings.trim().length > 0 &&
    supportAction.trim().length > 0 &&
    implementationIntention.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log a Slip &amp; Reset Compassionately</DialogTitle>
          <DialogDescription>
            Capture what happened, recommit to your plan, and treat yourself with compassion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          <div className="grid gap-2">
            <Label htmlFor="slip-occurred">When did the slip happen?</Label>
            <Input
              id="slip-occurred"
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              max={toDatetimeLocal(new Date())}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slip-what">What was happening right before or during the slip?</Label>
            <Textarea
              id="slip-what"
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
              placeholder="Give yourself grace as you describe the situation."
              className="min-h-[110px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slip-feelings">What feelings did you notice in your body or heart?</Label>
            <Textarea
              id="slip-feelings"
              value={feelings}
              onChange={(event) => setFeelings(event.target.value)}
              placeholder="Name the emotions or sensations that showed up."
              className="min-h-[96px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slip-need">What need were you trying to meet?</Label>
            <Textarea
              id="slip-need"
              value={needMet}
              onChange={(event) => setNeedMet(event.target.value)}
              placeholder="Comfort, connection, relief, rest… identify the need beneath the urge."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>What factors played a role?</Label>
            <div className="flex flex-wrap gap-2">
              {TRIGGER_OPTIONS.map((trigger) => {
                const isActive = triggers.includes(trigger);
                return (
                  <Button
                    key={trigger}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTrigger(trigger)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {trigger}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slip-support">What support step will you take next?</Label>
            <Textarea
              id="slip-support"
              value={supportAction}
              onChange={(event) => setSupportAction(event.target.value)}
              placeholder="Example: Text my sponsor now and add a meeting to my calendar."
              className="min-h-[90px]"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label>Implementation intention for the next 24 hours</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a template or write your own “If this happens, then I will…” statement.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {IMPLEMENTATION_TEMPLATES.map((template) => (
                <Button
                  key={template}
                  type="button"
                  variant={implementationIntention === template ? 'default' : 'outline'}
                  className="flex-1 text-left text-xs leading-relaxed"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
            <Textarea
              value={implementationIntention}
              onChange={(event) => setImplementationIntention(event.target.value)}
              className="min-h-[90px]"
            />
          </div>

          <Alert>
            <div className="flex items-start gap-3">
              <HeartHandshake className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <AlertTitle>Be gentle with yourself</AlertTitle>
                <AlertDescription>
                  {resetPlan?.selfCompassionReminder || DEFAULT_SELF_COMPASSION}
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="grid gap-2">
            <Label htmlFor="slip-compassion">Write a self-compassion statement (optional)</Label>
            <Textarea
              id="slip-compassion"
              value={selfCompassion}
              onChange={(event) => setSelfCompassion(event.target.value)}
              placeholder="Speak to yourself like you would a friend who slipped."
              className="min-h-[80px]"
            />
          </div>

          {actionPreview && (
            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <RefreshCcw className="h-4 w-4" />
                Reset plan checkpoints
              </div>
              <div className="grid gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground text-sm">Check-ins</p>
                  <ul className="list-disc list-inside">
                    {actionPreview.checkIns.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Grounding</p>
                  <ul className="list-disc list-inside">
                    {actionPreview.grounding.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Growth focus</p>
                  <ul className="list-disc list-inside">
                    {actionPreview.growth.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-3 rounded-lg bg-muted/60 px-3 py-3">
            <div>
              <p className="text-sm font-medium">Mark reset plan as completed</p>
              <p className="text-xs text-muted-foreground">
                Toggle this on if you have already taken the compassionate reset steps listed above.
              </p>
            </div>
            <Switch checked={markPlanComplete} onCheckedChange={setMarkPlanComplete} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            <Sparkles className="mr-2 h-4 w-4" />
            Log Slip &amp; Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
