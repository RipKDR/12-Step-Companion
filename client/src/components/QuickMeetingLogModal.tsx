import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  const handleSave = () => {
    if (!name.trim() || !location.trim()) return;

    // Note: This would need to be implemented in the store
    // For now, we're just closing the modal
    // In a full implementation, you'd call addMeeting() from the store

    console.log('Meeting logged:', { name, type, location, notes });

    // Reset form
    setName('');
    setType('AA (Alcoholics Anonymous)');
    setLocation('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log a Meeting 📍</DialogTitle>
          <DialogDescription>
            Record your meeting attendance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Meeting Name */}
          <div className="space-y-2">
            <Label htmlFor="meeting-name">Meeting Name</Label>
            <Input
              id="meeting-name"
              placeholder="e.g., Morning Hope Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
