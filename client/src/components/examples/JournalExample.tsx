/**
 * Journal Component Example - tRPC Integration
 * 
 * Example showing how to migrate Journal component to use tRPC
 */

import { useState } from "react";
import { useDailyEntries, useTodaysEntry, useUpsertDailyEntry } from "@/hooks/useDailyEntries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function JournalExample() {
  const [showEditor, setShowEditor] = useState(false);
  
  // Get today's entry
  const { entry: todayEntry, isLoading } = useTodaysEntry("UTC");
  
  // Get recent entries
  const { entries: recentEntries } = useDailyEntries({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  });

  // Mutation for saving
  const upsertMutation = useUpsertDailyEntry();

  const handleSave = async (data: {
    cravingsIntensity?: number;
    feelings?: string[];
    triggers?: string[];
    gratitude?: string;
    notes?: string;
  }) => {
    try {
      await upsertMutation.mutateAsync({
        ...data,
        shareWithSponsor: false,
      });
      setShowEditor(false);
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      {/* Today's entry card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="space-y-4">
              <div>
                <Label>Cravings Intensity: {todayEntry.cravings_intensity || 0}/10</Label>
              </div>
              {todayEntry.gratitude && (
                <div>
                  <Label>Gratitude</Label>
                  <p className="text-sm">{todayEntry.gratitude}</p>
                </div>
              )}
              {todayEntry.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{todayEntry.notes}</p>
                </div>
              )}
              <Button onClick={() => setShowEditor(true)}>Edit Entry</Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                No entry for today. Create one to track your recovery journey.
              </p>
              <Button onClick={() => setShowEditor(true)}>Create Entry</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor modal */}
      {showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Today's Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cravings Intensity</Label>
              <Slider
                defaultValue={[todayEntry?.cravings_intensity || 0]}
                max={10}
                step={1}
                onValueChange={([value]) => {
                  handleSave({ cravingsIntensity: value });
                }}
              />
            </div>
            <div>
              <Label>Gratitude</Label>
              <Textarea
                placeholder="What are you grateful for today?"
                defaultValue={todayEntry?.gratitude || ""}
                onBlur={(e) => {
                  handleSave({ gratitude: e.target.value });
                }}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="How are you feeling today?"
                defaultValue={todayEntry?.notes || ""}
                onBlur={(e) => {
                  handleSave({ notes: e.target.value });
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowEditor(false);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent entries */}
      <div className="space-y-2">
        <h3 className="font-semibold">Recent Entries</h3>
        {recentEntries.slice(0, 5).map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {format(new Date(entry.entry_date), "MMM d, yyyy")}
                  </p>
                  {entry.cravings_intensity !== null && (
                    <p className="text-sm text-muted-foreground">
                      Cravings: {entry.cravings_intensity}/10
                    </p>
                  )}
                </div>
                {entry.share_with_sponsor && (
                  <Badge variant="secondary">Shared</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

