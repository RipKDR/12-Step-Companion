import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Bell, BellOff, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { Meeting } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const REMINDER_OPTIONS = [15, 30, 60];

export default function MeetingReminders() {
  const { toast } = useToast();
  const favoriteMeetings = useAppStore((state) => state.getFavoriteMeetings());
  const meetingsWithReminders = useAppStore((state) => state.getMeetingsWithReminders());
  const setMeetingReminder = useAppStore((state) => state.setMeetingReminder);

  // Get next reminder
  const nextReminder = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    let next: { meeting: Meeting; reminderTime: Date } | null = null;
    let minMinutesUntil = Infinity;

    meetingsWithReminders.forEach(meeting => {
      if (!meeting.reminderEnabled) return;

      const [hours, minutes] = meeting.time.split(':').map(Number);
      const meetingTime = hours * 60 + minutes;
      const reminderTime = meetingTime - meeting.reminderMinutesBefore;

      // Calculate days until next occurrence
      let daysUntil = (meeting.dayOfWeek - currentDay + 7) % 7;
      if (daysUntil === 0 && reminderTime <= currentTime) {
        daysUntil = 7; // Next week
      }

      const minutesUntil = daysUntil * 24 * 60 + reminderTime - currentTime;

      if (minutesUntil >= 0 && minutesUntil < minMinutesUntil) {
        minMinutesUntil = minutesUntil;
        const reminderDate = new Date(now);
        reminderDate.setDate(now.getDate() + daysUntil);
        reminderDate.setHours(Math.floor(reminderTime / 60), reminderTime % 60, 0, 0);
        next = { meeting, reminderTime: reminderDate };
      }
    });

    return next;
  }, [meetingsWithReminders]);

  const handleToggleReminder = (meeting: Meeting, enabled: boolean) => {
    setMeetingReminder(
      meeting.id,
      enabled,
      enabled ? meeting.reminderMinutesBefore || 30 : 0
    );
    toast({
      title: enabled ? 'Reminder enabled' : 'Reminder disabled',
      description: `${meeting.name} reminder ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleChangeReminderTime = (meeting: Meeting, minutes: number) => {
    setMeetingReminder(meeting.id, true, minutes);
    toast({
      title: 'Reminder updated',
      description: `You'll be notified ${minutes} minutes before ${meeting.name}`,
    });
  };

  const formatMeetingTime = (meeting: Meeting): string => {
    const [hours, minutes] = meeting.time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeUntil = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours < 24) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  };

  if (favoriteMeetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Reminders</CardTitle>
          <CardDescription>
            Add meetings to your favorites to set up reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No favorite meetings yet. Use the meeting finder to discover meetings and add them to your favorites.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Next Reminder */}
      {nextReminder && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Next Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{nextReminder.meeting.name}</div>
              <div className="text-sm text-muted-foreground">
                {DAY_NAMES[nextReminder.meeting.dayOfWeek]} at {formatMeetingTime(nextReminder.meeting)}
              </div>
              <div className="text-sm font-medium text-primary">
                Reminder: {formatTimeUntil(nextReminder.reminderTime)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
          <CardDescription>
            Manage reminders for your favorite meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {favoriteMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-start justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{meeting.program}</Badge>
                  <div className="font-medium">{meeting.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {DAY_NAMES[meeting.dayOfWeek]} at {formatMeetingTime(meeting)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={meeting.reminderEnabled}
                    onCheckedChange={(enabled) => handleToggleReminder(meeting, enabled)}
                  />
                  <Label htmlFor={`reminder-${meeting.id}`} className="text-sm">
                    {meeting.reminderEnabled ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
                {meeting.reminderEnabled && (
                  <Select
                    value={meeting.reminderMinutesBefore.toString()}
                    onValueChange={(value) => handleChangeReminderTime(meeting, parseInt(value, 10))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {minutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

