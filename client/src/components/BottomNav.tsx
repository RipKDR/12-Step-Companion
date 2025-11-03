import { Link, useLocation } from 'wouter';
import { Home, BookOpen, BookMarked, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home', testId: 'nav-home' },
  { path: '/steps', icon: BookOpen, label: 'Steps', testId: 'nav-steps' },
  { path: '/journal', icon: BookMarked, label: 'Journal', testId: 'nav-journal' },
  { path: '/worksheets', icon: FileText, label: 'Worksheets', testId: 'nav-worksheets' },
  { path: '/settings', icon: Settings, label: 'Settings', testId: 'nav-settings' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-40 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[60px] rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover-elevate'
                }`}
                data-testid={item.testId}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon 
                  className="h-5 w-5" 
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-regular'}`}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
