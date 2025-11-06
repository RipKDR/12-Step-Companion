import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, User } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface SponsorCardProps {
  sponsorName?: string;
  sponsorPhone?: string;
  onEdit: () => void;
  testId?: string;
}

export default function SponsorCard({
  sponsorName,
  sponsorPhone,
  onEdit,
  testId = 'sponsor-card',
}: SponsorCardProps) {
  const handleCall = () => {
    if (sponsorPhone) {
      haptics.success();
      window.location.href = `tel:${sponsorPhone}`;
    }
  };

  const handleText = () => {
    if (sponsorPhone) {
      haptics.success();
      window.location.href = `sms:${sponsorPhone}`;
    }
  };

  if (!sponsorName || !sponsorPhone) {
    return (
      <Card className="w-full border-2 border-dashed" data-testid={testId}>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">Add Your Sponsor</p>
            <p className="text-sm text-muted-foreground mb-4">
              Quick access when you need support
            </p>
            <Button onClick={onEdit} data-testid={`${testId}-add-button`}>
              Add Sponsor Info
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <User className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">My Sponsor</CardTitle>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          data-testid={`${testId}-edit-button`}
        >
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xl font-semibold" data-testid={`${testId}-name`}>
            {sponsorName}
          </p>
          <p className="text-sm text-muted-foreground" data-testid={`${testId}-phone`}>
            {sponsorPhone}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCall}
            className="gap-2"
            data-testid={`${testId}-call-button`}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            onClick={handleText}
            variant="outline"
            className="gap-2"
            data-testid={`${testId}-text-button`}
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
