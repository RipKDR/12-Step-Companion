import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import type { RecoveryScene, SceneAction } from '@/types';

interface SceneEditorProps {
  scene?: RecoveryScene;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const ACTION_TYPES: Array<{ value: SceneAction['type']; label: string }> = [
  { value: 'call', label: 'Call Contact' },
  { value: 'text', label: 'Text Contact' },
  { value: 'tool', label: 'Use Tool' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'custom', label: 'Custom Action' },
  { value: 'meeting', label: 'Find Meeting' },
  { value: 'safety-plan', label: 'Open Safety Plan' },
];

const TOOLS = ['breathing', 'grounding', 'meditation', 'journal', 'affirmations'];

export function SceneEditor({ scene, open, onOpenChange }: SceneEditorProps) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RecoveryScene>>({
    label: '',
    description: '',
    triggers: [],
    earlyWarningSigns: [],
    actions: [],
    messageFromSoberMe: '',
    active: true,
    timeTriggers: undefined,
  });

  const createRecoveryScene = useAppStore((state) => state.createRecoveryScene);
  const updateRecoveryScene = useAppStore((state) => state.updateRecoveryScene);
  const getContacts = useAppStore((state) => state.getContacts);

  const contacts = getContacts();
  const isEditing = !!scene;
  const totalSteps = 6;

  useEffect(() => {
    if (open) {
      if (scene) {
        setFormData({
          label: scene.label,
          description: scene.description || '',
          triggers: [...scene.triggers],
          earlyWarningSigns: [...scene.earlyWarningSigns],
          actions: [...scene.actions],
          messageFromSoberMe: scene.messageFromSoberMe,
          active: scene.active,
          timeTriggers: scene.timeTriggers,
        });
      } else {
        setFormData({
          label: '',
          description: '',
          triggers: [],
          earlyWarningSigns: [],
          actions: [],
          messageFromSoberMe: '',
          active: true,
          timeTriggers: undefined,
        });
      }
      setStep(1);
    }
  }, [scene, open]);

  const addTrigger = () => {
    const trigger = prompt('Enter a trigger (e.g., loneliness, stress, boredom):');
    if (trigger && trigger.trim()) {
      setFormData({
        ...formData,
        triggers: [...(formData.triggers || []), trigger.trim()],
      });
    }
  };

  const removeTrigger = (index: number) => {
    setFormData({
      ...formData,
      triggers: formData.triggers?.filter((_, i) => i !== index) || [],
    });
  };

  const addWarningSign = () => {
    const sign = prompt('Enter an early warning sign (e.g., tight chest, racing thoughts):');
    if (sign && sign.trim()) {
      setFormData({
        ...formData,
        earlyWarningSigns: [...(formData.earlyWarningSigns || []), sign.trim()],
      });
    }
  };

  const removeWarningSign = (index: number) => {
    setFormData({
      ...formData,
      earlyWarningSigns: formData.earlyWarningSigns?.filter((_, i) => i !== index) || [],
    });
  };

  const addAction = () => {
    const newAction: SceneAction = {
      id: `action_${Date.now()}`,
      type: 'custom',
      label: '',
      data: '',
      order: (formData.actions?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      actions: [...(formData.actions || []), newAction],
    });
  };

