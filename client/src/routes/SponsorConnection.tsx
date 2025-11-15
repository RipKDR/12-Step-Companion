import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ConnectionFlow from '@/components/sponsor-connection/ConnectionFlow';
import SponsorDashboard from '@/components/sponsor-connection/SponsorDashboard';
import SponsorMessaging from '@/components/sponsor-connection/SponsorMessaging';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, BarChart3 } from 'lucide-react';

export default function SponsorConnection() {
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const getActiveRelationships = useAppStore((state) => state.getActiveRelationships);
  
  const relationships = getActiveRelationships();
  const selectedRelationship = relationships.find((rel) => rel.id === selectedRelationshipId);
  
  // Check if user has any sponsor relationships (as sponsor)
  const sponsorRelationships = relationships.filter((rel) => rel.role === 'sponsor');
  const sponseeRelationships = relationships.filter((rel) => rel.role === 'sponsee');

  return (
    <div className="max-w-4xl mx-auto px-6 pb-8 sm:pb-12 pt-6">
      <header className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sponsor Connection
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Connect with your sponsor or sponsee to share recovery progress
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection" className="min-h-[44px]">
            <Users className="h-4 w-4 mr-2" />
            Connection
          </TabsTrigger>
          {sponsorRelationships.length > 0 && (
            <TabsTrigger value="dashboard" className="min-h-[44px]">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          )}
          {selectedRelationship && (
            <TabsTrigger value="messages" className="min-h-[44px]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="connection" className="mt-6">
          <ConnectionFlow />
        </TabsContent>

        {sponsorRelationships.length > 0 && (
          <TabsContent value="dashboard" className="mt-6">
            <SponsorDashboard />
          </TabsContent>
        )}

        {selectedRelationship && (
          <TabsContent value="messages" className="mt-6">
            <SponsorMessaging
              relationshipId={selectedRelationship.id}
              relationship={selectedRelationship}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick access to messaging from relationships */}
      {sponseeRelationships.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sponseeRelationships.map((relationship) => (
              <div
                key={relationship.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedRelationshipId(relationship.id)}
              >
                <div>
                  <div className="font-medium">
                    {relationship.sponsorName || 'Sponsor'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {relationship.status === 'active' ? 'Active' : 'Pending'}
                  </div>
                </div>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

