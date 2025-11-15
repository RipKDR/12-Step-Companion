import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';

export function RecommendedTools() {
  const getRecommendedTools = useAppStore((state) => state.getRecommendedTools);
  const recordToolUsage = useAppStore((state) => state.recordToolUsage);
  const [, setLocation] = useLocation();
  
  // Get current context (from daily card or default)
  const dailyCard = useAppStore((state) => {
    const today = new Date().toISOString().split('T')[0];
    return state.dailyCards[today];
  });
  
  const context = {
    mood: dailyCard?.middayPulseCheck?.mood,
    craving: dailyCard?.middayPulseCheck?.craving,
  };
  
  const recommendations = getRecommendedTools(context);
  
  if (recommendations.length === 0) return null;

  const handleToolClick = (toolName: string) => {
    // Track that recommendation was used
    const currentContext = {
      mood: dailyCard?.middayPulseCheck?.mood,
      craving: dailyCard?.middayPulseCheck?.craving,
    };
    recordToolUsage(toolName, { ...currentContext });
    
    // Navigate to emergency page and trigger the tool
    setLocation('/emergency');
    // The tool will be triggered by the Emergency component
    // We could use a query param or state to auto-trigger, but for now just navigate
  };
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for Right Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 3).map((rec) => (
          <div key={rec.toolName} className="space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="flex-1 justify-start capitalize"
                onClick={() => handleToolClick(rec.toolName)}
              >
                {rec.toolName.replace(/-/g, ' ')}
              </Button>
              {rec.confidence === 'high' && (
                <Badge variant="default" className="shrink-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground pl-1">{rec.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

