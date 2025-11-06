import { Link, useLocation } from 'wouter';
import { Home, BookOpen, BookMarked, FileText, Settings, Library } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home', testId: 'nav-home' },
  { path: '/steps', icon: BookOpen, label: 'Steps', testId: 'nav-steps' },
  { path: '/journal', icon: BookMarked, label: 'Journal', testId: 'nav-journal' },
  { path: '/worksheets', icon: FileText, label: 'Worksheets', testId: 'nav-worksheets' },
  { path: '/resources', icon: Library, label: 'Resources', testId: 'nav-resources' },
  { path: '/settings', icon: Settings, label: 'Settings', testId: 'nav-settings' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-card-border z-40 safe-area-bottom shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-2 min-w-[60px] rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover-elevate active-elevate-2'
              }`}
              data-testid={item.testId}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20" />
              )}
              <Icon 
                className={`h-5 w-5 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`}
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
              <span className={`text-xs relative z-10 transition-all ${isActive ? 'font-semibold' : 'font-regular'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
