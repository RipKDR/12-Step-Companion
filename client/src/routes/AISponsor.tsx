import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { Bot, Send, Trash2, Loader2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AISponsor() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasShownWelcome = useRef(false);
  const { toast } = useToast();

  const messages = useAppStore((state) => state.getAISponsorMessages());
  const addMessage = useAppStore((state) => state.addAISponsorMessage);
  const clearChat = useAppStore((state) => state.clearAISponsorChat);
  const isTyping = useAppStore((state) => state.aiSponsorChat?.isTyping || false);
  const setTyping = useAppStore((state) => state.setAISponsorTyping);
  const trackEvent = useAppStore((state) => state.trackAnalyticsEvent);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Track when chat is opened (only once)
  useEffect(() => {
    trackEvent('ai_sponsor_chat_opened');
  }, []);

  // Show welcome message if no messages (only once on mount)
  useEffect(() => {
    if (messages.length === 0 && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      addMessage({
        role: 'assistant',
        content: "Hi there! I'm your AI Sponsor - a supportive companion here to listen, offer guidance, and help you through difficult moments. I'm here 24/7, whenever you need someone to talk to. How are you feeling today?",
      });
    }
  }, []);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    addMessage({
      role: 'user',
      content: trimmedInput,
    });

    setInput('');
    setIsLoading(true);
    setTyping(true);

    try {
      // Call backend API to get AI response
      const response = await fetch('/api/ai-sponsor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedInput,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI Sponsor');
      }

      const data = await response.json();

      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });

      // Add error message from assistant
      addMessage({
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or reach out to a human sponsor if you need immediate support.",
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
      clearChat();
      toast({
        title: 'Chat cleared',
        description: 'Your conversation has been cleared.',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 pb-24 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col h-full overflow-hidden">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Sponsor
                  <Heart className="h-4 w-4 text-pink-500" />
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Available 24/7 for support and guidance
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="flex-shrink-0 border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Remember: This AI provides support but is not a replacement for human connection or professional help.
          </p>
        </div>
      </Card>
    </div>
  );
}
