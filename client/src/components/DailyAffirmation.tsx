import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import affirmationsData from '@/data/affirmations.json';

interface DailyAffirmationProps {
  date: Date;
}

export default function DailyAffirmation({ date }: DailyAffirmationProps) {
  const affirmation = useMemo(() => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % affirmationsData.length;
    return affirmationsData[index];
  }, [date]);

  return (
    <Card 
      className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden" 
      data-testid="card-affirmation"
    >
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/20 text-primary shrink-0">
            <Sparkles className="h-5 w-5" data-testid="icon-sparkles" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              Daily Affirmation
            </p>
            <p className="text-base font-medium leading-relaxed text-foreground" data-testid="text-affirmation">
              "{affirmation.text}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
