import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Copy, Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildMeetingPrepPrompt } from '@/lib/copilot-prompts';
import type { CopilotContext } from '@/types';

interface MeetingPrepProps {
  context?: CopilotContext;
  onSave?: (share: string) => void;
  onShare?: (share: string) => void;
}

export default function MeetingPrep({ context, onSave, onShare }: MeetingPrepProps) {
  const [userShare, setUserShare] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!userShare.trim()) {
      toast({
        title: 'Please enter your share',
        description: 'Write what you want to share at the meeting first.',
        variant: 'default',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildMeetingPrepPrompt(userShare, context);

      const response = await fetch('/api/ai-sponsor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: [],
          userContext: {},
          promptType: 'meeting-prep',
          contextWindow: context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      const suggestionsText = data.response || '';

      // Parse suggestions from response
      const parsed = parseSuggestions(suggestionsText);
      setSuggestions(parsed);
    } catch (error) {
      console.error('Error generating meeting prep:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseSuggestions = (text: string): string[] => {
    const suggestions: string[] = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();
      // Look for numbered lists or bullet points
      if (trimmed.match(/^\d+\./) || trimmed.match(/^[-•*]/)) {
        const cleaned = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim();
        if (cleaned.length > 20) {
          suggestions.push(cleaned);
        }
      }
    });

    // If no structured suggestions found, try to extract paragraphs
    if (suggestions.length === 0) {
      const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 50);
      suggestions.push(...paragraphs.slice(0, 3).map((p) => p.trim()));
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Share text copied to clipboard.',
    });
  };

  const handleSave = () => {
    if (onSave && userShare.trim()) {
      onSave(userShare);
      toast({
        title: 'Saved',
        description: 'Your share has been saved.',
      });
    }
  };

  const handleShare = () => {
    if (onShare && userShare.trim()) {
      onShare(userShare);
      toast({
        title: 'Shared',
        description: 'Your share has been shared.',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Meeting Prep
        </CardTitle>
        <CardDescription>
          Get help phrasing your share for meetings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meeting-share">What do you want to share?</Label>
          <Textarea
            id="meeting-share"
            placeholder="Write what's on your mind, what you're struggling with, or what you want to share..."
            value={userShare}
            onChange={(e) => setUserShare(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!userShare.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating suggestions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>AI Suggestions</Label>
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestion}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(suggestion)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {(userShare.trim() || suggestions.length > 0) && (
          <>
            <Separator />
            <div className="flex gap-2">
              {onSave && (
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

