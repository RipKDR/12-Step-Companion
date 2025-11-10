import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { FellowshipContact } from '@/types';
import { Clock, MessageCircle, Shuffle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WarmlineQueueProps {
  contacts: FellowshipContact[];
  onConfirmContact?: (contact: FellowshipContact) => void;
  onSkip?: (nextContact: FellowshipContact) => void;
}

const ROTATION_INTERVAL_MS = 15000;

const formatCheckInRelative = (iso?: string) => {
  if (!iso) return 'No check-in yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'No check-in yet';
  return `${formatDistanceToNow(date, { addSuffix: true })}`;
};

export default function WarmlineQueue({ contacts, onConfirmContact, onSkip }: WarmlineQueueProps) {
  const availableContacts = useMemo(
    () => contacts.filter((contact) => contact.status === 'available' || contact.onCall),
    [contacts]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consentPromptOpen, setConsentPromptOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentIndex(0);
  }, [availableContacts.length]);

  useEffect(() => {
    if (availableContacts.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((previous) => {
        const nextIndex = (previous + 1) % availableContacts.length;
        if (onSkip && availableContacts.length > 0) {
          const nextContact = availableContacts[nextIndex];
          if (nextContact) {
            onSkip(nextContact);
          }
        }
        return nextIndex;
      });
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [availableContacts, onSkip]);

  if (availableContacts.length === 0) {
    return null;
  }

  const currentContact = availableContacts[currentIndex] ?? availableContacts[0];

  const handleAdvance = () => {
    if (availableContacts.length <= 1) return;
    const nextIndex = (currentIndex + 1) % availableContacts.length;
    setCurrentIndex(nextIndex);
    const nextContact = availableContacts[nextIndex];
    if (onSkip && nextContact) {
      onSkip(nextContact);
    }
  };

  const handleConsent = () => {
    setConsentPromptOpen(true);
  };

  const handleConfirm = () => {
    setConsentPromptOpen(false);
    if (!currentContact) {
      toast({
        title: 'No warmline buddy available',
        description: 'Everyone seems to be offline. Consider reaching out manually.',
      });
      return;
    }

    onConfirmContact?.(currentContact);
  };

  return (
    <>
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Warmline Queue</CardTitle>
          <CardDescription>
            Rotate through available peers and confirm their consent before connecting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{currentContact?.name}</h3>
              {currentContact?.warmlineRole && (
                <Badge variant="secondary" className="text-xs uppercase">
                  {currentContact.warmlineRole}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {currentContact?.status ?? 'available'}
              </Badge>
              {currentContact?.onCall && (
                <Badge className="text-xs">On Call</Badge>
              )}
            </div>
            {currentContact?.availability && currentContact.availability.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Active window: {currentContact.availability[0].day} {currentContact.availability[0].startTime} -
                {` ${currentContact.availability[0].endTime}`}
              </p>
            )}
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last check-in {formatCheckInRelative(currentContact?.lastCheckInISO)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleAdvance} disabled={availableContacts.length <= 1}>
              <Shuffle className="h-4 w-4 mr-2" />
              Rotate
            </Button>
            <Button onClick={handleConsent}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Request Consent
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={consentPromptOpen} onOpenChange={setConsentPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect with {currentContact?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Make sure {currentContact?.name ?? 'this buddy'} is ready to support before sending a message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
