import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Plus, X } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface GratitudeListProps {
  items: string[];
  onChange: (items: string[]) => void;
  testId?: string;
}

export default function GratitudeList({
  items = [],
  onChange,
  testId = 'gratitude-list',
}: GratitudeListProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      haptics.success();
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    haptics.light();
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card className="w-full" data-testid={testId}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <div className="text-primary">
          <Heart className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Gratitude List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What are you grateful for today?"
            className="flex-1"
            data-testid={`${testId}-input`}
          />
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={!newItem.trim()}
            data-testid={`${testId}-add-button`}
            aria-label="Add gratitude item"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {items.length > 0 && (
          <ul className="space-y-2" role="list" aria-label="Gratitude items">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 group p-2 rounded-lg bg-muted/50"
                data-testid={`${testId}-item-${index}`}
              >
                <Heart className="h-4 w-4 text-primary shrink-0 fill-current" />
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                  data-testid={`${testId}-remove-${index}`}
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {items.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Add items you're grateful for today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
