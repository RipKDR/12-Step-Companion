import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RiskSignal } from '@/types';
import { generateExplanation } from '@/lib/jitai-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskSignalCardProps {
  signal: RiskSignal;
  onDismiss?: () => void;
  onAction?: (actionId: string) => void;
}

export default function RiskSignalCard({ signal, onDismiss, onAction }: RiskSignalCardProps) {
  const recordInterventionFeedback = useAppStore((state) => state.recordInterventionFeedback);
  const actOnRiskSignal = useAppStore((state) => state.actOnRiskSignal);

  const explanation = generateExplanation(signal.type, signal.inputs);

  const getSeverityColor = (severity: number) => {
    if (severity >= 70) return 'border-red-500 bg-red-50 dark:bg-red-950';
    if (severity >= 40) return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
    return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
  };

  const getSeverityIcon = (severity: number) => {
    if (severity >= 70) return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    return <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
  };

  const handleAction = (actionId: string) => {
    actOnRiskSignal(signal.id, actionId);
    if (onAction) {
      onAction(actionId);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleFeedback = (helpful: boolean) => {
    recordInterventionFeedback(signal.id, helpful);
    handleDismiss();
  };

  const getActionLabel = (actionId: string): string => {
    switch (actionId) {
      case 'show-safety-plan':
        return 'Open Safety Plan';
      case 'suggest-meeting':
        return 'Find Meeting';
      case 'open-scene':
        return 'Open Recovery Scene';
      case 'suggest-tool':
        return 'Use Tool';
      default:
        return actionId;
    }
  };

  return (
    <Card className={`${getSeverityColor(signal.severity)} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {getSeverityIcon(signal.severity)}
            <div className="flex-1">
              <CardTitle className="text-base">Risk Pattern Detected</CardTitle>
              <CardDescription className="mt-1">{explanation}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
            aria-label="Dismiss risk signal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {signal.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested actions:</p>
            <div className="flex flex-wrap gap-2">
              {signal.suggestedActions.map((actionId) => (
                <Button
                  key={actionId}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(actionId)}
                  className="min-h-[44px]"
                >
                  {getActionLabel(actionId)}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback(true)}
            className="flex-1 min-h-[44px]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            This helped
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback(false)}
            className="flex-1 min-h-[44px]"
          >
            Didn't help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

