/**
 * Sponsor Dashboard Client Component
 * 
 * Client-side component for viewing sponsee shared data
 */

"use client";

import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SponsorDashboardClientProps {
  sponseeId: string;
}

export function SponsorDashboardClient({ sponseeId }: SponsorDashboardClientProps) {
  // Note: These queries will need to be added to the sponsor router
  // For now, this is a placeholder showing the structure
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Shared Step Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Step entries shared by sponsee will appear here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared Daily Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Daily entries shared by sponsee will appear here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared Action Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Action plans shared by sponsee will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

