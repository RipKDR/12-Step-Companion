import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import {
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Star,
  Users,
  Clock,
  MessageCircle,
  CalendarCheck,
  Globe2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type {
  AvailabilityWindow,
  ContactStatus,
  FellowshipContact,
  WarmlineRole,
  Weekday,
} from '@/types';
import { cn } from '@/lib/utils';
import WarmlineQueue from '@/components/WarmlineQueue';

const fallbackTimezoneOptions = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Rome',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Australia/Sydney',
];

const warmlineRoleOptions: { value: WarmlineRole; label: string }[] = [
  { value: 'listener', label: 'Listener' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'backup', label: 'Backup' },
];

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'on-call', label: 'On Call' },
  { value: 'resting', label: 'Resting' },
  { value: 'offline', label: 'Offline' },
];

const weekdayOptions: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const defaultSosMessage = 'Hey, I could use some support when you have a moment.';

const timezoneOptions = (() => {
  try {
    if (typeof Intl !== 'undefined' && typeof (Intl as any).supportedValuesOf === 'function') {
      return ((Intl as any).supportedValuesOf('timeZone') as string[]) ?? fallbackTimezoneOptions;
    }
  } catch (error) {
    console.warn('Unable to read supported timezones', error);
  }
  return fallbackTimezoneOptions;
})();

const getDefaultTimezone = () => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? timezoneOptions[0] ?? 'UTC';
    }
  } catch (error) {
    console.warn('Unable to resolve default timezone', error);
  }
  return timezoneOptions[0] ?? 'UTC';
};

type RelationshipType = 'sponsor' | 'sponsee' | 'friend' | 'home-group' | 'other';

type FormState = {
  name: string;
  phone: string;
  email: string;
  relationshipType: RelationshipType;
  isEmergencyContact: boolean;
  notes: string;
  timezone: string;
  warmlineRole: WarmlineRole;
  availability: AvailabilityWindow[];
  status: ContactStatus;
  onCall: boolean;
  sosChannel: 'sms' | 'encrypted-chat';
  sosTarget: string;
  sosMessage: string;
};

type AvailabilityDraft = {
  day: Weekday;
  startTime: string;
  endTime: string;
  note: string;
};

const createEmptyFormState = (): FormState => ({
  name: '',
  phone: '',
  email: '',
  relationshipType: 'friend',
  isEmergencyContact: false,
  notes: '',
  timezone: getDefaultTimezone(),
  warmlineRole: 'listener',
  availability: [],
  status: 'available',
  onCall: false,
  sosChannel: 'sms',
  sosTarget: '',
  sosMessage: defaultSosMessage,
});

const createAvailabilityDraft = (): AvailabilityDraft => ({
  day: 'monday',
  startTime: '09:00',
  endTime: '17:00',
  note: '',
});

const formatAvailabilityWindow = (window: AvailabilityWindow) => {
  const dayLabel = weekdayOptions.find((day) => day.value === window.day)?.label ?? window.day;
  const noteSuffix = window.note ? ` · ${window.note}` : '';
  return `${dayLabel}: ${window.startTime} - ${window.endTime}${noteSuffix}`;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return 'Not yet logged';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not yet logged';
  return date.toLocaleString();
};

const toDateTimeInputValue = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const buildSosLink = (contact: FellowshipContact) => {
  const preferences = contact.sosPreferences;
  const message = encodeURIComponent(preferences?.message ?? defaultSosMessage);
  if (preferences?.channel === 'encrypted-chat' && preferences?.target) {
    return { href: preferences.target, target: '_blank', label: 'Open Encrypted Chat' };
  }

  const phoneNumber = preferences?.target ?? contact.phone;
  if (phoneNumber) {
    return { href: `sms:${phoneNumber}?&body=${message}`, target: '_self', label: 'Send SOS SMS' };
  }

  return { href: '#', target: '_self', label: 'SOS' };
};

