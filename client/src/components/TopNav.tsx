import { Menu, Sparkles, Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TopNavProps {
  notificationCount?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

const pageLabels: Record<string, string> = {
  '/': 'HOME',
  '/steps': 'STEPS',
  '/journal': 'JOURNAL',
  '/analytics': 'INSIGHTS',
  '/emergency': 'EMERGENCY',
  '/more': 'MORE',
};

export default function TopNav({ 
  notificationCount = 0,
  onMenuClick,
  onNotificationClick 
}: TopNavProps) {
  const [location] = useLocation();
  const currentPageLabel = pageLabels[location] || 'HOME';

  return (
    <nav 
      className="sticky top-0 z-50 w-full bg-card-gradient border-b border-card-border glow-card"
      role="navigation"
      aria-label="Top navigation"
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* App Name with Star Icon */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-wide text-foreground">
              RECOVERY COMPANION
            </span>
          </div>

          {/* Current Page Indicator */}
          <Badge 
            variant="secondary" 
            className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary border-primary/30"
          >
            {currentPageLabel}
          </Badge>

          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span 
                  className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground border-2 border-card"
                  aria-hidden="true"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

