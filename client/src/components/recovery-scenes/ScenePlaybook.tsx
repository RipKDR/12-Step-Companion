import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, Phone, MessageSquare, Wrench, Calendar, FileText, Shield } from 'lucide-react';
import type { RecoveryScene, SceneUsage } from '@/types';
import SafetyPlanDisplay from '@/components/safety-plan/SafetyPlanDisplay';
import SafetyPlanBuilder from '@/components/safety-plan/SafetyPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface ScenePlaybookProps {
  sceneId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScenePlaybook({ sceneId, open, onOpenChange }: ScenePlaybookProps) {
  const [usageId, setUsageId] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [outcome, setOutcome] = useState<SceneUsage['outcome'] | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [showOutcome, setShowOutcome] = useState(false);
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [showSafetyPlanBuilder, setShowSafetyPlanBuilder] = useState(false);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getRecoveryScene = useAppStore((state) => state.getRecoveryScene);
  const activateScene = useAppStore((state) => state.activateScene);
  const completeSceneAction = useAppStore((state) => state.completeSceneAction);
  const recordSceneOutcome = useAppStore((state) => state.recordSceneOutcome);
  const getContacts = useAppStore((state) => state.getContacts);
  const getSafetyPlan = useAppStore((state) => state.getSafetyPlan);
  const activateSafetyPlan = useAppStore((state) => state.activateSafetyPlan);

  const scene = getRecoveryScene(sceneId);
  const contacts = getContacts();

  useEffect(() => {
    if (open && scene && !usageId) {
      try {
        const id = activateScene(sceneId, 'manual');
        setUsageId(id);
        setCompletedActions(new Set());
        setOutcome(undefined);
        setNotes('');
        setShowOutcome(false);
      } catch (error) {
        console.error('Failed to activate scene:', error);
        toast({
          title: 'Failed to activate scene',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
        onOpenChange(false);
      }
    }
    // Reset when dialog closes
    if (!open) {
      setUsageId(null);
      setCompletedActions(new Set());
      setOutcome(undefined);
      setNotes('');
      setShowOutcome(false);
    }
    // Only depend on open and sceneId, not on functions or toast
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sceneId]);

  if (!scene) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scene Not Found</DialogTitle>
            <DialogDescription>
              The recovery scene you're looking for doesn't exist or has been deleted.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handleActionClick = React.useCallback((actionId: string, action: RecoveryScene['actions'][0]) => {
    if (completedActions.has(actionId)) return;

    try {
      // Handle different action types
      switch (action.type) {
        case 'call':
          if (action.contactId) {
            const contact = contacts.find((c) => c.id === action.contactId);
            if (contact?.phone) {
              window.location.href = `tel:${contact.phone}`;
            } else {
              toast({
                title: 'Contact missing phone number',
                description: `${contact?.name || 'This contact'} does not have a phone number configured.`,
                variant: 'destructive',
              });
              return;
            }
          } else if (action.data.startsWith('tel:')) {
            window.location.href = action.data;
          } else {
            toast({
              title: 'Call action not configured',
              description: 'Please configure a contact or phone number for this action.',
              variant: 'destructive',
            });
            return;
          }
          break;
        case 'text':
          if (action.contactId) {
            const contact = contacts.find((c) => c.id === action.contactId);
            if (contact?.phone) {
              window.location.href = `sms:${contact.phone}`;
            } else {
              toast({
                title: 'Contact missing phone number',
                description: `${contact?.name || 'This contact'} does not have a phone number configured.`,
                variant: 'destructive',
              });
              return;
            }
          } else {
            toast({
              title: 'Text action not configured',
              description: 'Please configure a contact for this action.',
              variant: 'destructive',
            });
            return;
          }
          break;
        case 'tool':
          // Map tool names to routes
          const toolRoutes: Record<string, string> = {
            breathing: '/emergency?tool=breathing',
            grounding: '/emergency?tool=grounding',
            meditation: '/resources?tool=meditation',
            journal: '/journal?quick=true',
            affirmations: '/resources?tool=affirmations',
          };
          
          const route = toolRoutes[action.data] || '/emergency';
          setLocation(route);
          onOpenChange(false); // Close scene playbook when navigating
          break;
        case 'meeting':
          setLocation('/meetings');
          onOpenChange(false);
          break;
        case 'reminder':
        case 'custom':
          // Show reminder/custom action in a toast instead of alert
          toast({
            title: action.label,
            description: action.data || 'Reminder',
          });
          break;
        case 'safety-plan':
          const plan = getSafetyPlan();
          if (plan) {
            activateSafetyPlan('scene');
            setShowSafetyPlan(true);
          } else {
            setShowSafetyPlanBuilder(true);
          }
          break;
      }

      // Mark as completed
      if (usageId) {
        completeSceneAction(usageId, actionId);
        setCompletedActions((prev) => new Set([...prev, actionId]));
        
        toast({
          title: 'Action completed',
          description: `Completed: ${action.label}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to execute action',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [completedActions, contacts, getSafetyPlan, activateSafetyPlan, usageId, completeSceneAction, toast, setLocation, onOpenChange]);

  const handleSaveOutcome = useCallback(() => {
    if (usageId && outcome) {
      try {
        recordSceneOutcome(usageId, outcome, notes || undefined);
        setShowOutcome(false);
        toast({
          title: 'Feedback saved',
          description: 'Thank you for sharing how this scene helped you.',
        });
        // Close after a short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } catch (error) {
        toast({
          title: 'Failed to save feedback',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    }
  }, [usageId, outcome, notes, recordSceneOutcome, toast, onOpenChange]);

  const getActionIcon = useCallback((type: RecoveryScene['actions'][0]['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-5 w-5" />;
      case 'text':
        return <MessageSquare className="h-5 w-5" />;
      case 'tool':
        return <Wrench className="h-5 w-5" />;
      case 'meeting':
        return <Calendar className="h-5 w-5" />;
      case 'safety-plan':
        return <Shield className="h-5 w-5" />;
      case 'reminder':
      case 'custom':
      default:
        return <FileText className="h-5 w-5" />;
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{scene.label}</DialogTitle>
          <DialogDescription>
            Your recovery playbook for this moment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Triggers & Warning Signs */}
          {(scene.triggers.length > 0 || scene.earlyWarningSigns.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recognize This?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scene.triggers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Triggers:</p>
                    <div className="flex flex-wrap gap-2">
                      {scene.triggers.map((trigger, idx) => (
                        <Badge key={idx} variant="default">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {scene.earlyWarningSigns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Early Warning Signs:</p>
                    <div className="flex flex-wrap gap-2">
                      {scene.earlyWarningSigns.map((sign, idx) => (
                        <Badge key={idx} variant="secondary">
                          {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message from Sober You */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Message from Sober You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{scene.messageFromSoberMe}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Actions</CardTitle>
              <CardDescription>
                Complete these actions to navigate this moment safely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {useMemo(() => {
                return [...scene.actions]
                  .sort((a, b) => a.order - b.order)
                  .map((action) => {
                    const isCompleted = completedActions.has(action.id);
                    return (
                      <Button
                        key={action.id}
                        variant={isCompleted ? 'secondary' : 'default'}
                        size="lg"
                        className="w-full justify-start h-auto py-4 px-4"
                        onClick={() => handleActionClick(action.id, action)}
                        disabled={isCompleted}
                        aria-label={`${action.label}${isCompleted ? ' (completed)' : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                          ) : (
                            getActionIcon(action.type)
                          )}
                          <span className="flex-1 text-left">{action.label}</span>
                        </div>
                      </Button>
                    );
                  });
              }, [scene.actions, completedActions, handleActionClick])}
            </CardContent>
          </Card>

          {/* Outcome Feedback */}
          {completedActions.size > 0 && !showOutcome && (
            <div className="flex justify-center">
              <Button onClick={() => setShowOutcome(true)} variant="outline">
                How did this help?
              </Button>
            </div>
          )}

          {showOutcome && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How did this scene help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="helped" id="helped" />
                    <Label htmlFor="helped" className="cursor-pointer">
                      It helped
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="cursor-pointer">
                      Partially helpful
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="didnt-help" id="didnt-help" />
                    <Label htmlFor="didnt-help" className="cursor-pointer">
                      Didn't help
                    </Label>
                  </div>
                </RadioGroup>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What worked? What didn't? How can this scene be improved?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSaveOutcome} className="w-full" disabled={!outcome}>
                  Save Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
      {/* Safety Plan Display Dialog */}
      <Dialog open={showSafetyPlan} onOpenChange={setShowSafetyPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanDisplay onClose={() => setShowSafetyPlan(false)} />
        </DialogContent>
      </Dialog>

      {/* Safety Plan Builder Dialog */}
      <Dialog open={showSafetyPlanBuilder} onOpenChange={setShowSafetyPlanBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanBuilder
            onComplete={() => {
              setShowSafetyPlanBuilder(false);
              setShowSafetyPlan(true);
            }}
            onCancel={() => setShowSafetyPlanBuilder(false)}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