export default function Contacts() {
  const getContacts = useAppStore((state) => state.getContacts);
  const addContact = useAppStore((state) => state.addContact);
  const updateContact = useAppStore((state) => state.updateContact);
  const deleteContact = useAppStore((state) => state.deleteContact);
  const setContactStatus = useAppStore((state) => state.setContactStatus);
  const toggleContactOnCall = useAppStore((state) => state.toggleContactOnCall);
  const recordContactCheckIn = useAppStore((state) => state.recordContactCheckIn);
  const scheduleContactCheckIn = useAppStore((state) => state.scheduleContactCheckIn);

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<FellowshipContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(() => createEmptyFormState());
  const [availabilityDraft, setAvailabilityDraft] = useState<AvailabilityDraft>(() => createAvailabilityDraft());
  const [checkInDrafts, setCheckInDrafts] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const contacts = getContacts();

  const warmlineContacts = useMemo(
    () => contacts.filter((contact) => contact.status === 'available' || contact.onCall),
    [contacts]
  );

  const handleOpenDialog = (contact?: FellowshipContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        relationshipType: contact.relationshipType,
        isEmergencyContact: contact.isEmergencyContact,
        notes: contact.notes ?? '',
        timezone: contact.timezone ?? getDefaultTimezone(),
        warmlineRole: contact.warmlineRole ?? 'listener',
        availability: [...(contact.availability ?? [])],
        status: contact.status ?? 'available',
        onCall: contact.onCall ?? false,
        sosChannel: contact.sosPreferences?.channel ?? (contact.phone ? 'sms' : 'encrypted-chat'),
        sosTarget: contact.sosPreferences?.target ?? contact.phone ?? '',
        sosMessage: contact.sosPreferences?.message ?? defaultSosMessage,
      });
    } else {
      setEditingContact(null);
      setFormData(createEmptyFormState());
    }
    setAvailabilityDraft(createAvailabilityDraft());
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingContact(null);
    setFormData(createEmptyFormState());
  };

  const handleAddAvailabilityWindow = () => {
    if (!availabilityDraft.startTime || !availabilityDraft.endTime) {
      toast({
        title: 'Incomplete availability',
        description: 'Please provide both start and end times before adding availability.',
        variant: 'destructive',
      });
      return;
    }

    if (availabilityDraft.endTime <= availabilityDraft.startTime) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after the start time.',
        variant: 'destructive',
      });
      return;
    }

    const newWindow: AvailabilityWindow = {
      id: `availability_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      day: availabilityDraft.day,
      startTime: availabilityDraft.startTime,
      endTime: availabilityDraft.endTime,
      note: availabilityDraft.note || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, newWindow],
    }));
    setAvailabilityDraft(createAvailabilityDraft());
  };

  const handleRemoveAvailabilityWindow = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((window) => window.id !== id),
    }));
  };

  const handleSaveContact = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this contact.',
        variant: 'destructive',
      });
      return;
    }

    const sosPreferences = {
      channel: formData.sosChannel,
      target:
        formData.sosChannel === 'sms'
          ? formData.sosTarget.trim() || formData.phone.trim() || undefined
          : formData.sosTarget.trim() || undefined,
      message: formData.sosMessage.trim() ? formData.sosMessage.trim() : undefined,
    } as FellowshipContact['sosPreferences'];

    if (editingContact) {
      updateContact(editingContact.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        relationshipType: formData.relationshipType,
        isEmergencyContact: formData.isEmergencyContact,
        notes: formData.notes.trim() || undefined,
        timezone: formData.timezone,
        warmlineRole: formData.warmlineRole,
        availability: formData.availability,
        status: formData.status,
        onCall: formData.onCall,
        sosPreferences,
      });
      toast({
        title: 'Contact updated',
        description: `${formData.name} has been updated.`,
      });
    } else {
      addContact({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        relationshipType: formData.relationshipType,
        isEmergencyContact: formData.isEmergencyContact,
        notes: formData.notes.trim() || undefined,
        timezone: formData.timezone,
        warmlineRole: formData.warmlineRole,
        availability: formData.availability,
        status: formData.status,
        onCall: formData.onCall,
        sosPreferences,
      });
      toast({
        title: 'Contact added',
        description: `${formData.name} has been added to your fellowship contacts.`,
      });
    }

    handleCloseDialog();
  };

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      const contact = contacts.find((c) => c.id === contactToDelete);
      deleteContact(contactToDelete);
      toast({
        title: 'Contact deleted',
        description: `${contact?.name ?? 'Contact'} has been removed.`,
      });
    }
    setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  const handleScheduleCheckIn = (contactId: string) => {
    const draftValue = checkInDrafts[contactId];
    if (!draftValue) {
      toast({
        title: 'No check-in scheduled',
        description: 'Choose a date and time before scheduling a check-in.',
        variant: 'destructive',
      });
      return;
    }

    const isoDate = new Date(draftValue);
    if (Number.isNaN(isoDate.getTime())) {
      toast({
        title: 'Invalid date',
        description: 'Please choose a valid check-in time.',
        variant: 'destructive',
      });
      return;
    }

    scheduleContactCheckIn(contactId, isoDate.toISOString());
    toast({
      title: 'Check-in scheduled',
      description: 'We will remind you about this connection.',
    });
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    const labels = {
      sponsor: 'Sponsor',
      sponsee: 'Sponsee',
      friend: 'Fellowship Friend',
      'home-group': 'Home Group',
      other: 'Other',
    } satisfies Record<RelationshipType, string>;
    return labels[type];
  };

  const getRelationshipColor = (type: RelationshipType) => {
    const colors = {
      sponsor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sponsee: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      friend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'home-group': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    } satisfies Record<RelationshipType, string>;
    return colors[type];
  };

  const emergencyContacts = contacts.filter((c) => c.isEmergencyContact);
  const regularContacts = contacts.filter((c) => !c.isEmergencyContact);

  return (
    <div className="max-w-5xl mx-auto px-6 pb-32 pt-8">
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Fellowship Contacts
            </h1>
            <p className="text-base text-muted-foreground">
              Stay connected with your recovery community and warmline buddies.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-contact" className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <WarmlineQueue
        contacts={warmlineContacts}
        onConfirmContact={(contact) => {
          recordContactCheckIn(contact.id);
          toast({
            title: `Checked in with ${contact.name}`,
            description: 'Availability confirmed and last check-in updated.',
          });
        }}
      />

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Contacts Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add fellowship contacts to stay connected with your recovery support network.
            </p>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-contact">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {emergencyContacts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-orange-600 dark:text-orange-400 fill-current" />
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => {
                  const sos = buildSosLink(contact);
                  return (
                    <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={cn('text-xs', getRelationshipColor(contact.relationshipType))}>
                                {getRelationshipLabel(contact.relationshipType)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {contact.warmlineRole ? contact.warmlineRole : 'Warmline'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Status: {contact.status ?? 'available'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(contact)}
                              data-testid={`button-edit-${contact.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(contact.id)}
                              data-testid={`button-delete-${contact.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="grid gap-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs uppercase tracking-wide text-muted-foreground">On Call</Label>
                              <p className="text-sm text-muted-foreground">
                                Prioritize this contact for urgent support.
                              </p>
                            </div>
                            <Switch
                              checked={contact.onCall}
                              onCheckedChange={(checked) => toggleContactOnCall(contact.id, checked)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Warmline Status</Label>
                            <Select
                              value={contact.status ?? 'available'}
                              onValueChange={(value) => setContactStatus(contact.id, value as ContactStatus)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-1">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timezone</Label>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Globe2 className="h-4 w-4" />
                              {contact.timezone}
                            </p>
                          </div>

                          {contact.availability && contact.availability.length > 0 && (
                            <div className="grid gap-2">
                              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Availability</Label>
                              <div className="flex flex-wrap gap-2">
                                {contact.availability.map((window) => (
                                  <Badge key={window.id} variant="secondary" className="text-xs">
                                    {formatAvailabilityWindow(window)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Last Check-in</Label>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {formatDateTime(contact.lastCheckInISO)}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Schedule Next Check-in</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                type="datetime-local"
                                value={checkInDrafts[contact.id] ?? toDateTimeInputValue(contact.nextCheckInISO)}
                                onChange={(event) =>
                                  setCheckInDrafts((prev) => ({ ...prev, [contact.id]: event.target.value }))
                                }
                              />
                              <Button variant="secondary" onClick={() => handleScheduleCheckIn(contact.id)}>
                                <CalendarCheck className="h-4 w-4 mr-2" />
                                Schedule
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  recordContactCheckIn(contact.id);
                                  toast({
                                    title: 'Check-in logged',
                                    description: `${contact.name} has been marked as checked in.`,
                                  });
                                }}
                              >
                                Log Now
                              </Button>
                            </div>
                            {contact.nextCheckInISO && (
                              <p className="text-xs text-muted-foreground">
                                Next reminder: {formatDateTime(contact.nextCheckInISO)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-2 text-primary hover:underline"
                              data-testid={`link-call-${contact.id}`}
                            >
                              <Phone className="h-4 w-4" />
                              {contact.phone}
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2 text-primary hover:underline"
                              data-testid={`link-email-${contact.id}`}
                            >
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </a>
                          )}
                          <Button asChild variant="outline" size="sm">
                            <a href={sos.href} target={sos.target} rel={sos.target === '_blank' ? 'noreferrer' : undefined}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {sos.label}
                            </a>
                          </Button>
                        </div>

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground pt-3 border-t">{contact.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {regularContacts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">All Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularContacts.map((contact) => {
                  const sos = buildSosLink(contact);
                  return (
                    <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={cn('text-xs', getRelationshipColor(contact.relationshipType))}>
                                {getRelationshipLabel(contact.relationshipType)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {contact.warmlineRole ? contact.warmlineRole : 'Warmline'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Status: {contact.status ?? 'available'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(contact)}
                              data-testid={`button-edit-${contact.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(contact.id)}
                              data-testid={`button-delete-${contact.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="grid gap-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs uppercase tracking-wide text-muted-foreground">On Call</Label>
                              <p className="text-sm text-muted-foreground">
                                Toggle to include in the active warmline rotation.
                              </p>
                            </div>
                            <Switch
                              checked={contact.onCall}
                              onCheckedChange={(checked) => toggleContactOnCall(contact.id, checked)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Warmline Status</Label>
                            <Select
                              value={contact.status ?? 'available'}
                              onValueChange={(value) => setContactStatus(contact.id, value as ContactStatus)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-1">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timezone</Label>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Globe2 className="h-4 w-4" />
                              {contact.timezone}
                            </p>
                          </div>

                          {contact.availability && contact.availability.length > 0 && (
                            <div className="grid gap-2">
                              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Availability</Label>
                              <div className="flex flex-wrap gap-2">
                                {contact.availability.map((window) => (
                                  <Badge key={window.id} variant="secondary" className="text-xs">
                                    {formatAvailabilityWindow(window)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Last Check-in</Label>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {formatDateTime(contact.lastCheckInISO)}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Schedule Next Check-in</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                type="datetime-local"
                                value={checkInDrafts[contact.id] ?? toDateTimeInputValue(contact.nextCheckInISO)}
                                onChange={(event) =>
                                  setCheckInDrafts((prev) => ({ ...prev, [contact.id]: event.target.value }))
                                }
                              />
                              <Button variant="secondary" onClick={() => handleScheduleCheckIn(contact.id)}>
                                <CalendarCheck className="h-4 w-4 mr-2" />
                                Schedule
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  recordContactCheckIn(contact.id);
                                  toast({
                                    title: 'Check-in logged',
                                    description: `${contact.name} has been marked as checked in.`,
                                  });
                                }}
                              >
                                Log Now
                              </Button>
                            </div>
                            {contact.nextCheckInISO && (
                              <p className="text-xs text-muted-foreground">
                                Next reminder: {formatDateTime(contact.nextCheckInISO)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-2 text-primary hover:underline"
                              data-testid={`link-call-${contact.id}`}
                            >
                              <Phone className="h-4 w-4" />
                              {contact.phone}
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2 text-primary hover:underline"
                              data-testid={`link-email-${contact.id}`}
                            >
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </a>
                          )}
                          <Button asChild variant="outline" size="sm">
                            <a href={sos.href} target={sos.target} rel={sos.target === '_blank' ? 'noreferrer' : undefined}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {sos.label}
                            </a>
                          </Button>
                        </div>

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground pt-3 border-t">{contact.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-contact-form">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact
                ? 'Update contact information, availability, and warmline preferences.'
                : 'Add a fellowship contact to your list and capture their warmline preferences.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={formData.relationshipType}
                  onValueChange={(value) => setFormData({ ...formData, relationshipType: value as RelationshipType })}
                >
                  <SelectTrigger id="relationship" data-testid="select-relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="sponsee">Sponsee</SelectItem>
                    <SelectItem value="friend">Fellowship Friend</SelectItem>
                    <SelectItem value="home-group">Home Group</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {timezoneOptions.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warmline-role">Warmline Role</Label>
                <Select
                  value={formData.warmlineRole}
                  onValueChange={(value) => setFormData({ ...formData, warmlineRole: value as WarmlineRole })}
                >
                  <SelectTrigger id="warmline-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warmlineRoleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Default Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ContactStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="on-call">Start On Call</Label>
                  <p className="text-sm text-muted-foreground">
                    Include this contact in the warmline rotation immediately.
                  </p>
                </div>
                <Switch
                  id="on-call"
                  checked={formData.onCall}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      onCall: checked,
                      status: checked
                        ? 'on-call'
                        : formData.status === 'on-call'
                        ? 'available'
                        : formData.status,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Availability Windows</Label>
                <div className="grid gap-2 md:grid-cols-[1fr,1fr,1fr,auto]">
                  <Select
                    value={availabilityDraft.day}
                    onValueChange={(value) => setAvailabilityDraft({ ...availabilityDraft, day: value as Weekday })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={availabilityDraft.startTime}
                    onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, startTime: event.target.value })}
                  />
                  <Input
                    type="time"
                    value={availabilityDraft.endTime}
                    onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, endTime: event.target.value })}
                  />
                  <Button variant="secondary" onClick={handleAddAvailabilityWindow}>
                    Add
                  </Button>
                </div>
                <Input
                  placeholder="Optional note (e.g. video calls only)"
                  value={availabilityDraft.note}
                  onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, note: event.target.value })}
                />
                {formData.availability.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.availability.map((window) => (
                      <Badge key={window.id} variant="secondary" className="text-xs">
                        <div className="flex items-center gap-2">
                          <span>{formatAvailabilityWindow(window)}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveAvailabilityWindow(window.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No availability windows added yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SOS Preferences</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <Select
                    value={formData.sosChannel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sosChannel: value as 'sms' | 'encrypted-chat' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="encrypted-chat">Encrypted Chat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={formData.sosChannel === 'sms' ? 'SMS number (optional)' : 'Chat link or handle'}
                    value={formData.sosTarget}
                    onChange={(event) => setFormData({ ...formData, sosTarget: event.target.value })}
                  />
                </div>
                <Textarea
                  placeholder="Optional SOS message"
                  rows={2}
                  value={formData.sosMessage}
                  onChange={(event) => setFormData({ ...formData, sosMessage: event.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <p className="text-sm text-muted-foreground">Quick access when you need help.</p>
              </div>
              <Switch
                id="emergency"
                checked={formData.isEmergencyContact}
                onCheckedChange={(checked) => setFormData({ ...formData, isEmergencyContact: checked })}
                data-testid="switch-emergency"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or details"
                rows={3}
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSaveContact} data-testid="button-save">
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this contact from your fellowship list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
