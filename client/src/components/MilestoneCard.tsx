import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

interface Milestone {
  days: number;
  title: string;
  description: string;
  icon: typeof Trophy;
  achieved: boolean;
}

export default function MilestoneCard() {
  const profile = useAppStore((state) => state.profile);

  if (!profile?.cleanDate) {
    return null;
  }

  const cleanDate = new Date(profile.cleanDate);
  const now = new Date();
  const daysClean = differenceInDays(now, cleanDate);
  const monthsClean = differenceInMonths(now, cleanDate);
  const yearsClean = differenceInYears(now, cleanDate);

  const milestones: Milestone[] = [
    { days: 1, title: '24 Hours', description: 'First day clean', icon: Star, achieved: daysClean >= 1 },
    { days: 7, title: '1 Week', description: '7 days of recovery', icon: Sparkles, achieved: daysClean >= 7 },
    { days: 30, title: '30 Days', description: 'One month clean', icon: Award, achieved: daysClean >= 30 },
    { days: 60, title: '60 Days', description: 'Two months clean', icon: Trophy, achieved: daysClean >= 60 },
    { days: 90, title: '90 Days', description: 'Three months clean', icon: Trophy, achieved: daysClean >= 90 },
    { days: 180, title: '6 Months', description: 'Half a year clean', icon: Trophy, achieved: daysClean >= 180 },
    { days: 365, title: '1 Year', description: 'One year of recovery', icon: Trophy, achieved: daysClean >= 365 },
    { days: 730, title: '2 Years', description: 'Two years clean', icon: Trophy, achieved: daysClean >= 730 },
    { days: 1095, title: '3 Years', description: 'Three years clean', icon: Trophy, achieved: daysClean >= 1095 },
  ];

  const nextMilestone = milestones.find(m => !m.achieved);
  const achievedMilestones = milestones.filter(m => m.achieved);
  const mostRecentMilestone = achievedMilestones[achievedMilestones.length - 1];

  const daysToNext = nextMilestone ? nextMilestone.days - daysClean : 0;

  const getMilestoneMessage = () => {
    if (yearsClean >= 3) {
      return `${yearsClean} years clean - Keep going strong!`;
    } else if (monthsClean >= 12) {
      return `${yearsClean} year${yearsClean > 1 ? 's' : ''} clean - Amazing progress!`;
    } else if (monthsClean >= 6) {
      return `${monthsClean} months clean - You're doing great!`;
    } else if (daysClean >= 90) {
      return `${daysClean} days clean - Incredible journey!`;
    } else if (daysClean >= 30) {
      return `${daysClean} days clean - Keep it up!`;
    } else if (daysClean >= 7) {
      return `${daysClean} days clean - One day at a time!`;
    } else if (daysClean >= 1) {
      return `${daysClean} day${daysClean > 1 ? 's' : ''} clean - You've got this!`;
    } else {
      return 'Welcome to your recovery journey!';
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20" data-testid="card-milestone">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Milestones
          </CardTitle>
          <Badge variant="secondary" data-testid="badge-achievements">
            {achievedMilestones.length} / {milestones.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-1">Current Achievement</p>
          <p className="text-lg font-semibold text-primary" data-testid="text-milestone-message">
            {getMilestoneMessage()}
          </p>
        </div>

        {nextMilestone && (
          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Next Milestone</span>
              <Badge variant="outline" className="text-xs">
                {daysToNext} day{daysToNext !== 1 ? 's' : ''} to go
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <nextMilestone.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm">{nextMilestone.title}</p>
                <p className="text-xs text-muted-foreground">{nextMilestone.description}</p>
              </div>
            </div>
          </div>
        )}

        {mostRecentMilestone && (
          <div className="text-center text-sm text-muted-foreground">
            Last achieved: <span className="font-semibold text-primary">{mostRecentMilestone.title}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
