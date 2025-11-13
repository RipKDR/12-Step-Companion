import { FileText, BookMarked, AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface TodayShortcut {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  iconBgColor: string;
  iconColor: string;
}

const shortcuts: TodayShortcut[] = [
  {
    title: 'Step Work',
    subtitle: 'Continue Step 4',
    icon: FileText,
    path: '/steps',
    iconBgColor: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    title: 'Journal',
    subtitle: 'Capture what actually happened today',
    icon: BookMarked,
    path: '/journal',
    iconBgColor: 'bg-purple-500/20',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Emergency',
    subtitle: 'Open your support plan instantly',
    icon: AlertCircle,
    path: '/emergency',
    iconBgColor: 'bg-destructive/20',
    iconColor: 'text-destructive',
  },
  {
    title: 'Insights',
    subtitle: 'Patterns, triggers, and progress view',
    icon: BarChart3,
    path: '/analytics',
    iconBgColor: 'bg-purple-500/20',
    iconColor: 'text-purple-500',
  },
];

interface TodayShortcutsProps {
  currentStep?: number;
}

export default function TodayShortcuts({ currentStep = 4 }: TodayShortcutsProps) {
  // Update Step Work subtitle with current step
  const shortcutsWithStep = shortcuts.map((shortcut) => {
    if (shortcut.title === 'Step Work') {
      return {
        ...shortcut,
        subtitle: `Continue Step ${currentStep}`,
      };
    }
    return shortcut;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Today shortcuts</h2>
        <span className="text-xs text-muted-foreground">Curated from your routine</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {shortcutsWithStep.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link key={shortcut.path} href={shortcut.path}>
              <Card className="bg-card-gradient border-card-border cursor-pointer hover-elevate active-elevate-2 transition-smooth card-hover glow-card">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", shortcut.iconBgColor)}>
                      <Icon className={cn("h-6 w-6", shortcut.iconColor)} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-0.5">
                        {shortcut.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shortcut.subtitle}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

