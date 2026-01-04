/**
 * Sponsor Dashboard Client Component
 *
 * Client-side component for viewing sponsee shared data
 */

"use client";

import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { FadeInSection, StaggerContainer } from "@/components/PageTransition";
import { format } from "date-fns";
import { FileText, Calendar, Target } from "lucide-react";

interface SponsorDashboardClientProps {
  sponseeId: string;
}

type SharedStepEntry = {
  id: string;
  created_at?: string | null;
  content?: unknown;
  step?: {
    title?: string | null;
    step_number?: number | null;
  } | null;
};

type SharedDailyEntry = {
  id: string;
  entry_date: string;
  cravings_intensity?: number | null;
  gratitude?: string | null;
  notes?: string | null;
};

type SharedActionPlan = {
  id: string;
  title: string;
  created_at?: string | null;
  situation?: string | null;
  if_then?: Array<{ if: string; then: string }> | null;
};

export function SponsorDashboardClient({ sponseeId }: SponsorDashboardClientProps) {
  const {
    data: sharedSteps,
    isLoading: loadingSteps,
  } = trpc.steps.getSharedEntries.useQuery({ sponseeId });

  const {
    data: sharedDaily,
    isLoading: loadingDaily,
  } = trpc.dailyEntries.getSharedEntries.useQuery({ sponseeId });

  const {
    data: sharedPlans,
    isLoading: loadingPlans,
  } = trpc.actionPlans.getSharedPlans.useQuery({ sponseeId });

  const sharedStepEntries = (sharedSteps ?? []) as unknown as SharedStepEntry[];
  const sharedDailyEntries = (sharedDaily ?? []) as unknown as SharedDailyEntry[];
  const sharedActionPlans = (sharedPlans ?? []) as unknown as SharedActionPlan[];

  if (loadingSteps || loadingDaily || loadingPlans) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Shared Step Entries */}
      <FadeInSection delay={0}>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Shared Step Work</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sharedStepEntries.length > 0 ? (
              <div className="space-y-3">
                {sharedStepEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group border border-border/50 rounded-lg p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground">
                        {entry.step?.title
                          ? `Step ${entry.step.step_number}: ${entry.step.title}`
                          : `Step Entry`}
                      </h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.created_at ? format(new Date(entry.created_at), "MMM d, yyyy") : "—"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border border-border/30">
                      {/* Basic content preview - actual content structure depends on step */}
                      <pre className="whitespace-pre-wrap font-sans text-xs">
                        {JSON.stringify(entry.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No shared step entries yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInSection>

      {/* Shared Daily Entries */}
      <FadeInSection delay={200}>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Shared Daily Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sharedDailyEntries.length > 0 ? (
              <div className="space-y-3">
                {sharedDailyEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group border border-border/50 rounded-lg p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-foreground">
                        {format(new Date(entry.entry_date), "EEEE, MMM d, yyyy")}
                      </h3>
                      <Badge
                        variant={entry.cravings_intensity && entry.cravings_intensity > 5 ? "destructive" : "success"}
                        size="sm"
                      >
                        Intensity: {entry.cravings_intensity ?? 0}/10
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {entry.gratitude && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-md border border-green-200/50 dark:border-green-800/50">
                          <span className="font-semibold text-xs uppercase text-green-700 dark:text-green-400 block mb-1">
                            Gratitude
                          </span>
                          <p className="text-sm text-foreground">{entry.gratitude}</p>
                        </div>
                      )}

                      {entry.notes && (
                        <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                          <span className="font-semibold text-xs uppercase text-muted-foreground block mb-1">
                            Notes
                          </span>
                          <p className="text-sm text-foreground">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No shared daily logs yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInSection>

      {/* Shared Action Plans */}
      <FadeInSection delay={400}>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Shared Action Plans</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sharedActionPlans.length > 0 ? (
              <div className="space-y-3">
                {sharedActionPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="group border border-border/50 rounded-lg p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground text-lg">{plan.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {plan.created_at ? format(new Date(plan.created_at), "MMM d, yyyy") : "—"}
                      </span>
                    </div>

                    {plan.situation && (
                      <p className="text-sm text-muted-foreground mb-4 italic bg-muted/20 p-3 rounded-md border-l-4 border-primary">
                        {plan.situation}
                      </p>
                    )}

                    <div className="space-y-2">
                      {plan.if_then?.map((rule, idx) => (
                        <div
                          key={idx}
                          className="text-sm bg-gradient-to-r from-primary/5 to-transparent p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex gap-2">
                            <span className="font-bold text-primary shrink-0">If:</span>
                            <span className="text-foreground">{rule.if}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className="font-bold text-green-600 dark:text-green-400 shrink-0">Then:</span>
                            <span className="text-foreground">{rule.then}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No shared action plans yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInSection>
    </div>
  );
}
