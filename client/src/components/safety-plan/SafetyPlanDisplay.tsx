import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, MessageSquare, X, Heart, Shield, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { SafetyPlanUsage } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SafetyPlanDisplayProps {
  onClose?: () => void;
}

export default function SafetyPlanDisplay({ onClose }: SafetyPlanDisplayProps) {
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [outcome, setOutcome] = useState<SafetyPlanUsage['outcome']>();
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const { toast } = useToast();

  const safetyPlan = useAppStore((state) => state.getSafetyPlan());
  const activateSafetyPlan = useAppStore((state) => state.activateSafetyPlan);
  const completeSafetyPlanAction = useAppStore((state) => state.completeSafetyPlanAction);
  const contactSafetyPlanPerson = useAppStore((state) => state.contactSafetyPlanPerson);
  const recordSafetyPlanOutcome = useAppStore((state) => state.recordSafetyPlanOutcome);

  const [currentUsageId, setCurrentUsageId] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // Activate plan on mount if not already activated (only once)
  useEffect(() => {
    if (safetyPlan && !currentUsageId) {
      try {
        const usageId = activateSafetyPlan('manual');
        setCurrentUsageId(usageId);
      } catch (error) {
        console.error('Failed to activate safety plan:', error);
      }
    }
  }, [safetyPlan, currentUsageId, activateSafetyPlan]);

  if (!safetyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No safety plan found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    if (currentUsageId) {
      // Track that a contact was used (we'll use the phone as identifier)
      const contact = safetyPlan.contacts.find((c) => c.phone === phone);
      if (contact) {
        contactSafetyPlanPerson(contact.id);
      }
    }
  };

  const handleText = (phone: string) => {
    window.location.href = `sms:${phone}`;
    if (currentUsageId) {
      const contact = safetyPlan.contacts.find((c) => c.phone === phone);
      if (contact) {
        contactSafetyPlanPerson(contact.id);
      }
    }
  };

  const handleActionComplete = (actionId: string) => {
    if (currentUsageId) {
      completeSafetyPlanAction(actionId);
      setCompletedActions(new Set([...completedActions, actionId]));
    }
  };

  const handleClose = () => {
    if (currentUsageId && !completedActions.size) {
      // Show reminder if no actions completed
      toast({
        title: 'Safety Plan Available',
        description: 'Your safety plan is always available. Consider completing an action before closing.',
        variant: 'default',
      });
    }
    setShowOutcomeDialog(true);
  };

  const handleOutcomeSubmit = () => {
    if (currentUsageId && outcome) {
      recordSafetyPlanOutcome(currentUsageId, outcome, outcomeNotes);
      toast({
        title: 'Thank you',
        description: 'Your feedback helps improve your safety plan.',
      });
    }
    setShowOutcomeDialog(false);
    onClose?.();
  };

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Personal Message - Prominent */}
          <Card className="border-primary/50 bg-primary/5" role="region" aria-labelledby="sober-message-heading">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-primary shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-1">
                  <h2 id="sober-message-heading" className="text-lg font-semibold mb-2">Message from Sober You</h2>
                  <p className="text-base leading-relaxed whitespace-pre-wrap" role="article">
                    {safetyPlan.messageFromSoberMe}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasons Not to Use */}
          {safetyPlan.reasonsNotToUse.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reasons Not to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safetyPlan.reasonsNotToUse.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-base">{reason}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* People to Contact */}
          <Card role="region" aria-labelledby="contacts-heading">
            <CardHeader>
              <CardTitle id="contacts-heading" className="text-lg">People to Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {safetyPlan.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-base">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {contact.relationship.replace('-', ' ')}
                    </p>
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground mt-1">{contact.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {contact.phone && (
                      <>
                        <Button
                          size="lg"
                          onClick={() => handleCall(contact.phone!)}
                          className="min-h-[44px] min-w-[44px] p-0"
                          aria-label={`Call ${contact.name} at ${contact.phone}`}
                          title={`Call ${contact.name}`}
                        >
                          <Phone className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleText(contact.phone!)}
                          className="min-h-[44px] min-w-[44px] p-0"
                          aria-label={`Text ${contact.name} at ${contact.phone}`}
                          title={`Text ${contact.name}`}
                        >
                          <MessageSquare className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions Before Using */}
          {safetyPlan.actionsBeforeUsing.length > 0 && (
            <Card role="region" aria-labelledby="actions-heading">
              <CardHeader>
                <CardTitle id="actions-heading" className="text-lg">Actions Before Using</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safetyPlan.actionsBeforeUsing.map((action) => {
                  const isCompleted = completedActions.has(action.id);
                  return (
                    <div
                      key={action.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        isCompleted ? 'bg-primary/10 border-primary/50' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{action.label}</h3>
                          <p className="text-sm text-muted-foreground capitalize mt-1">
                            {action.type.replace('-', ' ')}
                          </p>
                        </div>
                        {!isCompleted && (
                          <Button
                            size="lg"
                            onClick={() => handleActionComplete(action.id)}
                            className="min-h-[44px]"
                            aria-label={`Mark ${action.label} as complete`}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {isCompleted && (
                          <div className="flex items-center gap-2 text-primary" role="status" aria-label={`${action.label} completed`}>
                            <CheckCircle className="h-5 w-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Crisis Resources */}
          {safetyPlan.crisisResources.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Crisis Resources</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {safetyPlan.crisisResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 border rounded-lg bg-card"
                  >
                    <h3 className="font-medium text-base">{resource.name}</h3>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                    )}
                    <div className="flex gap-4 mt-3">
                      {resource.phone && (
                        <Button
                          size="lg"
                          onClick={() => handleCall(resource.phone!)}
                          className="min-h-[44px]"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call {resource.phone}
                        </Button>
                      )}
                      {resource.text && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleText(resource.text!)}
                          className="min-h-[44px]"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Text {resource.text}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="min-h-[44px] px-8"
            >
              Close Safety Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Outcome Dialog */}
      <Dialog open={showOutcomeDialog} onOpenChange={setShowOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Did this help?</DialogTitle>
            <DialogDescription>
              Your feedback helps improve your safety plan for next time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={outcome} onValueChange={(value) => setOutcome(value as SafetyPlanUsage['outcome'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helped">It helped</SelectItem>
                  <SelectItem value="partial">It helped somewhat</SelectItem>
                  <SelectItem value="didnt-help">It didn't help</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome-notes">Notes (optional)</Label>
              <Textarea
                id="outcome-notes"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="What worked? What didn't?"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOutcomeDialog(false)}>
              Skip
            </Button>
            <Button onClick={handleOutcomeSubmit} disabled={!outcome}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

