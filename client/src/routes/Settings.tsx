import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import ThemeToggle from '@/components/ThemeToggle';
import { Download, Upload, Lock, User, FileText, AlertTriangle, Bell } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { exportJSON, exportEncrypted } from '@/lib/export';
import { importJSON, importEncrypted, validateImportedData } from '@/lib/import';
import { formatDateTime } from '@/lib/time';
import { useToast } from '@/hooks/use-toast';
import { notificationManager } from '@/lib/notifications';

export default function Settings() {
  const profile = useAppStore((state) => state.profile);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const updateNotificationSettings = useAppStore((state) => state.updateNotificationSettings);
  const enableNotifications = useAppStore((state) => state.enableNotifications);
  const disableNotifications = useAppStore((state) => state.disableNotifications);
  const updateNotificationPermission = useAppStore((state) => state.updateNotificationPermission);
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);

  const [showEncryptDialog, setShowEncryptDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isEncryptedImport, setIsEncryptedImport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExportJSON = () => {
    const data = exportData();
    exportJSON(data);
    toast({
      title: 'Export successful',
      description: 'Your data has been exported as JSON.',
    });
  };

  const handleExportEncrypted = async () => {
    if (passphrase !== confirmPassphrase) {
      toast({
        title: 'Passphrases do not match',
        description: 'Please ensure both passphrases are identical.',
        variant: 'destructive',
      });
      return;
    }

    if (passphrase.length < 8) {
      toast({
        title: 'Passphrase too short',
        description: 'Please use at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = exportData();
      await exportEncrypted(data, passphrase);
      toast({
        title: 'Encrypted backup created',
        description: 'Your data has been encrypted and exported.',
      });
      setShowEncryptDialog(false);
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to create encrypted backup.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      let data;
      
      if (isEncryptedImport) {
        if (!passphrase) {
          toast({
            title: 'Passphrase required',
            description: 'Please enter the passphrase for this backup.',
            variant: 'destructive',
          });
          return;
        }
        data = await importEncrypted(importFile, passphrase);
      } else {
        data = await importJSON(importFile);
      }

      if (!validateImportedData(data)) {
        throw new Error('Invalid data format');
      }

      importData(data);
      
      toast({
        title: 'Import successful',
        description: 'Your data has been imported and merged.',
      });
      
      setShowImportDialog(false);
      setImportFile(null);
      setPassphrase('');
      setIsEncryptedImport(false);
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import data.',
        variant: 'destructive',
      });
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await notificationManager.requestPermission();
      updateNotificationPermission(permission);

      if (permission === 'granted') {
        enableNotifications();
        await notificationManager.scheduleNotifications(settings.notifications);
        toast({
          title: 'Notifications enabled',
          description: 'You will receive reminders based on your settings.',
        });
      } else {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable notifications.',
        variant: 'destructive',
      });
    }
  };

  const handleDisableNotifications = async () => {
    disableNotifications();
    await notificationManager.clearNotifications();
    toast({
      title: 'Notifications disabled',
      description: 'You will no longer receive notifications.',
    });
  };

  const handleNotificationTimeChange = async (key: 'morningCheckIn' | 'eveningReflection', time: string) => {
    updateNotificationSettings({
      [key]: { ...settings.notifications[key], time }
    });

    // Reschedule if enabled
    if (settings.notifications.enabled) {
      await notificationManager.scheduleNotifications({
        ...settings.notifications,
        [key]: { ...settings.notifications[key], time }
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and data
        </p>
      </header>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="text-base font-medium">{profile?.name || 'Not set'}</p>
          </div>
          {profile?.cleanDate && (
            <div>
              <Label className="text-sm text-muted-foreground">Clean Date</Label>
              <p className="text-base font-medium">
                {formatDateTime(profile.cleanDate, profile.timezone, {
                  weekday: undefined,
                  hour: undefined,
                  minute: undefined,
                })}
              </p>
            </div>
          )}
          <Button variant="outline" className="w-full" data-testid="button-edit-profile">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase visual contrast</p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
              data-testid="switch-high-contrast"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
              data-testid="switch-reduced-motion"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage reminders and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {settings.notifications.permission === 'granted'
                  ? 'Get helpful reminders and alerts'
                  : settings.notifications.permission === 'denied'
                  ? 'Blocked - please enable in browser settings'
                  : 'Request permission to show notifications'}
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.notifications.enabled}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await handleEnableNotifications();
                } else {
                  await handleDisableNotifications();
                }
              }}
              disabled={settings.notifications.permission === 'denied'}
            />
          </div>

          {settings.notifications.enabled && (
            <>
              {/* Morning Check-in */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="morning-checkin">Morning Check-in</Label>
                  <Switch
                    id="morning-checkin"
                    checked={settings.notifications.morningCheckIn.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({
                        morningCheckIn: { ...settings.notifications.morningCheckIn, enabled: checked }
                      })
                    }
                  />
                </div>
                {settings.notifications.morningCheckIn.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="morning-time" className="text-sm text-muted-foreground">Time:</Label>
                    <Input
                      id="morning-time"
                      type="time"
                      value={settings.notifications.morningCheckIn.time}
                      onChange={(e) => handleNotificationTimeChange('morningCheckIn', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Evening Reflection */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="evening-reflection">Evening Reflection</Label>
                  <Switch
                    id="evening-reflection"
                    checked={settings.notifications.eveningReflection.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({
                        eveningReflection: { ...settings.notifications.eveningReflection, enabled: checked }
                      })
                    }
                  />
                </div>
                {settings.notifications.eveningReflection.enabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="evening-time" className="text-sm text-muted-foreground">Time:</Label>
                    <Input
                      id="evening-time"
                      type="time"
                      value={settings.notifications.eveningReflection.time}
                      onChange={(e) => handleNotificationTimeChange('eveningReflection', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Other Alerts */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="milestone-alerts">Milestone Alerts</Label>
                    <p className="text-sm text-muted-foreground">Celebrate achievements</p>
                  </div>
                  <Switch
                    id="milestone-alerts"
                    checked={settings.notifications.milestoneAlerts}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ milestoneAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="streak-reminders">Streak Reminders</Label>
                    <p className="text-sm text-muted-foreground">Maintain your habits</p>
                  </div>
                  <Switch
                    id="streak-reminders"
                    checked={settings.notifications.streakReminders}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ streakReminders: checked })
                    }
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">No notifications during these times</p>
                  </div>
                  <Switch
                    id="quiet-hours"
                    checked={settings.notifications.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({
                        quietHours: { ...settings.notifications.quietHours, enabled: checked }
                      })
                    }
                  />
                </div>
                {settings.notifications.quietHours.enabled && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="quiet-start" className="text-sm text-muted-foreground">From:</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) =>
                          updateNotificationSettings({
                            quietHours: { ...settings.notifications.quietHours, start: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="quiet-end" className="text-sm text-muted-foreground">To:</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) =>
                          updateNotificationSettings({
                            quietHours: { ...settings.notifications.quietHours, end: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>Export, import, and backup your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3" 
            onClick={handleExportJSON}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            Export Data (JSON)
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3"
            onClick={() => setShowImportDialog(true)}
            data-testid="button-import"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3"
            onClick={() => setShowEncryptDialog(true)}
            data-testid="button-backup"
          >
            <Lock className="h-4 w-4" />
            Create Encrypted Backup
          </Button>
        </CardContent>
      </Card>

      {/* Cloud Sync (Stub) */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Cloud Sync (Beta)</CardTitle>
          <CardDescription>
            Sync your data across devices (feature coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="cloud-sync">Enable Cloud Sync</Label>
            <Switch
              id="cloud-sync"
              checked={settings.cloudSync}
              disabled
              data-testid="switch-cloud-sync"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Recovery Companion v1.0.0</p>
        <p className="mt-1">Privacy-first • Offline-capable • Open source</p>
      </div>

      {/* Encrypted Backup Dialog */}
      <Dialog open={showEncryptDialog} onOpenChange={setShowEncryptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Encrypted Backup</DialogTitle>
            <DialogDescription>
              Protect your backup with a passphrase
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Warning</AlertTitle>
            <AlertDescription>
              If you lose your passphrase, you will NOT be able to recover this backup. 
              Write it down and store it safely.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase"
                data-testid="input-passphrase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
              <Input
                id="confirm-passphrase"
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter your passphrase"
                data-testid="input-confirm-passphrase"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEncryptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportEncrypted} data-testid="button-create-backup">
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a backup file to restore your data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json,.enc"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImportFile(file);
                    setIsEncryptedImport(file.name.endsWith('.enc'));
                  }
                }}
                data-testid="input-file"
              />
            </div>

            {isEncryptedImport && (
              <div className="space-y-2">
                <Label htmlFor="import-passphrase">Passphrase</Label>
                <Input
                  id="import-passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter backup passphrase"
                  data-testid="input-import-passphrase"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile} data-testid="button-import-confirm">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
