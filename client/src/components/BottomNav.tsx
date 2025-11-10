import { Link, useLocation } from 'wouter';
import { Home, BookOpen, BookMarked, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home', testId: 'nav-home' },
  { path: '/steps', icon: BookOpen, label: 'Steps', testId: 'nav-steps' },
  { path: '/journal', icon: BookMarked, label: 'Journal', testId: 'nav-journal' },
  { path: '/more', icon: MoreHorizontal, label: 'More', testId: 'nav-more' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-40 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
      style={{
        boxShadow: '0 -1px 3px 0 rgb(0 0 0 / 0.05)'
      }}
    >
      <div className="flex justify-around items-center gap-2 h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover-elevate'
              }`}
              data-testid={item.testId}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                className="h-5 w-5 transition-transform duration-200"
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 0 : 2}
                style={isActive ? { transform: 'scale(1.05)' } : undefined}
              />
              <span className={`text-xs transition-all duration-200 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
