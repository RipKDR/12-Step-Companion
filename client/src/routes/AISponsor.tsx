import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useAppStore } from '@/store/useAppStore';
import { Bot, Send, Trash2, Loader2, Heart, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AISponsor() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Track when chat is opened
  useEffect(() => {
    trackEvent('ai_sponsor_chat_opened');
  }, [trackEvent]);

  // Show welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'assistant',
        content: "Hi there! I'm your AI Sponsor - a supportive companion here to listen, offer guidance, and help you through difficult moments. I'm here 24/7, whenever you need someone to talk to. How are you feeling today?",
      });
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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
    clearChat();
    setShowClearDialog(false);
    toast({
      title: 'Chat cleared',
      description: 'Your conversation has been cleared.',
    });
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20">
          <Bot className="h-12 w-12 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        Your AI Sponsor is Ready
        <Heart className="h-5 w-5 text-pink-500" />
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        I'm here to listen, support, and guide you through difficult moments.
        Share what's on your mind, and let's talk it through together.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("I'm struggling with cravings today...")}
          className="text-xs"
        >
          I'm struggling with cravings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("I need someone to talk to...")}
          className="text-xs"
        >
          I need to talk
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Can you help me understand step 1?")}
          className="text-xs"
        >
          Help with the steps
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl p-4 pb-24 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col h-full overflow-hidden shadow-lg">
        {/* Enhanced Header with Gradient */}
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                <div className="relative p-2 rounded-full bg-primary/10 border border-primary/20">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  AI Sponsor
                  <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Available 24/7 for support and guidance
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowClearDialog(true)}
              disabled={messages.length === 0}
              aria-label="Clear conversation"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Container with ARIA */}
        <CardContent
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  role="article"
                  aria-label={`${message.role === 'user' ? 'You' : 'AI Sponsor'} said`}
                >
                  {/* AI Avatar */}
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200',
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                        : 'bg-gradient-to-br from-muted to-muted/80 rounded-bl-md border border-border/50',
                      hoveredMessageId === message.id && 'scale-[1.02] shadow-md'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-2 transition-opacity duration-200',
                        message.role === 'user' ? 'opacity-70' : 'opacity-60',
                        hoveredMessageId === message.id ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div
                  className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300"
                  role="status"
                  aria-label="AI Sponsor is typing"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-md px-4 py-3 border border-border/50 shadow-sm">
                    <div className="flex gap-1.5" aria-hidden="true">
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: '0ms', animationDuration: '1s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: '200ms', animationDuration: '1s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: '400ms', animationDuration: '1s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-gradient-to-r from-background via-muted/20 to-background p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[120px] resize-none pr-12 transition-shadow focus-visible:ring-primary/50 focus-visible:shadow-lg"
                disabled={isLoading}
                aria-label="Message input"
                rows={1}
              />
              {input.trim() && (
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground animate-in fade-in">
                  <Sparkles className="h-3 w-3" />
                </div>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:scale-100 disabled:shadow-none"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center px-2">
            Remember: This AI provides support but is not a replacement for human connection or professional help.
          </p>
        </div>
      </Card>

      {/* Clear Chat Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
