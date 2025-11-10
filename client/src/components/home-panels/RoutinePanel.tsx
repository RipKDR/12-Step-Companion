import { useState } from "react";
import DailyCard from "@/components/DailyCard";
import GratitudeList from "@/components/GratitudeList";
import QuickNotes from "@/components/QuickNotes";
import MeditationTimer from "@/components/MeditationTimer";
import ProgressRing from "@/components/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sunrise, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import type { DailyCard as DailyCardData } from "@/types";

interface RoutinePanelProps {
  dailyCard: DailyCardData | null;
  stepProgress: {
    currentStep: number;
    answeredQuestions: number;
    totalQuestions: number;
  };
  onMorningChange: (value: string) => void;
  onMorningComplete: () => void;
  onEveningChange: (value: string) => void;
  onEveningComplete: () => void;
  onGratitudeChange: (items: string[]) => void;
  onQuickNotesChange: (value: string) => void;
}

export default function RoutinePanel({
  dailyCard,
  stepProgress,
  onMorningChange,
  onMorningComplete,
  onEveningChange,
  onEveningComplete,
  onGratitudeChange,
  onQuickNotesChange,
}: RoutinePanelProps) {
  const [showDailyPractice, setShowDailyPractice] = useState(false);

  return (
    <div className="space-y-6 px-6">
      {/* Step Progress */}
      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="sr-only">Step Progress</h2>
        <Link href="/steps">
          <Card className="cursor-pointer hover-elevate active-elevate-2">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <ProgressRing
                  current={stepProgress.answeredQuestions}
                  total={stepProgress.totalQuestions}
                  stepNumber={stepProgress.currentStep}
                  size={80}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Step {stepProgress.currentStep}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stepProgress.answeredQuestions} of {stepProgress.totalQuestions} questions answered
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${stepProgress.totalQuestions > 0 ? (stepProgress.answeredQuestions / stepProgress.totalQuestions) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Daily Practice - Collapsible */}
      <section aria-labelledby="daily-practice-heading">
        <h2 id="daily-practice-heading" className="sr-only">Daily Practice</h2>
        <Collapsible open={showDailyPractice} onOpenChange={setShowDailyPractice}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader 
                className="cursor-pointer hover:bg-accent/50 transition-colors pb-4"
                data-testid="daily-practice-toggle"
                aria-expanded={showDailyPractice}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Daily Practice</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Morning, evening, and gratitude reflections
                    </p>
                  </div>
                  {showDailyPractice ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <DailyCard
                  title="Morning Intent"
                  icon={<Sunrise className="h-5 w-5" />}
                  value={dailyCard?.morningIntent || ""}
                  completed={dailyCard?.morningCompleted || false}
                  onChange={onMorningChange}
                  onComplete={onMorningComplete}
                  testId="morning-card"
                />
                <DailyCard
                  title="Evening Reflection"
                  icon={<Moon className="h-5 w-5" />}
                  value={dailyCard?.eveningReflection || ""}
                  completed={dailyCard?.eveningCompleted || false}
                  onChange={onEveningChange}
                  onComplete={onEveningComplete}
                  testId="evening-card"
                />
                <GratitudeList
                  items={dailyCard?.gratitudeItems || []}
                  onChange={onGratitudeChange}
                  testId="gratitude-list"
                />
                <QuickNotes
                  value={dailyCard?.quickNotes || ""}
                  onChange={onQuickNotesChange}
                  testId="quick-notes"
                />
                <MeditationTimer testId="meditation-timer" />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>
    </div>
  );
}
