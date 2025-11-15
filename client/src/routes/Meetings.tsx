import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, MapPin, Clock, Users, Trash2, MessageCircle, Search, Star, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import MeetingFinder from '@/components/meeting-finder/MeetingFinder';
import MeetingReminders from '@/components/meeting-finder/MeetingReminders';
import type { Meeting } from '@/types';

export default function Meetings() {
  const [activeTab, setActiveTab] = useState('log');
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
  
  const favoriteMeetings = useAppStore((state) => state.getFavoriteMeetings());

  const { toast } = useToast();
  
  const meetings = useAppStore((state) => {
    const data = state.meetings || [];
    return data.sort((a, b) => {
      // Handle optional date field - use createdAtISO as fallback
      // Support both old format (date: string) and new format (dayOfWeek + time)
      const aDate = a.date 
        ? new Date(a.date) 
        : (a.createdAtISO ? new Date(a.createdAtISO) : new Date(0));
      const bDate = b.date 
        ? new Date(b.date) 
        : (b.createdAtISO ? new Date(b.createdAtISO) : new Date(0));
      
      // Handle Invalid Date
      const aTime = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
      const bTime = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
      
      return bTime - aTime;
    });
  });

  const saveMeeting = (meetingData: { name: string; type: string; location: string; date: string; notes?: string }) => {
    const store = useAppStore.getState();
    const id = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert old format to new Meeting format for backward compatibility
    const dateObj = new Date(meetingData.date);
    const dayOfWeek = dateObj.getDay();
    const time = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    
    const newMeeting: Meeting = {
      id,
      name: meetingData.name,
      dayOfWeek,
      time,
      format: 'in-person' as const,
      type: 'other' as const,
      program: (meetingData.type === 'NA' || meetingData.type === 'AA') ? meetingData.type as 'NA' | 'AA' : 'NA',
      source: 'manual' as const,
      isFavorite: false,
      reminderEnabled: false,
      reminderMinutesBefore: 30,
      createdAtISO: new Date().toISOString(),
      updatedAtISO: new Date().toISOString(),
      // Legacy fields for backward compatibility
      date: meetingData.date,
      notes: meetingData.notes,
      // Note: location is stored as object in new format, but we'll parse the string if needed
      // For now, we'll create a basic location object from the string
      location: meetingData.location ? {
        name: '',
        address: meetingData.location,
        city: '',
        country: 'US',
      } : undefined,
    } as Meeting;
    
    useAppStore.setState({
      ...store,
      meetings: [...(store.meetings || []), newMeeting],
    });
  };

  const deleteMeeting = (id: string) => {
    const store = useAppStore.getState();
    useAppStore.setState({
      ...store,
      meetings: (store.meetings || []).filter((m) => m.id !== id),
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

  const handleMeetingSelect = (meeting: Meeting) => {
    // Pre-fill the form with meeting details when logging from finder
    let locationStr = '';
    if (meeting.location) {
      if (typeof meeting.location === 'string') {
        locationStr = meeting.location;
      } else {
        locationStr = `${meeting.location.name || ''} ${meeting.location.address || ''} ${meeting.location.city || ''}`.trim();
      }
    }
    
    setFormData({
      name: meeting.name,
      type: meeting.program || 'NA',
      location: locationStr,
      date: new Date().toISOString().split('T')[0],
      notes: meeting.notes || ''
    });
    setIsDialogOpen(true);
    setActiveTab('log');
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
    // Support both old format (date: string) and new format
    const meetingDate = m.date ? new Date(m.date) : (m.createdAtISO ? new Date(m.createdAtISO) : null);
    if (!meetingDate || isNaN(meetingDate.getTime())) return false;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return meetingDate >= thirtyDaysAgo;
  }).length;

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 pb-8 sm:pb-12 pt-8">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Meeting Log</TabsTrigger>
            <TabsTrigger value="finder">Find Meetings</TabsTrigger>
            <TabsTrigger value="reminders">
              Reminders
              {favoriteMeetings.filter(m => m.reminderEnabled).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {favoriteMeetings.filter(m => m.reminderEnabled).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-6">
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

            {/* Favorites Section */}
            {favoriteMeetings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Favorite Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {favoriteMeetings.slice(0, 3).map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => handleMeetingSelect(meeting)}
                      >
                        <div>
                          <div className="font-medium text-sm">{meeting.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {meeting.location?.city || 'Location TBD'}
                          </div>
                        </div>
                        <Badge variant="outline">{meeting.program}</Badge>
                      </div>
                    ))}
                    {favoriteMeetings.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab('finder')}
                      >
                        View all favorites ({favoriteMeetings.length})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Search className="h-5 w-5" />
                  Find NA Meetings Near You (SMS)
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
                      <Badge className={getMeetingTypeColor(typeof meeting.type === 'string' ? meeting.type : meeting.program || 'NA')}>
                        {typeof meeting.type === 'string' ? meeting.type : meeting.program || 'NA'}
                      </Badge>
                      <CardTitle className="text-lg">{meeting.name}</CardTitle>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {typeof meeting.location === 'string' 
                          ? meeting.location 
                          : meeting.location 
                            ? `${meeting.location.name || ''} ${meeting.location.address || ''} ${meeting.location.city || ''}`.trim() || 'Location TBD'
                            : 'Location TBD'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {meeting.date 
                          ? format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')
                          : meeting.createdAtISO 
                            ? format(new Date(meeting.createdAtISO), 'EEEE, MMMM d, yyyy')
                            : 'Date unknown'}
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
          </TabsContent>

          <TabsContent value="finder" className="space-y-6">
            <MeetingFinder onMeetingSelect={handleMeetingSelect} />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <MeetingReminders />
          </TabsContent>
        </Tabs>
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
