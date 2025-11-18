import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export default function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-50 pointer-events-none">
      <Card className="max-w-md mx-auto shadow-lg border-primary pointer-events-auto">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Update Available</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A new version of Recovery Companion is ready. Update now to get the latest features and improvements.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={onUpdate}
                  data-testid="button-update-app"
                >
                  Update Now
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsVisible(false);
                    onDismiss();
                  }}
                  data-testid="button-dismiss-update"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              data-testid="button-close-update"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
