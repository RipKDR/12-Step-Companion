import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, BookOpen, BookMarked, BarChart3, AlertCircle, MoreHorizontal, ChevronUp } from 'lucide-react';
import { haptics } from '@/lib/haptics';

const navItems = [
  { path: '/', icon: Home, label: 'Home', testId: 'nav-home' },
  { path: '/steps', icon: BookOpen, label: 'Steps', testId: 'nav-steps' },
  { path: '/journal', icon: BookMarked, label: 'Journal', testId: 'nav-journal' },
  { path: '/analytics', icon: BarChart3, label: 'Insights', testId: 'nav-insights' },
  { path: '/emergency', icon: AlertCircle, label: 'Emergency', testId: 'nav-emergency' },
  { path: '/more', icon: MoreHorizontal, label: 'More', testId: 'nav-more' },
];

export default function BottomNav() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const navRef = useRef<HTMLElement>(null);
  const gestureZoneRef = useRef<HTMLDivElement>(null);
  const isSwipeFromBottomRef = useRef(false);

  const minSwipeDistance = 50;
  const bottomGestureZoneHeight = 100;

  useEffect(() => {
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasCoarsePointer || hasTouchSupport);
    
    if (!hasCoarsePointer && !hasTouchSupport) {
      setIsVisible(true);
    }
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    const startY = e.touches[0].clientY;
    touchStartY.current = startY;
    
    const windowHeight = window.innerHeight;
    const isBottomZone = startY > windowHeight - bottomGestureZoneHeight;
    isSwipeFromBottomRef.current = isBottomZone;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isSwipeFromBottomRef.current) return;
    touchEndY.current = e.touches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!isSwipeFromBottomRef.current) {
      isSwipeFromBottomRef.current = false;
      return;
    }

    const swipeDistance = touchStartY.current - touchEndY.current;
    const isSwipeUp = swipeDistance > minSwipeDistance;
    const isSwipeDown = swipeDistance < -minSwipeDistance;

    if (isSwipeUp && !isVisible) {
      setIsVisible(true);
    } else if (isSwipeDown && isVisible) {
      setIsVisible(false);
    }
    
    isSwipeFromBottomRef.current = false;
  };

  useEffect(() => {
    if (!isTouchDevice) return;

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isVisible, isTouchDevice]);

  const shouldHideNav = isTouchDevice && !isVisible;

  return (
    <>
      {/* Swipe indicator when nav is hidden on touch devices */}
      {isTouchDevice && !isVisible && (
        <div 
          ref={gestureZoneRef}
          className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
        >
          <div className="flex justify-center pb-2">
            <div className="bg-muted/60 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
              <ChevronUp className="h-3 w-3 text-muted-foreground animate-bounce" />
              <span className="text-xs text-muted-foreground">Swipe up for menu</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 z-40 pb-3 sm:pb-4 px-3 sm:px-4 transition-transform duration-300 ease-out"
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={shouldHideNav}
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          transform: isTouchDevice && !isVisible ? 'translateY(calc(100% + 1rem))' : 'translateY(0)',
        }}
      >
        <div className="bg-card-gradient border border-card-border rounded-2xl shadow-lg max-w-2xl mx-auto">
          <div className="flex justify-around items-center gap-0.5 p-1.5 sm:p-2">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path === '/' && location === '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex flex-col items-center justify-center gap-1 px-2 py-2.5 flex-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground active-elevate-2'
                  }`}
                  data-testid={item.testId}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  role="link"
                  onClick={() => {
                    haptics.light();
                    if (isTouchDevice) setIsVisible(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      haptics.light();
                      if (isTouchDevice) setIsVisible(false);
                    }
                  }}
                  tabIndex={isTouchDevice && !isVisible ? -1 : 0}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-foreground' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
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
    </>
  );
}
