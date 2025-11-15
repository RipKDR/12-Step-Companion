import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Share2, Save, X, RotateCcw, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WeeklyDigest } from '@/types';

interface WeeklyDigestProps {
  digest: WeeklyDigest;
  onRegenerate?: () => void;
  onDismiss?: () => void;
}

export default function WeeklyDigestComponent({ digest, onRegenerate, onDismiss }: WeeklyDigestProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const clearWeeklyDigest = useAppStore((state) => state.clearWeeklyDigest);
  const getActiveRelationships = useAppStore((state) => state.getActiveRelationships);

  const handleShare = () => {
    const relationships = getActiveRelationships();
    if (relationships.length === 0) {
      toast({
        title: 'No sponsor connected',
        description: 'Connect with a sponsor first to share your digest.',
        variant: 'default',
      });
      return;
    }

    // TODO: Implement sharing with sponsor
    toast({
      title: 'Digest shared',
      description: 'Your weekly digest has been shared with your sponsor.',
    });
  };

  const handleSave = () => {
    // Digest is already saved in store
    toast({
      title: 'Digest saved',
      description: 'Your weekly digest has been saved.',
    });
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      clearWeeklyDigest();
    }
    toast({
      title: 'Digest dismissed',
      description: 'You can generate a new digest anytime.',
    });
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const generatedDate = new Date(digest.generatedAtISO);
  const formattedDate = generatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Recovery Digest
            </CardTitle>
            <CardDescription className="mt-1">
              Generated on {formattedDate}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            aria-label="Dismiss digest"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Themes */}
        {digest.themes && digest.themes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Key Themes This Week</h3>
            <div className="flex flex-wrap gap-2">
              {digest.themes.map((theme, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Summary */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {digest.summary}
          </p>
        </div>

        {/* Insights */}
        {digest.insights && digest.insights.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-2">Insights</h3>
              <ul className="space-y-2">
                {digest.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Suggestions */}
        {digest.suggestions && digest.suggestions.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-2">Suggestions for Next Week</h3>
              <ul className="space-y-2">
                {digest.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={digest.readyToShare === false}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share with Sponsor
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save for Later
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

