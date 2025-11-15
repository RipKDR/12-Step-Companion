import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, ChevronLeft, ChevronRight, Users, Heart, Lightbulb, MessageSquare, Shield } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { SafetyPlanContact, SafetyPlanAction } from '@/types';
import { getCrisisResourcesForRegion, detectRegionFromTimezone } from '@/lib/crisis-resources';
import { useToast } from '@/hooks/use-toast';

const TOTAL_STEPS = 5;

interface SafetyPlanBuilderProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function SafetyPlanBuilder({ onComplete, onCancel }: SafetyPlanBuilderProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  // Step 1: Contacts
  const [contacts, setContacts] = useState<SafetyPlanContact[]>([]);
  
  // Step 2: Reasons Not to Use
  const [reasonsNotToUse, setReasonsNotToUse] = useState<string[]>(['']);
  
  // Step 3: Actions Before Using
  const [actionsBeforeUsing, setActionsBeforeUsing] = useState<SafetyPlanAction[]>([]);
  
  // Step 4: Personal Message
  const [messageFromSoberMe, setMessageFromSoberMe] = useState('');
  
  // Step 5: Crisis Resources
  const [crisisResources, setCrisisResources] = useState<string[]>([]);

  const profile = useAppStore((state) => state.profile);
  const getContacts = useAppStore((state) => state.getContacts);
  const createSafetyPlan = useAppStore((state) => state.createSafetyPlan);

  const fellowshipContacts = useMemo(() => getContacts(), [getContacts]);
  const region = useMemo(() => detectRegionFromTimezone(profile?.timezone), [profile?.timezone]);
  const availableCrisisResources = useMemo(() => getCrisisResourcesForRegion(region), [region]);

  const progress = useMemo(() => ((step - 1) / (TOTAL_STEPS - 1)) * 100, [step]);

  const handleAddContact = () => {
    if (contacts.length >= 3) {
      toast({
        title: 'Maximum contacts reached',
        description: 'You can add up to 3 contacts to your safety plan.',
      });
      return;
    }
    setContacts([
      ...contacts,
      {
        id: `contact-${Date.now()}`,
        name: '',
        phone: '',
        relationship: 'sponsor',
        order: contacts.length + 1,
      },
    ]);
  };

  const handleUpdateContact = (id: string, updates: Partial<SafetyPlanContact>) => {
    setContacts(contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id).map((c, idx) => ({ ...c, order: idx + 1 })));
  };

  const handleAddReason = () => {
    if (reasonsNotToUse.length >= 3) {
      toast({
        title: 'Maximum reasons reached',
        description: 'You can add up to 3 reasons.',
      });
      return;
    }
    setReasonsNotToUse([...reasonsNotToUse, '']);
  };

  const handleUpdateReason = (index: number, value: string) => {
    const updated = [...reasonsNotToUse];
    updated[index] = value;
    setReasonsNotToUse(updated);
  };

  const handleRemoveReason = (index: number) => {
    setReasonsNotToUse(reasonsNotToUse.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    if (actionsBeforeUsing.length >= 3) {
      toast({
        title: 'Maximum actions reached',
        description: 'You can add up to 3 actions.',
      });
      return;
    }
    setActionsBeforeUsing([
      ...actionsBeforeUsing,
      {
        id: `action-${Date.now()}`,
        label: '',
        type: 'custom',
        order: actionsBeforeUsing.length + 1,
      },
    ]);
  };

  const handleUpdateAction = (id: string, updates: Partial<SafetyPlanAction>) => {
    setActionsBeforeUsing(actionsBeforeUsing.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleRemoveAction = (id: string) => {
    setActionsBeforeUsing(
      actionsBeforeUsing.filter((a) => a.id !== id).map((a, idx) => ({ ...a, order: idx + 1 }))
    );
  };

  const handleToggleCrisisResource = (resourceId: string) => {
    if (crisisResources.includes(resourceId)) {
      setCrisisResources(crisisResources.filter((id) => id !== resourceId));
    } else {
      setCrisisResources([...crisisResources, resourceId]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return contacts.length > 0 && contacts.every((c) => c.name.trim() && c.phone?.trim());
      case 2:
        return reasonsNotToUse.some((r) => r.trim());
      case 3:
        return actionsBeforeUsing.length > 0 && actionsBeforeUsing.every((a) => a.label.trim());
      case 4:
        return messageFromSoberMe.trim().length >= 20;
      case 5:
        return true; // Crisis resources are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    const selectedResources = availableCrisisResources.filter((r) =>
      crisisResources.includes(r.id)
    );

    createSafetyPlan({
      contacts: contacts.filter((c) => c.name.trim() && c.phone?.trim()),
      reasonsNotToUse: reasonsNotToUse.filter((r) => r.trim()),
      actionsBeforeUsing: actionsBeforeUsing.filter((a) => a.label.trim()),
      messageFromSoberMe: messageFromSoberMe.trim(),
      crisisResources: selectedResources,
      active: true,
    });

    toast({
      title: 'Safety Plan Created',
      description: 'Your safety plan has been saved and is ready to use.',
    });

    onComplete?.();
  };

  // Step 1: People to Contact
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">People to Contact</CardTitle>
            </div>
            <CardDescription>
              Add up to 3 people you can call or text when you're struggling (sponsor, recovery
              friend, family member, or crisis line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Contact {contact.order}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContact(contact.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`contact-name-${contact.id}`}>Name</Label>
                      <Input
                        id={`contact-name-${contact.id}`}
                        value={contact.name}
                        onChange={(e) => handleUpdateContact(contact.id, { name: e.target.value })}
                        placeholder="Name"
                        className="mt-1"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-phone-${contact.id}`}>Phone</Label>
                      <Input
                        id={`contact-phone-${contact.id}`}
                        type="tel"
                        value={contact.phone || ''}
                        onChange={(e) =>
                          handleUpdateContact(contact.id, { phone: e.target.value })
                        }
                        placeholder="Phone number"
                        className="mt-1"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-relationship-${contact.id}`}>Relationship</Label>
                      <Select
                        value={contact.relationship}
                        onValueChange={(value: SafetyPlanContact['relationship']) =>
                          handleUpdateContact(contact.id, { relationship: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                          <SelectItem value="recovery-friend">Recovery Friend</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="crisis-line">Crisis Line</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {contacts.length < 3 && (
                <Button
                  variant="outline"
                  onClick={handleAddContact}
                  className="w-full h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              )}
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Reasons Not to Use
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Reasons Not to Use</CardTitle>
            </div>
            <CardDescription>
              What are 3 reasons you don't want to use? Write these in your own words.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {reasonsNotToUse.map((reason, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`reason-${index}`}>Reason {index + 1}</Label>
                    {reasonsNotToUse.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReason(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id={`reason-${index}`}
                    value={reason}
                    onChange={(e) => handleUpdateReason(index, e.target.value)}
                    placeholder="e.g., I want to stay clean for my family..."
                    className="min-h-[80px]"
                  />
                </div>
              ))}
              {reasonsNotToUse.length < 3 && (
                <Button variant="outline" onClick={handleAddReason} className="w-full h-11">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reason
                </Button>
              )}
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Actions Before Using
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Actions Before Using</CardTitle>
            </div>
            <CardDescription>
              What are 3 things you can do before picking up? (walk, shower, meeting, breathing
              exercise, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {actionsBeforeUsing.map((action) => (
                <div key={action.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Action {action.order}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(action.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`action-label-${action.id}`}>What to do</Label>
                      <Input
                        id={`action-label-${action.id}`}
                        value={action.label}
                        onChange={(e) =>
                          handleUpdateAction(action.id, { label: e.target.value })
                        }
                        placeholder="e.g., Go for a walk, Take a shower, Go to a meeting"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`action-type-${action.id}`}>Type</Label>
                      <Select
                        value={action.type}
                        onValueChange={(value: SafetyPlanAction['type']) =>
                          handleUpdateAction(action.id, { type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Action</SelectItem>
                          <SelectItem value="tool">Recovery Tool</SelectItem>
                          <SelectItem value="meeting">Go to Meeting</SelectItem>
                          <SelectItem value="call">Call Someone</SelectItem>
                          <SelectItem value="text">Text Someone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {actionsBeforeUsing.length < 3 && (
                <Button variant="outline" onClick={handleAddAction} className="w-full h-11">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              )}
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Personal Message
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Message from Sober You</CardTitle>
            </div>
            <CardDescription>
              Write a message from "sober you" to "struggling you". What would you want to hear
              right now?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Textarea
                value={messageFromSoberMe}
                onChange={(e) => setMessageFromSoberMe(e.target.value)}
                placeholder="You are strong. This feeling is temporary. You've gotten through this before. Call someone if you need help..."
                className="min-h-[200px] text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {messageFromSoberMe.length} characters (minimum 20)
              </p>
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 5: Crisis Resources
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Crisis Resources</CardTitle>
            </div>
            <CardDescription>
              Select crisis resources available in your region. These will be included in your
              safety plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {availableCrisisResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    crisisResources.includes(resource.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleToggleCrisisResource(resource.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{resource.name}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        {resource.phone && (
                          <span className="text-muted-foreground">Phone: {resource.phone}</span>
                        )}
                        {resource.text && (
                          <span className="text-muted-foreground">Text: {resource.text}</span>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={crisisResources.includes(resource.id)}
                      onChange={() => handleToggleCrisisResource(resource.id)}
                      className="h-5 w-5 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Safety Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

