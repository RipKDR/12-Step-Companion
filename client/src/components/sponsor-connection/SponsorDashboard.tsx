import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, AlertTriangle, Calendar, FileText, BookOpen, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SponsorRelationship, SharedItem, DailyCard, JournalEntry, StepAnswer } from '@/types';

export default function SponsorDashboard() {
  const getActiveRelationships = useAppStore((state) => state.getActiveRelationships);
  const getSharedItems = useAppStore((state) => state.getSharedItems);
  const dailyCards = useAppStore((state) => state.dailyCards);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const stepAnswers = useAppStore((state) => state.stepAnswers);
  
  const relationships = getActiveRelationships().filter((rel) => rel.role === 'sponsor');

  // Group shared items by sponsee
  const sponseeData = useMemo(() => {
    return relationships.map((relationship) => {
      const sharedItems = getSharedItems(relationship.id);
      
      // Calculate risk indicators
      const recentDailyCards = sharedItems
        .filter((item) => item.itemType === 'daily-entry')
        .map((item) => dailyCards[item.itemId])
        .filter(Boolean)
        .slice(0, 7); // Last 7 days

      const recentJournals = sharedItems
        .filter((item) => item.itemType === 'journal-entry')
        .map((item) => journalEntries[item.id])
        .filter(Boolean)
        .slice(0, 5); // Last 5 entries

      const highCravings = recentDailyCards.some(
        (card) => card?.middayPulseCheck?.craving && card.middayPulseCheck.craving >= 7
      );

      const lowMood = recentDailyCards.some(
        (card) => card?.middayPulseCheck?.mood && card.middayPulseCheck.mood <= 2
      );

      const missedCheckIns = recentDailyCards.filter(
        (card) => !card?.morningCompleted && !card?.eveningCompleted
      ).length;

      const riskScore = [
        highCravings ? 1 : 0,
        lowMood ? 1 : 0,
        missedCheckIns > 2 ? 1 : 0,
      ].reduce((a, b) => a + b, 0);

      return {
        relationship,
        sharedItems,
        recentDailyCards,
        recentJournals,
        riskIndicators: {
          highCravings,
          lowMood,
          missedCheckIns,
          riskScore,
        },
      };
    });
  }, [relationships, getSharedItems, dailyCards, journalEntries]);

  if (relationships.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            You don't have any active sponsee connections yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Generate a code to share with your sponsee to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sponseeData.map(({ relationship, sharedItems, recentDailyCards, recentJournals, riskIndicators }) => (
        <Card key={relationship.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{relationship.sponseeName || 'Sponsee'}</CardTitle>
                <CardDescription>
                  {sharedItems.length} item{sharedItems.length !== 1 ? 's' : ''} shared
                </CardDescription>
              </div>
              {riskIndicators.riskScore > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Risk Indicators
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Indicators */}
            {riskIndicators.riskScore > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg space-y-2">
                <div className="font-medium text-sm">Risk Indicators</div>
                <div className="flex flex-wrap gap-2">
                  {riskIndicators.highCravings && (
                    <Badge variant="destructive" className="text-xs">
                      High Cravings
                    </Badge>
                  )}
                  {riskIndicators.lowMood && (
                    <Badge variant="destructive" className="text-xs">
                      Low Mood
                    </Badge>
                  )}
                  {riskIndicators.missedCheckIns > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {riskIndicators.missedCheckIns} Missed Check-ins
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              {relationship.sponsorPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-[44px]"
                  onClick={() => {
                    window.location.href = `tel:${relationship.sponsorPhone}`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-h-[44px]"
                onClick={() => {
                  // TODO: Open messaging component
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Shared Items */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 mt-4">
                {sharedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items shared yet
                  </p>
                ) : (
                  sharedItems.map((item) => (
                    <SharedItemCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="daily" className="space-y-2 mt-4">
                {recentDailyCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No daily cards shared
                  </p>
                ) : (
                  recentDailyCards.map((card) => (
                    <Card key={card?.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{card?.date}</div>
                          {card?.middayPulseCheck && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Mood: {card.middayPulseCheck.mood}/5 • Cravings: {card.middayPulseCheck.craving}/10
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="journal" className="space-y-2 mt-4">
                {recentJournals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No journal entries shared
                  </p>
                ) : (
                  recentJournals.map((entry) => (
                    <Card key={entry?.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {new Date(entry?.date || '').toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {entry?.content}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="steps" className="space-y-2 mt-4">
                {sharedItems.filter((item) => item.itemType === 'step-entry').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No step entries shared
                  </p>
                ) : (
                  sharedItems
                    .filter((item) => item.itemType === 'step-entry')
                    .map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Step {stepAnswers[item.itemId]?.stepNumber || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Shared {new Date(item.sharedAtISO).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SharedItemCard({ item }: { item: SharedItem }) {
  const getItemIcon = (itemType: SharedItem['itemType']) => {
    switch (itemType) {
      case 'daily-entry':
        return <Calendar className="h-4 w-4" />;
      case 'journal-entry':
        return <FileText className="h-4 w-4" />;
      case 'step-entry':
        return <BookOpen className="h-4 w-4" />;
      case 'scene':
        return <Heart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getItemLabel = (itemType: SharedItem['itemType']) => {
    switch (itemType) {
      case 'daily-entry':
        return 'Daily Card';
      case 'journal-entry':
        return 'Journal Entry';
      case 'step-entry':
        return 'Step Entry';
      case 'scene':
        return 'Recovery Scene';
      case 'safety-plan':
        return 'Safety Plan';
      default:
        return 'Item';
    }
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        {getItemIcon(item.itemType)}
        <div className="flex-1">
          <div className="font-medium text-sm">{getItemLabel(item.itemType)}</div>
          <div className="text-xs text-muted-foreground">
            Shared {new Date(item.sharedAtISO).toLocaleDateString()}
            {item.lastViewedAtISO && (
              <> • Viewed {new Date(item.lastViewedAtISO).toLocaleDateString()}</>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

