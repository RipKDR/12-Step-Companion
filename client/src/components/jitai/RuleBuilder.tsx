import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { JITAIRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, ChevronLeft, TestTube } from 'lucide-react';
import { matchRule, type RiskDetectionContext } from '@/lib/jitai-engine';

interface RuleBuilderProps {
  onSave?: (ruleId: string) => void;
  onCancel?: () => void;
  initialRule?: JITAIRule;
}

type WizardStep = 'condition' | 'action' | 'explanation' | 'test';

export default function RuleBuilder({ onSave, onCancel, initialRule }: RuleBuilderProps) {
  const createJITAIRule = useAppStore((state) => state.createJITAIRule);
  const updateJITAIRule = useAppStore((state) => state.updateJITAIRule);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const meetings = useAppStore((state) => state.meetings || []);
  const recoveryScenes = useAppStore((state) => state.recoveryScenes || {});
  const sceneUsages = useAppStore((state) => state.sceneUsages || {});

  const [step, setStep] = useState<WizardStep>('condition');
  const [rule, setRule] = useState<Partial<JITAIRule>>(
    initialRule || {
      name: '',
      enabled: true,
      condition: {
        type: 'craving-threshold',
        threshold: 7,
        windowDays: 3,
        operator: 'greater-than',
      },
      action: {
        type: 'show-safety-plan',
        data: '',
        priority: 3,
      },
      explanation: '',
    }
  );

  const handleNext = () => {
    if (step === 'condition') setStep('action');
    else if (step === 'action') setStep('explanation');
    else if (step === 'explanation') setStep('test');
  };

  const handleBack = () => {
    if (step === 'test') setStep('explanation');
    else if (step === 'explanation') setStep('action');
    else if (step === 'action') setStep('condition');
  };

  const handleSave = () => {
    if (!rule.name || !rule.explanation) return;

    const ruleToSave: Omit<JITAIRule, 'id' | 'createdAtISO' | 'triggerCount'> = {
      name: rule.name,
      enabled: rule.enabled ?? true,
      condition: rule.condition!,
      action: rule.action!,
      explanation: rule.explanation,
    };

    if (initialRule) {
      updateJITAIRule(initialRule.id, ruleToSave);
      if (onSave) onSave(initialRule.id);
    } else {
      const ruleId = createJITAIRule(ruleToSave);
      if (onSave) onSave(ruleId);
    }
  };

  const handleTest = () => {
    if (!rule.condition) return;

    const testRule: JITAIRule = {
      id: 'test',
      name: rule.name || 'Test Rule',
      enabled: true,
      condition: rule.condition,
      action: rule.action || { type: 'show-safety-plan', data: '', priority: 3 },
      explanation: rule.explanation || '',
      createdAtISO: new Date().toISOString(),
      triggerCount: 0,
    };

    const context: RiskDetectionContext = {
      dailyCards: Object.fromEntries(
        Object.keys(Array.from({ length: 7 })).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const card = getDailyCard(dateStr);
          return [dateStr, card || { id: dateStr, date: dateStr, morningCompleted: false, eveningCompleted: false, middayCompleted: false, updatedAtISO: date.toISOString() }];
        })
      ),
      journalEntries: journalEntries || {},
      meetings: meetings,
      recoveryScenes: recoveryScenes,
      sceneUsages: sceneUsages || {},
      jitaiRules: {},
    };

    const matches = matchRule(testRule, context);
    alert(matches ? 'This rule would trigger with your current data!' : 'This rule would not trigger with your current data.');
  };

  const canProceed = () => {
    if (step === 'condition') {
      return rule.condition?.type && rule.condition?.threshold !== undefined && rule.condition?.windowDays;
    }
    if (step === 'action') {
      return rule.action?.type && rule.action?.priority !== undefined;
    }
    if (step === 'explanation') {
      return rule.name && rule.explanation;
    }
    return true;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialRule ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
        <CardDescription>
          {step === 'condition' && 'Define when this rule should trigger'}
          {step === 'action' && 'Define what action to suggest'}
          {step === 'explanation' && 'Explain why this suggestion is made'}
          {step === 'test' && 'Test your rule against current data'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Condition Step */}
        {step === 'condition' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition-type">Condition Type</Label>
              <Select
                value={rule.condition?.type}
                onValueChange={(value: JITAIRule['condition']['type']) =>
                  setRule({
                    ...rule,
                    condition: { ...rule.condition!, type: value },
                  })
                }
              >
                <SelectTrigger id="condition-type">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="craving-threshold">High Cravings</SelectItem>
                  <SelectItem value="mood-trend">Low Mood</SelectItem>
                  <SelectItem value="meeting-gap">Skipped Meetings</SelectItem>
                  <SelectItem value="scene-usage">Frequent Scene Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="threshold">
                Threshold: {rule.condition?.threshold}
                {rule.condition?.type === 'craving-threshold' && ' (0-10)'}
                {rule.condition?.type === 'mood-trend' && ' (1-5)'}
                {rule.condition?.type === 'meeting-gap' && ' (days)'}
                {rule.condition?.type === 'scene-usage' && ' (activations)'}
              </Label>
              <Slider
                id="threshold"
                min={rule.condition?.type === 'mood-trend' ? 1 : 0}
                max={rule.condition?.type === 'craving-threshold' ? 10 : rule.condition?.type === 'mood-trend' ? 5 : 30}
                step={0.5}
                value={[rule.condition?.threshold || 0]}
                onValueChange={([value]) =>
                  setRule({
                    ...rule,
                    condition: { ...rule.condition!, threshold: value },
                  })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="operator">Operator</Label>
              <Select
                value={rule.condition?.operator}
                onValueChange={(value: JITAIRule['condition']['operator']) =>
                  setRule({
                    ...rule,
                    condition: { ...rule.condition!, operator: value },
                  })
                }
              >
                <SelectTrigger id="operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater-than">Greater Than</SelectItem>
                  <SelectItem value="less-than">Less Than</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="trending-down">Trending Down</SelectItem>
                  <SelectItem value="trending-up">Trending Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="window-days">Look Back Window (days)</Label>
              <Input
                id="window-days"
                type="number"
                min={1}
                max={30}
                value={rule.condition?.windowDays || 3}
                onChange={(e) =>
                  setRule({
                    ...rule,
                    condition: { ...rule.condition!, windowDays: parseInt(e.target.value) || 3 },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Action Step */}
        {step === 'action' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select
                value={rule.action?.type}
                onValueChange={(value: JITAIRule['action']['type']) =>
                  setRule({
                    ...rule,
                    action: { ...rule.action!, type: value },
                  })
                }
              >
                <SelectTrigger id="action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show-safety-plan">Show Safety Plan</SelectItem>
                  <SelectItem value="suggest-meeting">Suggest Meeting</SelectItem>
                  <SelectItem value="open-scene">Open Recovery Scene</SelectItem>
                  <SelectItem value="suggest-tool">Suggest Tool</SelectItem>
                  <SelectItem value="send-message">Send Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">
                Priority: {rule.action?.priority} (1-5, higher = more urgent)
              </Label>
              <Slider
                id="priority"
                min={1}
                max={5}
                step={1}
                value={[rule.action?.priority || 3]}
                onValueChange={([value]) =>
                  setRule({
                    ...rule,
                    action: { ...rule.action!, priority: value },
                  })
                }
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Explanation Step */}
        {step === 'explanation' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={rule.name || ''}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="e.g., High Cravings Alert"
              />
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (shown to user)</Label>
              <Textarea
                id="explanation"
                value={rule.explanation || ''}
                onChange={(e) => setRule({ ...rule, explanation: e.target.value })}
                placeholder="e.g., I noticed you've logged high cravings 3 nights in a row."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={rule.enabled ?? true}
                onCheckedChange={(checked) => setRule({ ...rule, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable this rule</Label>
            </div>
          </div>
        )}

        {/* Test Step */}
        {step === 'test' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Rule Summary</h3>
              <p className="text-sm">
                <strong>Name:</strong> {rule.name || 'Untitled'}
              </p>
              <p className="text-sm">
                <strong>Condition:</strong> {rule.condition?.type} {rule.condition?.operator} {rule.condition?.threshold}
              </p>
              <p className="text-sm">
                <strong>Action:</strong> {rule.action?.type}
              </p>
              <p className="text-sm">
                <strong>Explanation:</strong> {rule.explanation || 'None'}
              </p>
            </div>

            <Button onClick={handleTest} variant="outline" className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Test Rule
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <div>
            {step !== 'condition' && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {step !== 'test' ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canProceed()}>
                Save Rule
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

