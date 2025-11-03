import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface DailyCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  completed: boolean;
  onChange: (value: string) => void;
  onComplete: () => void;
  testId?: string;
}

export default function DailyCard({
  title,
  icon,
  value,
  completed,
  onChange,
  onComplete,
  testId = 'daily-card',
}: DailyCardProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <Button
          size="icon"
          variant={completed ? 'default' : 'outline'}
          onClick={onComplete}
          data-testid={`${testId}-complete-button`}
          aria-label={completed ? 'Completed' : 'Mark as complete'}
        >
          <Check className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localValue}
          onChange={handleChange}
          placeholder="Write your thoughts..."
          className="min-h-24 resize-none"
          data-testid={`${testId}-input`}
        />
      </CardContent>
    </Card>
  );
}
