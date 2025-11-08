import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationManager } from '@/lib/notifications';
import { useAppStore } from '@/store/useAppStore';

interface NotificationPermissionPrimerProps {
  onDismiss?: () => void;
  onComplete?: (granted: boolean) => void;
}

export default function NotificationPermissionPrimer({
  onDismiss,
  onComplete
}: NotificationPermissionPrimerProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const updateNotificationPermission = useAppStore((state) => state.updateNotificationPermission);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const permission = await notificationManager.requestPermission();
      updateNotificationPermission(permission);

      if (permission === 'granted') {
        onComplete?.(true);
      } else {
        onComplete?.(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      onComplete?.(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    updateNotificationPermission('denied');
    onComplete?.(false);
    onDismiss?.();
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-3">
              <Bell className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Stay on Track</CardTitle>
              <CardDescription>
                Get gentle reminders to support your recovery
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Daily check-in reminders (customizable times)</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Celebrate milestones as you reach them</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Gentle nudges to maintain your streaks</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Respects quiet hours (10 PM - 7 AM by default)</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="flex-1"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isRequesting}
          >
            Skip
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can change notification settings anytime in Settings
        </p>
      </CardContent>
    </Card>
  );
}
