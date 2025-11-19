/**
 * Sponsee View Page
 * Shows shared recovery data for a specific sponsee
 */

export default async function SponseePage({
  params,
}: {
  params: Promise<{ sponseeId: string }>;
}) {
  const { sponseeId } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sponsee View</h1>
      <p className="text-gray-600">Sponsee ID: {sponseeId}</p>
      {/* TODO: Implement shared data display */}
    </div>
  );
}

