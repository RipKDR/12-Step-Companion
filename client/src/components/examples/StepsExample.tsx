/**
 * Steps Component Example - tRPC Integration
 * 
 * This is an example component showing how to migrate from local state
 * to tRPC. Compare this with the existing Steps.tsx component.
 * 
 * To use: Gradually replace parts of Steps.tsx with this pattern
 */

import { useState } from "react";
import { useSteps, useStepEntries, useUpsertStepEntry } from "@/hooks/useSteps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export function StepsExample() {
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(null);
  const [program, setProgram] = useState<"NA" | "AA">("NA");

  // Load steps using tRPC
  const { steps, isLoading: stepsLoading } = useSteps(program);
  
  // Load user's step entries
  const { entries, isLoading: entriesLoading } = useStepEntries();

  // Mutation for saving step work
  const upsertMutation = useUpsertStepEntry();

  const selectedStep = steps.find((s) => s.step_number === selectedStepNumber);
  const selectedStepEntry = entries.find(
    (e) => e.step_id === selectedStep?.id
  );

  const handleSave = async (content: Record<string, unknown>) => {
    if (!selectedStep) return;

    try {
      await upsertMutation.mutateAsync({
        stepId: selectedStep.id,
        content,
        isSharedWithSponsor: false, // User can toggle this
      });
      // Success! tRPC will automatically refetch entries
    } catch (error) {
      console.error("Failed to save step entry:", error);
    }
  };

  if (stepsLoading || entriesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Program selector */}
      <div className="flex gap-2">
        <Button
          variant={program === "NA" ? "default" : "outline"}
          onClick={() => setProgram("NA")}
        >
          NA
        </Button>
        <Button
          variant={program === "AA" ? "default" : "outline"}
          onClick={() => setProgram("AA")}
        >
          AA
        </Button>
      </div>

      {/* Steps list */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const entry = entries.find((e) => e.step_id === step.id);
          const hasEntry = !!entry;

          return (
            <Card
              key={step.id}
              className={`cursor-pointer ${
                selectedStepNumber === step.step_number ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedStepNumber(step.step_number)}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm">
                  Step {step.step_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {hasEntry && (
                  <Badge variant="secondary" className="text-xs">
                    Started
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Step detail */}
      {selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedStep.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedStep.prompts.map((prompt, index) => (
                <div key={index}>
                  <label className="text-sm font-medium">{prompt}</label>
                  <Textarea
                    placeholder="Your answer..."
                    defaultValue={
                      selectedStepEntry?.content?.[`q${index + 1}`] as string
                    }
                    onBlur={(e) => {
                      const content = {
                        ...selectedStepEntry?.content,
                        [`q${index + 1}`]: e.target.value,
                      };
                      handleSave(content);
                    }}
                  />
                </div>
              ))}

              {upsertMutation.isPending && (
                <p className="text-sm text-muted-foreground">Saving...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

