import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ThemeToggle from '@/components/ThemeToggle';
import { Download, Upload, Lock, User, FileText } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cloudSync, setCloudSync] = useState(false);

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
            <p className="text-base font-medium">Alex</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Clean Date</Label>
            <p className="text-base font-medium">
              {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
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
              checked={highContrast}
              onCheckedChange={setHighContrast}
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
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              data-testid="switch-reduced-motion"
            />
          </div>
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
          <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-export">
            <Download className="h-4 w-4" />
            Export Data (JSON)
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-import">
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-backup">
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
              checked={cloudSync}
              onCheckedChange={setCloudSync}
              disabled
              data-testid="switch-cloud-sync"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Content Manager</CardTitle>
          <CardDescription>Import step questions and worksheets</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" data-testid="button-import-content">
            Import Step Questions
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Recovery Companion v1.0.0</p>
        <p className="mt-1">Privacy-first • Offline-capable • Open source</p>
      </div>
    </div>
  );
}
