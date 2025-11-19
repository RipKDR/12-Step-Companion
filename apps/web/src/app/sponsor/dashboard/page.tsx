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

export default async function SponsorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const supabase = createSupabaseServerClient();
  
  // Get sponsor relationships where current user is the sponsor
  const { data: relationships, error } = await supabase
    .from("sponsor_relationships")
    .select("*, sponsee:profiles!sponsor_relationships_sponsee_id_fkey(*)")
    .eq("sponsor_id", (session.user as any).id)
    .eq("status", "active");

  if (error) {
    console.error("Failed to fetch sponsor relationships:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sponsor Dashboard</h1>
      
      {relationships && relationships.length > 0 ? (
        <div className="space-y-6">
          {relationships.map((relationship: any) => (
            <div key={relationship.id} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {relationship.sponsee?.handle || "Sponsee"}
              </h2>
              <SponsorDashboardClient sponseeId={relationship.sponsee_id} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No active sponsees. Share your sponsor code to connect.</p>
      )}
    </div>
  );
}

