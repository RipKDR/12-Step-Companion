import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, MapPin, Clock, Users, Trash2, MessageCircle, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Meeting {
  id: string;
  name: string;
  type: string;
  location: string;
  date: string;
  notes?: string;
  createdAtISO: string;
}

export default function Meetings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'NA',
    location: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [postcode, setPostcode] = useState('');
  const [australianState, setAustralianState] = useState('');

  const { toast } = useToast();
  
  const meetings = useAppStore((state) => {
    const data = (state as any).meetings || [];
    return data.sort((a: Meeting, b: Meeting) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const saveMeeting = (meeting: Omit<Meeting, 'id' | 'createdAtISO'>) => {
    const store = useAppStore.getState();
    const id = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMeeting: Meeting = {
      ...meeting,
      id,
      createdAtISO: new Date().toISOString(),
    };
    
    useAppStore.setState({
      ...store,
      meetings: [...((store as any).meetings || []), newMeeting],
    });
  };

  const deleteMeeting = (id: string) => {
    const store = useAppStore.getState();
    useAppStore.setState({
      ...store,
      meetings: ((store as any).meetings || []).filter((m: Meeting) => m.id !== id),
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location || !formData.date) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in meeting name, location, and date',
        variant: 'destructive',
      });
      return;
    }

    saveMeeting(formData);
    
    toast({
      title: 'Meeting logged',
      description: 'Your meeting attendance has been recorded',
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      type: 'NA',
      location: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete meeting "${name}"?`)) {
      deleteMeeting(id);
      toast({
        title: 'Meeting deleted',
        description: 'Meeting has been removed from your log',
      });
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch(type) {
      case 'NA': return 'bg-primary text-primary-foreground';
      case 'AA': return 'bg-accent text-accent-foreground';
      case 'CA': return 'bg-secondary text-secondary-foreground';
      case 'SMART': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const totalMeetings = meetings.length;
  const last30Days = meetings.filter((m: Meeting) => {
    const meetingDate = new Date(m.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return meetingDate >= thirtyDaysAgo;
  }).length;

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 pb-32 pt-8">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-meetings-title">
                Meeting Tracker
              </h1>
              <p className="text-base text-muted-foreground">
                Keep track of meetings you've attended
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 shrink-0"
              data-testid="button-add-meeting"
            >
              <Plus className="h-4 w-4" />
              Log Meeting
            </Button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Meetings</CardDescription>
              <CardTitle className="text-3xl" data-testid="text-total-meetings">{totalMeetings}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Last 30 Days</CardDescription>
              <CardTitle className="text-3xl" data-testid="text-recent-meetings">{last30Days}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              Find NA Meetings Near You
            </CardTitle>
            <CardDescription>
              Get meeting information sent directly to your phone via SMS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="2000"
                  maxLength={4}
                  data-testid="input-postcode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Territory</Label>
                <Select value={australianState} onValueChange={setAustralianState}>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSW">NSW</SelectItem>
                    <SelectItem value="VIC">VIC</SelectItem>
                    <SelectItem value="QLD">QLD</SelectItem>
                    <SelectItem value="SA">SA</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                    <SelectItem value="TAS">TAS</SelectItem>
                    <SelectItem value="NT">NT</SelectItem>
                    <SelectItem value="ACT">ACT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <a
                href={postcode && australianState ? `sms:0488811247?body=${encodeURIComponent(`${postcode} ${australianState}`)}` : `sms:0488811247`}
                className="block"
              >
                <Button 
                  className="w-full"
                  disabled={!postcode || !australianState}
                  data-testid="button-sms-lookup"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {postcode && australianState ? `SMS "${postcode} ${australianState}" to 0488 811 247` : 'Enter Postcode & State'}
                </Button>
              </a>
              
              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md space-y-1">
                <p><strong>How it works:</strong></p>
                <p>• Enter your postcode and state above</p>
                <p>• Tap the button to open your SMS app</p>
                <p>• Send the message to receive meeting info</p>
                <p>• You'll get a list of meetings in your area within the next 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Meeting History</h2>
          
          {meetings.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No meetings logged yet</p>
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-meeting">
                  Log Your First Meeting
                </Button>
              </CardContent>
            </Card>
          )}

          {meetings.map((meeting: Meeting) => (
            <Card key={meeting.id} className="hover-elevate" data-testid={`meeting-${meeting.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getMeetingTypeColor(meeting.type)}>
                        {meeting.type}
                      </Badge>
                      <CardTitle className="text-lg">{meeting.name}</CardTitle>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleDelete(meeting.id, meeting.name)}
                    data-testid={`button-delete-${meeting.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {meeting.notes && (
                <CardContent>
                  <p className="text-sm">{meeting.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Meeting Attendance</DialogTitle>
            <DialogDescription>
              Record the meeting you attended
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Meeting Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Monday Night Step Study"
                data-testid="input-meeting-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Fellowship Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger data-testid="select-meeting-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NA">NA - Narcotics Anonymous</SelectItem>
                  <SelectItem value="AA">AA - Alcoholics Anonymous</SelectItem>
                  <SelectItem value="CA">CA - Cocaine Anonymous</SelectItem>
                  <SelectItem value="SMART">SMART Recovery</SelectItem>
                  <SelectItem value="Other">Other Fellowship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Community Center, Main St"
                data-testid="input-meeting-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                data-testid="input-meeting-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Speaker topic, key takeaways, etc."
                className="min-h-20"
                data-testid="textarea-meeting-notes"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel-meeting"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-testid="button-save-meeting"
            >
              Save Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
