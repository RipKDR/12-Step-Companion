/**
 * Sponsee View Page
 * Shows shared recovery data for a specific sponsee
 */

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SponseeViewClient } from "../../../components/SponseeViewClient";

export default async function SponseePage({
  params,
}: {
  params: Promise<{ sponseeId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const { sponseeId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sponsee Recovery Data</h1>
      <SponseeViewClient sponseeId={sponseeId} />
    </div>
  );
}
