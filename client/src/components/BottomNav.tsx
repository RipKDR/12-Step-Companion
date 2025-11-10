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
      className="fixed bottom-0 left-0 right-0 z-40 pb-3 sm:pb-4 px-3 sm:px-4"
      role="navigation"
      aria-label="Main navigation"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg max-w-md mx-auto">
        <div className="flex justify-around items-center gap-1 p-1.5 sm:p-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 min-w-[72px] rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground active-elevate-2'
                }`}
                data-testid={item.testId}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2}
                />
                <span className={`text-xs transition-all duration-200 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
