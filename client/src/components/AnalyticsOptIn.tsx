/**
 * Analytics Opt-In Component
 * 
 * Allows users to opt in/out of anonymous analytics tracking
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { hasOptedIn, setOptIn, initPostHog } from "@/lib/posthog";

export function AnalyticsOptIn() {
  const [optedIn, setOptedInState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOptedInState(hasOptedIn());
    setLoading(false);
  }, []);

  const handleToggle = (checked: boolean) => {
    setOptedInState(checked);
    setOptIn(checked);
    if (checked) {
      initPostHog();
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Privacy</CardTitle>
        <CardDescription>
          Help us improve the app with anonymous usage data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics-opt-in">Anonymous Analytics</Label>
            <p className="text-sm text-muted-foreground">
              We track feature usage anonymously. No personal information is collected.
            </p>
          </div>
          <Switch
            id="analytics-opt-in"
            checked={optedIn}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}

