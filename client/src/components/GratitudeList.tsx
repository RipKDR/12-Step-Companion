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
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Heart className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">Gratitude List</CardTitle>
          {items.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What are you grateful for today?"
            className="flex-1 border-muted focus:border-primary/50 transition-colors"
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
                className="flex items-center gap-3 group p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover-elevate transition-all duration-200"
                data-testid={`${testId}-item-${index}`}
              >
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Heart className="h-3.5 w-3.5 text-primary shrink-0 fill-current" />
                </div>
                <span className="flex-1 text-sm leading-relaxed">{item}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Add items you're grateful for today
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
