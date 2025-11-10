import { useState } from 'react';
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
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FellowshipContact } from '@/types';

type RelationshipType = 'sponsor' | 'sponsee' | 'friend' | 'home-group' | 'other';

type FormState = {
  name: string;
  phone: string;
  email: string;
  relationshipType: RelationshipType;
  isEmergencyContact: boolean;
  notes: string;
};

const createEmptyFormState = (): FormState => ({
  name: '',
  phone: '',
  email: '',
  relationshipType: 'friend',
  isEmergencyContact: false,
  notes: '',
});

export default function Contacts() {
  const getContacts = useAppStore((state) => state.getContacts);
  const addContact = useAppStore((state) => state.addContact);
  const updateContact = useAppStore((state) => state.updateContact);
  const deleteContact = useAppStore((state) => state.deleteContact);

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<FellowshipContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(() => createEmptyFormState());

  const { toast } = useToast();
  const contacts = getContacts();

  const emergencyContacts = contacts.filter((c) => c.isEmergencyContact);
  const regularContacts = contacts.filter((c) => !c.isEmergencyContact);

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
      });
    } else {
      setEditingContact(null);
      setFormData(createEmptyFormState());
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingContact(null);
    setFormData(createEmptyFormState());
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a contact name',
        variant: 'destructive',
      });
      return;
    }

    if (editingContact) {
      updateContact(editingContact.id, {
        ...formData,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });
      toast({
        title: 'Contact updated',
        description: `${formData.name} has been updated`,
      });
    } else {
      addContact({
        ...formData,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      });
      toast({
        title: 'Contact added',
        description: `${formData.name} has been added to your contacts`,
      });
    }

    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      const contact = contacts.find((c) => c.id === contactToDelete);
      deleteContact(contactToDelete);
      toast({
        title: 'Contact deleted',
        description: contact ? `${contact.name} has been removed` : 'Contact removed',
      });
      setContactToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case 'sponsor':
        return 'bg-primary text-primary-foreground';
      case 'sponsee':
        return 'bg-accent text-accent-foreground';
      case 'friend':
        return 'bg-secondary text-secondary-foreground';
      case 'home-group':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-32 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Fellowship Contacts</h1>
        <p className="text-base text-muted-foreground">
          Keep track of your support network
        </p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-contact">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-6">
        {emergencyContacts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Emergency Contacts
            </h2>
            <div className="grid gap-4">
              {emergencyContacts.map((contact) => (
                <Card key={contact.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{contact.name}</CardTitle>
                        <Badge className={getRelationshipColor(contact.relationshipType)}>
                          {getRelationshipLabel(contact.relationshipType)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(contact)}
                          data-testid={`button-edit-contact-${contact.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(contact.id)}
                          data-testid={`button-delete-contact-${contact.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-primary hover:underline"
                          data-testid={`link-phone-${contact.id}`}
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary hover:underline"
                          data-testid={`link-email-${contact.id}`}
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-start gap-2 text-sm pt-2 border-t">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground">{contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {regularContacts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">All Contacts</h2>
            <div className="grid gap-4">
              {regularContacts.map((contact) => (
                <Card key={contact.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{contact.name}</CardTitle>
                        <Badge className={getRelationshipColor(contact.relationshipType)}>
                          {getRelationshipLabel(contact.relationshipType)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(contact)}
                          data-testid={`button-edit-contact-${contact.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(contact.id)}
                          data-testid={`button-delete-contact-${contact.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-primary hover:underline"
                          data-testid={`link-phone-${contact.id}`}
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary hover:underline"
                          data-testid={`link-email-${contact.id}`}
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-start gap-2 text-sm pt-2 border-t">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground">{contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {contacts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No contacts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your sponsor, fellowship friends, and support network
              </p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact
                ? 'Update contact information'
                : 'Add someone from your support network'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                data-testid="input-contact-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={formData.relationshipType}
                onValueChange={(value) =>
                  setFormData({ ...formData, relationshipType: value as RelationshipType })
                }
              >
                <SelectTrigger id="relationship" data-testid="select-relationship-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="sponsee">Sponsee</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="home-group">Home Group</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                data-testid="input-contact-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                data-testid="input-contact-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
                data-testid="textarea-contact-notes"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <Label htmlFor="emergency" className="cursor-pointer">
                Mark as Emergency Contact
              </Label>
              <Switch
                id="emergency"
                checked={formData.isEmergencyContact}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isEmergencyContact: checked })
                }
                data-testid="switch-emergency-contact"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} data-testid="button-cancel-contact">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-contact">
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this contact from your list. This action cannot be undone.
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
  );
}
