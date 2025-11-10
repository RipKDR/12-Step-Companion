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
import { Phone, Mail, Plus, Edit2, Trash2, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FellowshipContact } from '@/types';
import { cn } from '@/lib/utils';

type RelationshipType = 'sponsor' | 'sponsee' | 'friend' | 'home-group' | 'other';

export default function Contacts() {
  const getContacts = useAppStore((state) => state.getContacts);
  const addContact = useAppStore((state) => state.addContact);
  const updateContact = useAppStore((state) => state.updateContact);
  const deleteContact = useAppStore((state) => state.deleteContact);
  
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<FellowshipContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationshipType: 'friend' as RelationshipType,
    isEmergencyContact: false,
    isHarmReductionContact: false,
    notes: '',
  });

  const { toast } = useToast();
  const contacts = getContacts();

  const handleOpenDialog = (contact?: FellowshipContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone || '',
        email: contact.email || '',
        relationshipType: contact.relationshipType,
        isEmergencyContact: contact.isEmergencyContact,
        isHarmReductionContact: contact.isHarmReductionContact ?? false,
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationshipType: 'friend',
        isEmergencyContact: false,
        isHarmReductionContact: false,
        notes: '',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingContact(null);
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

    if (editingContact) {
      updateContact(editingContact.id, formData);
      toast({
        title: 'Contact updated',
        description: `${formData.name} has been updated.`,
      });
    } else {
      addContact(formData);
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
      const contact = contacts.find(c => c.id === contactToDelete);
      deleteContact(contactToDelete);
      toast({
        title: 'Contact deleted',
        description: `${contact?.name} has been removed.`,
      });
    }
    setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    const labels = {
      sponsor: 'Sponsor',
      sponsee: 'Sponsee',
      friend: 'Fellowship Friend',
      'home-group': 'Home Group',
      other: 'Other',
    };
    return labels[type];
  };

  const getRelationshipColor = (type: RelationshipType) => {
    const colors = {
      sponsor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sponsee: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      friend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'home-group': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[type];
  };

  const emergencyContacts = contacts.filter(c => c.isEmergencyContact);
  const regularContacts = contacts.filter(c => !c.isEmergencyContact);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Fellowship Contacts</h1>
          <p className="text-muted-foreground">
            Stay connected with your recovery community
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-contact">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </header>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Contacts Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add fellowship contacts to stay connected with your recovery support network
            </p>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-contact">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-orange-600 dark:text-orange-400 fill-current" />
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{contact.name}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={cn("text-xs", getRelationshipColor(contact.relationshipType))}>
                              {getRelationshipLabel(contact.relationshipType)}
                            </Badge>
                            {contact.isHarmReductionContact && (
                              <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                Harm reduction ally
                              </Badge>
                            )}
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
                    <CardContent className="space-y-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                          data-testid={`link-call-${contact.id}`}
                        >
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                          data-testid={`link-email-${contact.id}`}
                        >
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </a>
                      )}
                      {contact.notes && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                          {contact.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Regular Contacts */}
          {regularContacts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">All Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularContacts.map((contact) => (
                  <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{contact.name}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={cn("text-xs", getRelationshipColor(contact.relationshipType))}>
                              {getRelationshipLabel(contact.relationshipType)}
                            </Badge>
                            {contact.isHarmReductionContact && (
                              <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                Harm reduction ally
                              </Badge>
                            )}
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
                    <CardContent className="space-y-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                          data-testid={`link-call-${contact.id}`}
                        >
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                          data-testid={`link-email-${contact.id}`}
                        >
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </a>
                      )}
                      {contact.notes && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                          {contact.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-contact-form">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact information' : 'Add a fellowship contact to your list'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <p className="text-sm text-muted-foreground">Quick access when you need help</p>
              </div>
              <Switch
                id="emergency"
                checked={formData.isEmergencyContact}
                onCheckedChange={(checked) => setFormData({ ...formData, isEmergencyContact: checked })}
                data-testid="switch-emergency"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="harm-reduction">Harm Reduction Ally</Label>
                <p className="text-sm text-muted-foreground">Show in overdose support quick actions</p>
              </div>
              <Switch
                id="harm-reduction"
                checked={formData.isHarmReductionContact}
                onCheckedChange={(checked) => setFormData({ ...formData, isHarmReductionContact: checked })}
                data-testid="switch-harm-reduction"
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

      {/* Delete Confirmation Dialog */}
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
  );
}
