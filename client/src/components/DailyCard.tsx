import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { haptics } from '@/lib/haptics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isOpen, setIsOpen] = useState(!completed || value.length > 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card 
        className="w-full transition-all duration-200" 
        data-testid={testId}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${completed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} transition-colors`}>
              {icon}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <CardTitle className="text-base">{title}</CardTitle>
              {value && !isOpen && (
                <p className="text-sm text-muted-foreground truncate">{value}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={completed ? 'default' : 'outline'}
              className="h-8 w-8"
              onClick={() => {
                haptics.success();
                onComplete();
              }}
              data-testid={`${testId}-complete-button`}
              aria-label={completed ? 'Completed' : 'Mark as complete'}
            >
              <Check className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            <Textarea
              value={localValue}
              onChange={handleChange}
              placeholder="Write your thoughts..."
              className="min-h-28 resize-none border-muted focus:border-primary/50 transition-colors"
              data-testid={`${testId}-input`}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
