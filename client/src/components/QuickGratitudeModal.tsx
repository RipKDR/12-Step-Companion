import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getTodayDate } from '@/lib/time';

interface QuickGratitudeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickGratitudeModal({ open, onOpenChange }: QuickGratitudeModalProps) {
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setGratitudeItems(['', '', '']);
      }, 200);
    }
  }, [open]);

  const handleSave = () => {
    const validItems = gratitudeItems.filter((item) => item.trim());

    if (validItems.length === 0) return;

    const today = getTodayDate();
    updateDailyCard(today, {
      gratitudeItems: validItems,
    });

    onOpenChange(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const handleAddItem = () => {
    if (gratitudeItems.length < 10) {
      setGratitudeItems([...gratitudeItems, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (gratitudeItems.length > 1) {
      const newItems = gratitudeItems.filter((_, i) => i !== index);
      setGratitudeItems(newItems);
    }
  };

  const hasValidItems = gratitudeItems.some((item) => item.trim());

          return (
            <Drawer open={open} onOpenChange={onOpenChange}>
              <DrawerContent className="max-h-[90vh]" aria-labelledby="gratitude-title" aria-describedby="gratitude-description">
                <DrawerHeader className="text-left">
                  <DrawerTitle id="gratitude-title">Gratitude Practice</DrawerTitle>
                  <DrawerDescription id="gratitude-description">
                    What are you grateful for today? List 1-3 things.
                  </DrawerDescription>
                </DrawerHeader>

        <div className="space-y-3 px-4 overflow-y-auto flex-1">
          {gratitudeItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`gratitude-${index}`} className="text-xs text-muted-foreground">
                  {index + 1}.
                </Label>
                <Input
                  id={`gratitude-${index}`}
                  placeholder={
                    index === 0
                      ? 'My sobriety'
                      : index === 1
                      ? 'My sponsor'
                      : "Today's beautiful weather"
                  }
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  autoFocus={index === 0 && open}
                />
              </div>
              {gratitudeItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  className="mt-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {gratitudeItems.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another
            </Button>
          )}
        </div>

        <DrawerFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasValidItems}
          >
            Save ✓
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