  const updateAction = (index: number, updates: Partial<SceneAction>) => {
    const actions = [...(formData.actions || [])];
    const currentAction = actions[index];
    const updatedAction = { ...currentAction, ...updates };
    
    // Auto-set label for safety-plan actions when type changes
    if (updates.type === 'safety-plan' && (!updatedAction.label || updatedAction.label.trim() === '')) {
      updatedAction.label = 'Open Safety Plan';
    }
    
    actions[index] = updatedAction;
    setFormData({ ...formData, actions });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSave = () => {
    // Validate required fields
    const errors: string[] = [];
    
    if (!formData.label || formData.label.trim().length < 3) {
      errors.push('Scene name must be at least 3 characters');
    }
    
    if (!formData.triggers || formData.triggers.length === 0) {
      errors.push('Add at least one trigger');
    }
    
    if (!formData.earlyWarningSigns || formData.earlyWarningSigns.length === 0) {
      errors.push('Add at least one early warning sign');
    }
    
    if (!formData.actions || formData.actions.length === 0) {
      errors.push('Add at least one action');
    }
    
    if (!formData.messageFromSoberMe || formData.messageFromSoberMe.trim().length < 10) {
      errors.push('Message from sober you must be at least 10 characters');
    }
    
    // Validate actions
    formData.actions?.forEach((action, idx) => {
      if (!action.label || action.label.trim().length === 0) {
        errors.push(`Action ${idx + 1} must have a label`);
      }
      if ((action.type === 'call' || action.type === 'text') && !action.contactId && !action.data) {
        errors.push(`Action ${idx + 1}: Select a contact or provide phone number`);
      }
      if (action.type === 'tool' && !action.data) {
        errors.push(`Action ${idx + 1}: Select a tool`);
      }
    });
    
    if (errors.length > 0) {
      // Show validation errors
      alert(`Please fix the following:\n\n${errors.join('\n')}`);
      return;
    }

    try {
      if (isEditing && scene) {
        updateRecoveryScene(scene.id, formData as Partial<RecoveryScene>);
      } else {
        createRecoveryScene({
          label: formData.label!.trim(),
          description: formData.description?.trim(),
          triggers: formData.triggers || [],
          earlyWarningSigns: formData.earlyWarningSigns || [],
          actions: formData.actions || [],
          messageFromSoberMe: formData.messageFromSoberMe!.trim(),
          active: formData.active ?? true,
          timeTriggers: formData.timeTriggers,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save scene:', error);
      alert(`Failed to save scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.label;
      case 2:
        return (formData.triggers?.length || 0) > 0;
      case 3:
        return (formData.earlyWarningSigns?.length || 0) > 0;
      case 4:
        return (formData.actions?.length || 0) > 0;
      case 5:
        return !!formData.messageFromSoberMe;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Scene Name *</Label>
              <Input
                id="label"
                placeholder="e.g., Home alone after 10pm"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe when this scene typically occurs..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const sceneContext = formData.label 
                    ? `I'm creating a recovery scene called "${formData.label}". ${formData.description ? `Description: ${formData.description}. ` : ''}Can you help me identify triggers, early warning signs, and actions for this scene?`
                    : 'I need help creating a recovery scene. Can you suggest triggers, early warning signs, and actions?';
                  sessionStorage.setItem('copilot_initial_message', sceneContext);
                  setLocation('/ai-sponsor');
                }}
                className="gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Help me create this scene
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked === true })
                }
              />
              <Label htmlFor="active" className="cursor-pointer">
                Active (scene will be available for use)
              </Label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Triggers *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What situations, feelings, or thoughts tend to lead to this scene?
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.triggers?.map((trigger, idx) => (
                  <Badge key={idx} variant="default" className="text-sm py-1 px-2">
                    {trigger}
                    <button
                      onClick={() => removeTrigger(idx)}
                      className="ml-2 hover:opacity-70"
                      aria-label={`Remove ${trigger}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addTrigger} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Early Warning Signs *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What body cues or thoughts signal that this scene is starting?
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.earlyWarningSigns?.map((sign, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-1 px-2">
                    {sign}
                    <button
                      onClick={() => removeWarningSign(idx)}
                      className="ml-2 hover:opacity-70"
                      aria-label={`Remove ${sign}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addWarningSign} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Warning Sign
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Actions *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What actions should be taken when this scene is activated? (Add up to 3)
              </p>
              {formData.actions?.map((action, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Action {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={action.type}
                      onValueChange={(value) =>
                        updateAction(idx, { type: value as SceneAction['type'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={action.label}
                      onChange={(e) => updateAction(idx, { label: e.target.value })}
                      placeholder={
                        action.type === 'safety-plan'
                          ? 'e.g., Open Safety Plan'
                          : action.type === 'call'
                            ? 'e.g., Call Sarah'
                            : action.type === 'tool'
                              ? 'e.g., Do breathing exercise'
                              : 'e.g., Action label'
                      }
                    />
                  </div>
                  {action.type === 'call' || action.type === 'text' ? (
                    <div>
                      <Label>Contact</Label>
                      <Select
                        value={action.contactId || ''}
                        onValueChange={(value) => updateAction(idx, { contactId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} {contact.phone && `(${contact.phone})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : action.type === 'tool' ? (
                    <div>
                      <Label>Tool</Label>
                      <Select
                        value={action.data}
                        onValueChange={(value) => updateAction(idx, { data: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tool" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOLS.map((tool) => (
                            <SelectItem key={tool} value={tool}>
                              {tool.charAt(0).toUpperCase() + tool.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : action.type === 'safety-plan' ? (
                    <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md">
                      This action will open your Safety Plan when the scene is activated. No additional configuration needed.
                    </div>
                  ) : (
                    <div>
                      <Label>Data / Details</Label>
                      <Input
                        value={action.data}
                        onChange={(e) => updateAction(idx, { data: e.target.value })}
                        placeholder={
                          action.type === 'reminder'
                            ? 'Reminder text...'
                            : action.type === 'custom'
                              ? 'Action details...'
                              : 'Additional data...'
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
              {(!formData.actions || formData.actions.length < 3) && (
                <Button type="button" variant="outline" onClick={addAction} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message from Sober You *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Write a message that your sober self would want your struggling self to hear right
                now.
              </p>
              <Textarea
                id="message"
                placeholder="Remember: This feeling is temporary. You are strong. Call someone if needed..."
                value={formData.messageFromSoberMe || ''}
                onChange={(e) => setFormData({ ...formData, messageFromSoberMe: e.target.value })}
                className="mt-1"
                rows={6}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label>Time Triggers (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                When does this scene typically occur?
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day, idx) => {
                      const isSelected =
                        formData.timeTriggers?.dayOfWeek?.includes(idx) || false;
                      return (
                        <Button
                          key={idx}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const days = formData.timeTriggers?.dayOfWeek || [];
                            const newDays = isSelected
                              ? days.filter((d) => d !== idx)
                              : [...days, idx];
                            setFormData({
                              ...formData,
                              timeTriggers: {
                                ...formData.timeTriggers,
                                dayOfWeek: newDays.length > 0 ? newDays : undefined,
                              },
                            });
                          }}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={formData.timeTriggers?.timeRange?.start || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeTriggers: {
                            ...formData.timeTriggers,
                            timeRange: {
                              start: e.target.value,
                              end: formData.timeTriggers?.timeRange?.end || '23:59',
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.timeTriggers?.timeRange?.end || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeTriggers: {
                            ...formData.timeTriggers,
                            timeRange: {
                              start: formData.timeTriggers?.timeRange?.start || '00:00',
                              end: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Recovery Scene' : 'Create Recovery Scene'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: Create a situation-specific playbook for high-risk moments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={(step / totalSteps) * 100} className="h-2" />

          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSave}>
                {isEditing ? 'Save Changes' : 'Create Scene'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

