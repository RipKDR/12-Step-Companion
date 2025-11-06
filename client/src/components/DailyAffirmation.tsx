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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="card-affirmation">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" data-testid="icon-sparkles" />
          <div className="flex-1">
            <p className="text-lg font-medium leading-relaxed" data-testid="text-affirmation">
              {affirmation.text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
