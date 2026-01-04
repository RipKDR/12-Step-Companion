/**
 * Sponsee View Client Component
 *
 * Displays shared recovery data for a specific sponsee
 */

"use client";

import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function SponseeViewClient({ sponseeId }: { sponseeId: string }) {
  // Fetch shared data
  const { data: stepEntries, isLoading: stepsLoading } = trpc.steps.getSharedEntries.useQuery(
    { sponseeId }
  );

  const { data: dailyEntries, isLoading: dailyLoading } = trpc.dailyEntries.getSharedEntries.useQuery(
    { sponseeId }
  );

  const { data: actionPlans, isLoading: plansLoading } = trpc.actionPlans.getSharedPlans.useQuery(
    { sponseeId }
  );

  if (stepsLoading || dailyLoading || plansLoading) {
    return <div className="text-center py-8">Loading shared data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Daily Entries Section */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Daily Entries</CardTitle>
          <CardDescription>
            Daily recovery logs shared by your sponsee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyEntries && dailyEntries.length > 0 ? (
            <div className="space-y-4">
              {dailyEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </h3>
                    {entry.cravings_intensity !== null && (
                      <span className="text-sm text-muted-foreground">
                        Cravings: {entry.cravings_intensity}/10
                      </span>
                    )}
                  </div>
                  {entry.feelings && Array.isArray(entry.feelings) && entry.feelings.length > 0 && (
                    <div className="mb-2">
                      <strong>Feelings:</strong> {entry.feelings.join(", ")}
                    </div>
                  )}
                  {entry.triggers && Array.isArray(entry.triggers) && entry.triggers.length > 0 && (
                    <div className="mb-2">
                      <strong>Triggers:</strong> {entry.triggers.join(", ")}
                    </div>
                  )}
                  {entry.coping_actions && Array.isArray(entry.coping_actions) && entry.coping_actions.length > 0 && (
                    <div className="mb-2">
                      <strong>Coping Actions:</strong> {entry.coping_actions.join(", ")}
                    </div>
                  )}
                  {entry.gratitude && (
                    <div className="mb-2">
                      <strong>Gratitude:</strong> {entry.gratitude}
                    </div>
                  )}
                  {entry.notes && (
                    <div>
                      <strong>Notes:</strong> {entry.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No shared daily entries available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step Entries Section */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Step Work</CardTitle>
          <CardDescription>
            Step work entries shared by your sponsee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stepEntries && stepEntries.length > 0 ? (
            <div className="space-y-4">
              {stepEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">
                      Step Entry (Version {entry.version})
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">
                    {JSON.stringify(entry.content, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No shared step work available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Plans Section */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Action Plans</CardTitle>
          <CardDescription>
            Action plans shared by your sponsee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionPlans && actionPlans.length > 0 ? (
            <div className="space-y-4">
              {actionPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{plan.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {plan.situation && (
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      {plan.situation}
                    </p>
                  )}
                  {plan.if_then && Array.isArray(plan.if_then) && plan.if_then.length > 0 && (
                    <div className="mb-4">
                      <strong>If-Then Rules:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {plan.if_then.map((rule: { if: string; then: string }, idx: number) => (
                          <li key={idx} className="text-sm">
                            <strong>If:</strong> {rule.if} → <strong>Then:</strong> {rule.then}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.checklist && Array.isArray(plan.checklist) && plan.checklist.length > 0 && (
                    <div className="mb-4">
                      <strong>Checklist:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {plan.checklist.map((item: string, idx: number) => (
                          <li key={idx} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.emergency_contacts && Array.isArray(plan.emergency_contacts) && plan.emergency_contacts.length > 0 && (
                    <div>
                      <strong>Emergency Contacts:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {plan.emergency_contacts.map((contact: { name: string; phone: string }, idx: number) => (
                          <li key={idx} className="text-sm">
                            {contact.name}: {contact.phone}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No shared action plans available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
