import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Phone, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

type ConnectionMode = 'select' | 'sponsor' | 'sponsee';

export default function ConnectionFlow() {
  const [mode, setMode] = useState<ConnectionMode>('select');
  const [code, setCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const profile = useAppStore((state) => state.profile);
  const generateSponsorCode = useAppStore((state) => state.generateSponsorCode);
  const connectToSponsor = useAppStore((state) => state.connectToSponsor);
  const getActiveRelationships = useAppStore((state) => state.getActiveRelationships);
  const acceptConnection = useAppStore((state) => state.acceptConnection);
  const revokeConnection = useAppStore((state) => state.revokeConnection);
  
  const activeRelationships = getActiveRelationships();

  // Generate code when sponsor mode is selected
  useEffect(() => {
    if (mode === 'sponsor' && !code) {
      const newCode = generateSponsorCode();
      setCode(newCode);
    }
  }, [mode, code, generateSponsorCode]);

  const handleCopyCode = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      haptics.impact('light');
      toast({
        title: 'Code copied',
        description: 'Share this code with your sponsee',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually',
        variant: 'destructive',
      });
    }
  };

  const handleConnect = async () => {
    if (!enteredCode || enteredCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    haptics.impact('medium');
    
    try {
      await connectToSponsor(enteredCode, profile?.name);
      toast({
        title: 'Connection requested',
        description: 'Waiting for sponsor to accept...',
      });
      setMode('select');
      setEnteredCode('');
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Please check the code and try again',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptConnection = (relationshipId: string) => {
    acceptConnection(relationshipId);
    haptics.impact('medium');
    toast({
      title: 'Connection accepted',
      description: 'You can now view shared items',
    });
  };

  const handleRevokeConnection = (relationshipId: string) => {
    revokeConnection(relationshipId);
    haptics.impact('medium');
    toast({
      title: 'Connection revoked',
      description: 'Sharing has been stopped',
    });
  };

  if (mode === 'select') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Connection</CardTitle>
            <CardDescription>
              Connect with your sponsor or sponsee to share recovery progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setMode('sponsor')}
              className="w-full min-h-[44px]"
              size="lg"
            >
              I'm a Sponsor
            </Button>
            <Button
              onClick={() => setMode('sponsee')}
              variant="outline"
              className="w-full min-h-[44px]"
              size="lg"
            >
              I'm a Sponsee
            </Button>
          </CardContent>
        </Card>

        {activeRelationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRelationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {relationship.role === 'sponsor' 
                        ? relationship.sponseeName || 'Sponsee'
                        : relationship.sponsorName || 'Sponsor'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {relationship.status === 'active' ? 'Active' : 'Pending'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {relationship.status === 'pending' && relationship.role === 'sponsor' && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptConnection(relationship.id)}
                      >
                        Accept
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevokeConnection(relationship.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (mode === 'sponsor') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Share Your Code</CardTitle>
          <CardDescription>
            Share this code with your sponsee so they can connect with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold tracking-wider text-primary">
              {code}
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {code ? 'Active' : 'Generating...'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopyCode}
              className="flex-1 min-h-[44px]"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              onClick={() => setMode('select')}
              variant="ghost"
              className="min-h-[44px]"
            >
              Back
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Share this code securely with your sponsee</p>
            <p>• They will enter it in their app to connect</p>
            <p>• You'll need to accept the connection request</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'sponsee') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Sponsor Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code your sponsor shared with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={enteredCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setEnteredCode(value);
              }}
              placeholder="000000"
              className="text-center text-2xl font-mono tracking-widest h-16"
              aria-label="Sponsor code"
            />
            <div className="text-sm text-muted-foreground text-center">
              {enteredCode.length}/6 digits
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={enteredCode.length !== 6 || isConnecting}
            className="w-full min-h-[44px]"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>

          <Button
            onClick={() => {
              setMode('select');
              setEnteredCode('');
            }}
            variant="ghost"
            className="w-full min-h-[44px]"
          >
            Back
          </Button>

          {enteredCode.length === 6 && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ready to connect</p>
                  <p className="text-muted-foreground">
                    Make sure this matches the code your sponsor gave you
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

