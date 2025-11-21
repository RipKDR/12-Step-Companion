/**
 * Sponsor Dashboard Client Component
 * 
 * Client-side component for viewing sponsee shared data
 */

"use client";

import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
    return <div>Loading shared data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Shared Step Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Step Work</CardTitle>
        </CardHeader>
        <CardContent>
          {sharedStepEntries.length > 0 ? (
            <div className="space-y-4">
              {sharedStepEntries.map((entry) => (
                <div key={entry.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      {entry.step?.title
                        ? `Step ${entry.step.step_number}: ${entry.step.title}`
                        : `Step Entry`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {entry.created_at ? format(new Date(entry.created_at), "MMM d, yyyy") : "—"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {/* Basic content preview - actual content structure depends on step */}
                    <pre className="whitespace-pre-wrap font-sans">
                      {JSON.stringify(entry.content, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shared step entries.</p>
          )}
        </CardContent>
      </Card>

      {/* Shared Daily Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Daily Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {sharedDailyEntries.length > 0 ? (
            <div className="space-y-4">
              {sharedDailyEntries.map((entry) => (
                <div key={entry.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      Entry for {format(new Date(entry.entry_date), "MMM d, yyyy")}
                    </h3>
                    <Badge variant={entry.cravings_intensity && entry.cravings_intensity > 5 ? "destructive" : "secondary"}>
                      Intensity: {entry.cravings_intensity}/10
                    </Badge>
                  </div>
                  
                  {entry.gratitude && (
                    <div className="mb-2">
                      <span className="font-semibold text-xs uppercase text-muted-foreground">Gratitude</span>
                      <p className="text-sm">{entry.gratitude}</p>
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div>
                      <span className="font-semibold text-xs uppercase text-muted-foreground">Notes</span>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shared daily logs.</p>
          )}
        </CardContent>
      </Card>

      {/* Shared Action Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Action Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {sharedActionPlans.length > 0 ? (
            <div className="space-y-4">
              {sharedActionPlans.map((plan) => (
                <div key={plan.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{plan.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {plan.created_at ? format(new Date(plan.created_at), "MMM d, yyyy") : "—"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{plan.situation}</p>
                  
                  <div className="space-y-2">
                    {plan.if_then?.map((rule, idx) => (
                      <div key={idx} className="text-sm bg-muted/30 p-2 rounded">
                        <span className="font-semibold">If:</span> {rule.if} <br/>
                        <span className="font-semibold">Then:</span> {rule.then}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shared action plans.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
