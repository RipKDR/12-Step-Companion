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
        <div className="text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Quick Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localValue}
          onChange={handleChange}
          placeholder="Jot down quick thoughts, insights, or reflections..."
          className="min-h-24 resize-none"
          data-testid={`${testId}-input`}
        />
      </CardContent>
    </Card>
  );
}
