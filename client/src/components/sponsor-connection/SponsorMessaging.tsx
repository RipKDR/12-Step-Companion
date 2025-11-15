import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { haptics } from '@/lib/haptics';
import { encryptMessage, decryptMessage } from '@/lib/sponsor-crypto';
import { cn } from '@/lib/utils';
import type { SponsorRelationship, SponsorMessage } from '@/types';

interface SponsorMessagingProps {
  relationshipId: string;
  relationship: SponsorRelationship;
}

export default function SponsorMessaging({ relationshipId, relationship }: SponsorMessagingProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const profile = useAppStore((state) => state.profile);
  const sendSponsorMessage = useAppStore((state) => state.sendSponsorMessage);
  const getMessages = useAppStore((state) => state.getMessages);
  const markMessageRead = useAppStore((state) => state.markMessageRead);
  
  const messages = getMessages(relationshipId);
  const [decryptedMessages, setDecryptedMessages] = useState<Array<SponsorMessage & { decryptedContent?: string }>>([]);

  // Decrypt messages on mount and when messages change
  useEffect(() => {
    const decryptAllMessages = async () => {
      setIsDecrypting(true);
      try {
        const decrypted = await Promise.all(
          messages.map(async (msg) => {
            try {
              const content = await decryptMessage(
                msg.contentCiphertext,
                msg.nonce,
                relationshipId
              );
              return { ...msg, decryptedContent: content };
            } catch (error) {
              console.error('Failed to decrypt message:', error);
              return { ...msg, decryptedContent: '[Unable to decrypt]' };
            }
          })
        );
        setDecryptedMessages(decrypted);
      } catch (error) {
        console.error('Failed to decrypt messages:', error);
        setDecryptedMessages(messages.map((msg) => ({ ...msg, decryptedContent: '[Error]' })));
      } finally {
        setIsDecrypting(false);
      }
    };

    if (messages.length > 0) {
      decryptAllMessages();
    } else {
      setDecryptedMessages([]);
    }
  }, [messages, relationshipId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [decryptedMessages]);

  // Mark messages as read when viewing
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => !msg.readAtISO && msg.recipientId === profile?.id
    );
    unreadMessages.forEach((msg) => {
      markMessageRead(msg.id);
    });
  }, [messages, profile?.id, markMessageRead]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    haptics.impact('medium');

    try {
      // Encrypt the message
      const { ciphertext, nonce } = await encryptMessage(message, relationshipId);
      
      // Store encrypted message with nonce (salt is stored separately in localStorage)
      await sendSponsorMessage(relationshipId, ciphertext, nonce);
      
      setMessage('');
      toast({
        title: 'Message sent',
        description: 'Your encrypted message has been sent',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to send',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const otherPersonName = relationship.role === 'sponsor'
    ? relationship.sponseeName || 'Sponsee'
    : relationship.sponsorName || 'Sponsor';

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{otherPersonName}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Encrypted
          </Badge>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isDecrypting && decryptedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : decryptedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {decryptedMessages.map((msg) => {
              const isSent = msg.senderId === profile?.id;
              const isRead = !!msg.readAtISO;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isSent ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2',
                      isSent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {msg.decryptedContent || '[Decrypting...]'}
                    </div>
                    <div
                      className={cn(
                        'text-xs mt-1 flex items-center gap-1',
                        isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {new Date(msg.createdAtISO).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isSent && (
                        <span className="ml-1">
                          {isRead ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="min-h-[44px] resize-none"
            rows={1}
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            size="icon"
            className="min-h-[44px] min-w-[44px]"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Messages are end-to-end encrypted
        </p>
      </div>
    </Card>
  );
}

