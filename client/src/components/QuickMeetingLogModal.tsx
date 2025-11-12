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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';

const MEETING_TYPES = [
  'AA (Alcoholics Anonymous)',
  'NA (Narcotics Anonymous)',
  'CA (Cocaine Anonymous)',
  'SMART Recovery',
  'Other 12-Step',
  'Group Therapy',
  'Sponsor Meeting',
];

interface QuickMeetingLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickMeetingLogModal({ open, onOpenChange }: QuickMeetingLogModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('AA (Alcoholics Anonymous)');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const profile = useAppStore((state) => state.profile);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setName('');
        setType('AA (Alcoholics Anonymous)');
        setLocation('');
        setNotes('');
      }, 200);
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim() || !location.trim()) return;

    // Note: This would need to be implemented in the store
    // For now, we're just closing the modal
    // In a full implementation, you'd call addMeeting() from the store

    onOpenChange(false);
  };

          return (
            <Drawer open={open} onOpenChange={onOpenChange}>
              <DrawerContent className="max-h-[90vh]" aria-labelledby="meeting-title" aria-describedby="meeting-description">
                <DrawerHeader className="text-left">
                  <DrawerTitle id="meeting-title">Log a Meeting</DrawerTitle>
                  <DrawerDescription id="meeting-description">
                    Record your meeting attendance
                  </DrawerDescription>
                </DrawerHeader>

        <div className="space-y-4 px-4 overflow-y-auto flex-1">
          {/* Meeting Name */}
          <div className="space-y-2">
            <Label htmlFor="meeting-name">Meeting Name</Label>
            <Input
              id="meeting-name"
              placeholder="e.g., Morning Hope Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={open}
            />
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label htmlFor="meeting-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="meeting-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="meeting-location">Location</Label>
            <Input
              id="meeting-location"
              placeholder="e.g., Community Center, Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="meeting-notes">
              Notes <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="meeting-notes"
              placeholder="Any reflections or key takeaways?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
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
            disabled={!name.trim() || !location.trim()}
          >
            Save ✓
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
