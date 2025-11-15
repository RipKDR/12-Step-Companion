import { X, Lightbulb, CheckCircle2, XCircle, Clock, MapPin, Navigation } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { RiskSignal, Meeting } from '@/types';
import { generateExplanation } from '@/lib/jitai-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/location';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import SafetyPlanDisplay from '@/components/safety-plan/SafetyPlanDisplay';
import SafetyPlanBuilder from '@/components/safety-plan/SafetyPlanBuilder';
import { useLocation } from 'wouter';

interface InterventionSuggestionsProps {
  signals: RiskSignal[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InterventionSuggestions({
  signals,
  open,
  onOpenChange,
}: InterventionSuggestionsProps) {
  const [, setLocation] = useLocation();
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [showSafetyPlanBuilder, setShowSafetyPlanBuilder] = useState(false);
  const actOnRiskSignal = useAppStore((state) => state.actOnRiskSignal);
  const activateSafetyPlan = useAppStore((state) => state.activateSafetyPlan);
  const getSafetyPlan = useAppStore((state) => state.getSafetyPlan);
  const recordInterventionFeedback = useAppStore((state) => state.recordInterventionFeedback);
  const dismissRiskSignal = useAppStore((state) => state.dismissRiskSignal);
  const meetingCache = useAppStore((state) => state.meetingCache);
  const getFavoriteMeetings = useAppStore((state) => state.getFavoriteMeetings);

  // Get meetings starting soon for high-risk interventions
  const meetingsStartingSoon = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const oneHourLater = currentTime + 60;

    const allMeetings: Meeting[] = [];
    if (meetingCache) {
      allMeetings.push(...meetingCache.meetings);
    }
    const favorites = getFavoriteMeetings();
    favorites.forEach(fav => {
      if (!allMeetings.find(m => m.id === fav.id)) {
        allMeetings.push(fav);
      }
    });

    return allMeetings.filter(meeting => {
      if (meeting.dayOfWeek !== currentDay) return false;
      const [hours, minutes] = meeting.time.split(':').map(Number);
      const meetingTime = hours * 60 + minutes;
      return meetingTime >= currentTime && meetingTime <= oneHourLater;
    }).sort((a, b) => {
      const [aHours, aMins] = a.time.split(':').map(Number);
      const [bHours, bMins] = b.time.split(':').map(Number);
      const aTime = aHours * 60 + aMins;
      const bTime = bHours * 60 + bMins;
      return aTime - bTime;
    }).slice(0, 3); // Show up to 3 meetings
  }, [meetingCache, getFavoriteMeetings]);

  const formatMeetingTime = (meeting: Meeting): string => {
    const [hours, minutes] = meeting.time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAction = (signalId: string, actionId: string) => {
    actOnRiskSignal(signalId, actionId);
    
    // Handle specific actions
    switch (actionId) {
      case 'show-safety-plan':
        const plan = getSafetyPlan();
        if (plan) {
          activateSafetyPlan('jitai');
          setShowSafetyPlan(true);
          onOpenChange(false);
        } else {
          setShowSafetyPlanBuilder(true);
          onOpenChange(false);
        }
        break;
      case 'suggest-meeting':
        setLocation('/meetings');
        onOpenChange(false);
        break;
      case 'open-scene':
        setLocation('/scenes');
        onOpenChange(false);
        break;
      case 'suggest-tool':
        setLocation('/emergency');
        onOpenChange(false);
        break;
      default:
        // Other actions handled by parent/router
        break;
    }
  };

  const handleFeedback = (signalId: string, helpful: boolean) => {
    recordInterventionFeedback(signalId, helpful);
    dismissRiskSignal(signalId);
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
      case 'send-message':
        return 'Send Message';
      default:
        return actionId;
    }
  };

  const getActionDescription = (actionId: string): string => {
    switch (actionId) {
      case 'show-safety-plan':
        return 'Review your personalized safety plan';
      case 'suggest-meeting':
        return 'Find a nearby meeting to attend';
      case 'open-scene':
        return 'Access your recovery scene playbook';
      case 'suggest-tool':
        return 'Use a recovery tool like breathing exercises';
      case 'send-message':
        return 'Reach out to your support network';
      default:
        return '';
    }
  };

  // Sort signals by severity (highest first)
  const sortedSignals = [...signals].sort((a, b) => b.severity - a.severity);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recovery Suggestions
          </SheetTitle>
          <SheetDescription>
            Based on patterns I've noticed, here are some suggestions that might help.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {sortedSignals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No active risk signals detected. You're doing great!
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedSignals.map((signal) => {
              const explanation = generateExplanation(signal.type, signal.inputs);
              return (
                <Card key={signal.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">I noticed something</CardTitle>
                    <CardDescription>{explanation}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {signal.suggestedActions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggested actions:</p>
                        <div className="space-y-2">
                          {signal.suggestedActions.map((actionId) => (
                            <div key={actionId}>
                              <Button
                                variant="outline"
                                className="w-full justify-start min-h-[44px]"
                                onClick={() => handleAction(signal.id, actionId)}
                              >
                                <span className="flex-1 text-left">
                                  <div className="font-medium">{getActionLabel(actionId)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {getActionDescription(actionId)}
                                  </div>
                                </span>
                              </Button>
                              
                              {/* Show meetings starting soon for suggest-meeting action */}
                              {actionId === 'suggest-meeting' && meetingsStartingSoon.length > 0 && (
                                <div className="mt-2 space-y-2 pl-4 border-l-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Meetings starting soon:
                                  </p>
                                  {meetingsStartingSoon.map((meeting) => {
                                    const [hours, minutes] = meeting.time.split(':').map(Number);
                                    const now = new Date();
                                    const meetingTime = new Date(now);
                                    meetingTime.setHours(hours, minutes, 0, 0);
                                    const minutesUntil = Math.max(0, Math.floor((meetingTime.getTime() - now.getTime()) / 60000));

                                    return (
                                      <div
                                        key={meeting.id}
                                        className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                                        onClick={() => {
                                          setLocation('/meetings?tab=finder');
                                          onOpenChange(false);
                                        }}
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs">{meeting.program}</Badge>
                                            <span className="font-medium text-xs">{meeting.name}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {formatMeetingTime(meeting)} • {minutesUntil === 0 ? 'Starting now' : `in ${minutesUntil} min`}
                                            {meeting.location && meeting.distanceKm && (
                                              <span> • {formatDistance(meeting.distanceKm)}</span>
                                            )}
                                          </div>
                                        </div>
                                        <Navigation className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                    );
                                  })}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={() => {
                                      setLocation('/meetings?tab=finder');
                                      onOpenChange(false);
                                    }}
                                  >
                                    Find more meetings →
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(signal.id, true)}
                        className="flex-1 min-h-[44px]"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        This helped
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(signal.id, false)}
                        className="flex-1 min-h-[44px]"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Didn't help
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
      
      {/* Safety Plan Display Dialog */}
      <Dialog open={showSafetyPlan} onOpenChange={setShowSafetyPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanDisplay onClose={() => setShowSafetyPlan(false)} />
        </DialogContent>
      </Dialog>

      {/* Safety Plan Builder Dialog */}
      <Dialog open={showSafetyPlanBuilder} onOpenChange={setShowSafetyPlanBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanBuilder
            onComplete={() => {
              setShowSafetyPlanBuilder(false);
              setShowSafetyPlan(true);
            }}
            onCancel={() => setShowSafetyPlanBuilder(false)}
          />
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

