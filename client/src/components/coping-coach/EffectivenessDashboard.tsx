import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function EffectivenessDashboard() {
  const effectiveness = useAppStore((state) => state.copingToolEffectiveness || {});
  const getPersonalPlaybook = useAppStore((state) => state.getPersonalPlaybook);
  
  const playbook = getPersonalPlaybook();
  
  // Sort effectiveness by score (highest first)
  const sortedEffectiveness = Object.values(effectiveness).sort(
    (a, b) => b.effectivenessScore - a.effectivenessScore
  );
  
  const getEffectivenessColor = (score: number) => {
    if (score >= 1.5) return 'text-green-600';
    if (score >= 1.0) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getEffectivenessLabel = (score: number) => {
    if (score >= 1.5) return 'Highly Effective';
    if (score >= 1.0) return 'Moderately Effective';
    return 'Less Effective';
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tool Effectiveness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedEffectiveness.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tool usage data yet. Start using tools and provide feedback to see effectiveness scores.
            </p>
          ) : (
            sortedEffectiveness.map((eff) => {
              const effectivenessPercentage = (eff.effectivenessScore / 2) * 100;
              const hasOutcomes = eff.totalUses > 0 && (eff.betterCount + eff.sameCount + eff.worseCount > 0);
              
              return (
                <div key={eff.toolName} className="space-y-2 p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{eff.toolName.replace(/-/g, ' ')}</span>
                        {hasOutcomes && (
                          <Badge 
                            variant="outline" 
                            className={getEffectivenessColor(eff.effectivenessScore)}
                          >
                            {getEffectivenessLabel(eff.effectivenessScore)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {eff.totalUses} {eff.totalUses === 1 ? 'use' : 'uses'}
                        {hasOutcomes && ` • ${eff.confidenceScore >= 0.7 ? 'High' : eff.confidenceScore >= 0.4 ? 'Medium' : 'Low'} confidence`}
                      </span>
                    </div>
                  </div>
                  {hasOutcomes && (
                    <>
                      <Progress value={effectivenessPercentage} className="h-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span>{eff.betterCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Minus className="h-3 w-3 text-yellow-600" />
                          <span>{eff.sameCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span>{eff.worseCount}</span>
                        </div>
                      </div>
                      {eff.averageCravingChange !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Avg craving change: {eff.averageCravingChange > 0 ? '+' : ''}{eff.averageCravingChange.toFixed(1)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      
      {Object.keys(playbook).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personal Playbook</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.values(playbook).map((entry, i) => (
                <li key={i} className="text-sm p-2 rounded bg-muted/50">{entry}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

