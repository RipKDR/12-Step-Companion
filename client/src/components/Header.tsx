import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  currentPage?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export default function Header({ 
  currentPage = 'HOME', 
  onMenuClick, 
  onNotificationClick 
}: HeaderProps) {
  // Placeholder for notifications - will be implemented in MID-5
  const unreadCount = 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          data-testid="button-menu"
          aria-label="Open menu"
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center: Logo + Breadcrumb Pill */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-semibold tracking-wider text-foreground">
              RECOVERY COMPANION
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <span className="text-xs font-medium text-muted-foreground">
            {currentPage}
          </span>
        </div>

        {/* Right: Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationClick}
          data-testid="button-notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className="relative h-9 w-9"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
