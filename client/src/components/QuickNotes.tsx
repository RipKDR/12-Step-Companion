import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';

interface QuickNotesProps {
  value: string;
  onChange: (value: string) => void;
  testId?: string;
}

export default function QuickNotes({
  value,
  onChange,
  testId = 'quick-notes',
}: QuickNotesProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full" data-testid={testId}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">Quick Notes</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Capture your thoughts
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localValue}
          onChange={handleChange}
          placeholder="Jot down quick thoughts, insights, or reflections..."
          className="min-h-28 resize-none border-muted focus:border-primary/50 transition-colors"
          data-testid={`${testId}-input`}
        />
      </CardContent>
    </Card>
  );
}
