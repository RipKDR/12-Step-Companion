import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, X, BookOpen, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Pattern } from '@/types';

interface PatternDetectionProps {
  patterns: Pattern[];
  onExplore?: (pattern: Pattern) => void;
  onSave?: (pattern: Pattern) => void;
  onDismiss?: (patternId: string) => void;
}

export default function PatternDetection({
  patterns,
  onExplore,
  onSave,
  onDismiss,
}: PatternDetectionProps) {
  const { toast } = useToast();

  if (patterns.length === 0) {
    return null;
  }

  const handleExplore = (pattern: Pattern) => {
    if (onExplore) {
      onExplore(pattern);
    } else {
      // Default: navigate to journal or step work
      toast({
        title: 'Pattern detected',
        description: `Exploring pattern: ${pattern.description}`,
      });
    }
  };

  const handleSave = (pattern: Pattern) => {
    if (onSave) {
      onSave(pattern);
    } else {
      // Default: save for step work
      toast({
        title: 'Pattern saved',
        description: 'This pattern has been saved for your step work.',
      });
    }
  };

  const handleDismiss = (patternId: string) => {
    if (onDismiss) {
      onDismiss(patternId);
    } else {
      toast({
        title: 'Pattern dismissed',
        description: 'You can detect patterns again anytime.',
      });
    }
  };

  const getPatternTypeLabel = (type: Pattern['type']) => {
    const labels: Record<Pattern['type'], string> = {
      phrase: 'Recurring Phrase',
      theme: 'Theme',
      mood: 'Mood Pattern',
      trigger: 'Trigger Pattern',
      behavior: 'Behavior Pattern',
    };
    return labels[type] || 'Pattern';
  };

  const getPatternTypeColor = (type: Pattern['type']) => {
    const colors: Record<Pattern['type'], string> = {
      phrase: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      theme: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      mood: 'bg-green-500/10 text-green-700 dark:text-green-400',
      trigger: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      behavior: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Detected Patterns
        </CardTitle>
        <CardDescription>
          Patterns noticed in your recovery journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map((pattern) => (
          <div key={pattern.id} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getPatternTypeColor(pattern.type)}>
                    {getPatternTypeLabel(pattern.type)}
                  </Badge>
                  {pattern.frequency > 1 && (
                    <span className="text-xs text-muted-foreground">
                      Appears {pattern.frequency} times
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{pattern.description}</p>
                {pattern.examples && pattern.examples.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      {pattern.examples.slice(0, 2).map((example, idx) => (
                        <li key={idx} className="list-disc">
                          {example.length > 100 ? `${example.substring(0, 100)}...` : example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(pattern.id)}
                aria-label="Dismiss pattern"
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExplore(pattern)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Explore
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(pattern)}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Save for Step Work
              </Button>
            </div>

            {patterns.indexOf(pattern) < patterns.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

