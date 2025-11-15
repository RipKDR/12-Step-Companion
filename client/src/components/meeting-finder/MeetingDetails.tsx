import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  ExternalLink, 
  Calendar, 
  Star,
  Phone,
  Link as LinkIcon,
  Navigation
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { exportMeetingToCalendar, downloadICS } from '@/lib/calendar-export';
import { openMeetingGuide } from '@/lib/aa-meetings';
import type { Meeting } from '@/types';
import { formatDistance } from '@/lib/location';

interface MeetingDetailsProps {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogAttendance?: (meeting: Meeting) => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MeetingDetails({ 
  meeting, 
  open, 
  onOpenChange,
  onLogAttendance 
}: MeetingDetailsProps) {
  const { toast } = useToast();
  const isFavorite = useAppStore((state) => state.isFavoriteMeeting(meeting.id));
  const addFavoriteMeeting = useAppStore((state) => state.addFavoriteMeeting);
  const removeFavoriteMeeting = useAppStore((state) => state.removeFavoriteMeeting);
  const setMeetingReminder = useAppStore((state) => state.setMeetingReminder);
  const profile = useAppStore((state) => state.profile);

  const formatMeetingTime = (meeting: Meeting): string => {
    const [hours, minutes] = meeting.time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteMeeting(meeting.id);
      toast({
        title: 'Removed from favorites',
        description: `${meeting.name} removed from favorites`,
      });
    } else {
      addFavoriteMeeting(meeting.id);
      toast({
        title: 'Added to favorites',
        description: `${meeting.name} added to favorites`,
      });
    }
  };

  const handleExportCalendar = () => {
    const icsContent = exportMeetingToCalendar(meeting);
    const filename = `${meeting.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    downloadICS(icsContent, filename);
    toast({
      title: 'Calendar export',
      description: 'Meeting added to calendar file',
    });
  };

  const handleGetDirections = () => {
    if (meeting.location?.lat && meeting.location?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${meeting.location.lat},${meeting.location.lng}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Directions unavailable',
        description: 'Location coordinates not available for this meeting',
        variant: 'destructive',
      });
    }
  };

  const handleOpenAA = () => {
    if (meeting.program === 'AA') {
      openMeetingGuide(meeting.sourceId, profile?.timezone);
    } else {
      toast({
        title: 'AA Meeting Guide',
        description: 'This feature is for AA meetings only',
      });
    }
  };

  const handleSetReminder = () => {
    const currentReminder = meeting.reminderEnabled ? meeting.reminderMinutesBefore : 30;
    const newMinutes = currentReminder === 15 ? 30 : currentReminder === 30 ? 60 : 15;
    setMeetingReminder(meeting.id, true, newMinutes);
    toast({
      title: 'Reminder set',
      description: `You'll be notified ${newMinutes} minutes before the meeting`,
    });
  };

  const handleLogAttendance = () => {
    if (onLogAttendance) {
      onLogAttendance(meeting);
    } else {
      // Default behavior: add to meeting log
      const store = useAppStore.getState();
      const today = new Date().toISOString().split('T')[0];
      const loggedMeeting: Meeting = {
        ...meeting,
        id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: today,
        createdAtISO: new Date().toISOString(),
        updatedAtISO: new Date().toISOString(),
      };
      
      useAppStore.setState({
        meetings: [...(store.meetings || []), loggedMeeting],
      });
      
      toast({
        title: 'Meeting logged',
        description: 'Your attendance has been recorded',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{meeting.program}</Badge>
                <Badge variant={meeting.format === 'online' ? 'secondary' : 'default'}>
                  {meeting.format}
                </Badge>
                <Badge variant="outline">{meeting.type}</Badge>
              </div>
              <DialogTitle className="text-xl">{meeting.name}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        <DialogDescription className="space-y-4">
          {/* Time and Day */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {DAY_NAMES[meeting.dayOfWeek]} at {formatMeetingTime(meeting)}
            </span>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{meeting.location.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {meeting.location.address}
                    <br />
                    {meeting.location.city}
                    {meeting.location.state && `, ${meeting.location.state}`}
                    {meeting.location.zip && ` ${meeting.location.zip}`}
                    <br />
                    {meeting.location.country}
                  </div>
                  {meeting.distanceKm && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistance(meeting.distanceKm)} away
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Online Details */}
          {meeting.onlineDetails && (
            <div className="space-y-2">
              <Separator />
              <div className="font-medium">Online Meeting Details</div>
              {meeting.onlineDetails.link && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={meeting.onlineDetails.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Join online meeting
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {meeting.onlineDetails.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${meeting.onlineDetails.phone}`} className="text-primary hover:underline">
                    {meeting.onlineDetails.phone}
                  </a>
                  {meeting.onlineDetails.accessCode && (
                    <span className="text-sm text-muted-foreground">
                      (Access Code: {meeting.onlineDetails.accessCode})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <>
              <Separator />
              <div>
                <div className="font-medium mb-1">Notes</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {meeting.notes}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleLogAttendance} className="w-full">
              Log Attendance
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleFavorite}
              className="w-full"
            >
              <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            </Button>
            {meeting.location && (
              <Button
                variant="outline"
                onClick={handleGetDirections}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleExportCalendar}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
            {meeting.program === 'AA' && (
              <Button
                variant="outline"
                onClick={handleOpenAA}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Meeting Guide
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSetReminder}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              {meeting.reminderEnabled 
                ? `Reminder: ${meeting.reminderMinutesBefore} min`
                : 'Set Reminder'
              }
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

