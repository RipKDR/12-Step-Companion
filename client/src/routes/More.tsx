import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Library,
  Settings,
  BarChart3,
  Users,
  Trophy,
  Phone,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    title: 'Worksheets',
    description: 'Recovery worksheets and exercises',
    icon: FileText,
    path: '/worksheets',
    testId: 'more-worksheets'
  },
  {
    title: 'Meetings',
    description: 'Track your meeting attendance',
    icon: Users,
    path: '/meetings',
    testId: 'more-meetings'
  },
  {
    title: 'Resources',
    description: 'Helpful recovery resources',
    icon: Library,
    path: '/resources',
    testId: 'more-resources'
  },
  {
    title: 'Contacts',
    description: 'Sponsor and fellowship contacts',
    icon: Phone,
    path: '/contacts',
    testId: 'more-contacts'
  },
  {
    title: 'Achievements',
    description: 'View your progress and milestones',
    icon: Trophy,
    path: '/achievements',
    testId: 'more-achievements'
  },
  {
    title: 'Analytics',
    description: 'Track your recovery journey',
    icon: BarChart3,
    path: '/analytics',
    testId: 'more-analytics'
  },
  {
    title: 'Settings',
    description: 'App preferences and data',
    icon: Settings,
    path: '/settings',
    testId: 'more-settings'
  },
];

export default function More() {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-32 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          More
        </h1>
        <p className="text-base text-muted-foreground">
          Additional tools and resources
        </p>
      </header>

      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
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
