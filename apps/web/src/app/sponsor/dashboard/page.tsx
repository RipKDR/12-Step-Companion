/**
 * Sponsor Dashboard
 * 
 * View shared items from sponsees
 */

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { SponsorDashboardClient } from "../../../components/SponsorDashboardClient";
import type { Session } from "next-auth";

export default async function SponsorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const supabase = createSupabaseServerClient();
  
  // Get sponsor relationships where current user is the sponsor
  const sponsorId = session.user.id;
  const { data: relationships, error } = await supabase
    .from("sponsor_relationships")
    .select("id, sponsee_id, sponsee:profiles!sponsor_relationships_sponsee_id_fkey(handle)")
    .eq("sponsor_id", sponsorId)
    .eq("status", "active");

  if (error) {
    // Log error without exposing PII
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch sponsor relationships:", error);
    }
  }

  interface SponsorRelationship {
    id: string;
    sponsee_id: string;
    sponsee?: {
      handle?: string | null;
    } | null;
  }

  // Type guard to ensure relationships match expected type
  const typedRelationships = (relationships || []) as SponsorRelationship[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sponsor Dashboard</h1>
      
      {typedRelationships && typedRelationships.length > 0 ? (
        <div className="space-y-6">
          {typedRelationships.map((relationship: SponsorRelationship) => (
            <div key={relationship.id} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {relationship.sponsee?.handle || "Sponsee"}
              </h2>
              <SponsorDashboardClient sponseeId={relationship.sponsee_id} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No active sponsees. Share your sponsor code to connect.</p>
      )}
    </div>
  );
}

