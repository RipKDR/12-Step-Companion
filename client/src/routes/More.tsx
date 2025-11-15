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
  ChevronRight,
  Bot,
  UserCheck
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
    title: 'Sponsor Connection',
    description: 'Connect and share with your sponsor',
    icon: UserCheck,
    path: '/sponsor-connection',
    testId: 'more-sponsor-connection'
  },
  {
    title: 'AI Sponsor',
    description: '24/7 supportive chat for guidance and validation',
    icon: Bot,
    path: '/ai-sponsor',
    testId: 'more-ai-sponsor'
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
    <div className="max-w-4xl mx-auto px-6 pb-8 sm:pb-12 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          More
        </h1>
        <p className="text-base text-muted-foreground">
          Additional tools and resources
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <Card 
                className="cursor-pointer hover-elevate transition-smooth card-hover button-press h-full" 
                data-testid={item.testId}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
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
