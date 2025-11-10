import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAppStore } from '@/store/useAppStore';
import {
  Bot,
  Send,
  Trash2,
  Loader2,
  User,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  Info,
  ChevronDown,
  Heart,
  Calendar,
  FileText,
  List,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Constants
const MAX_CONVERSATION_HISTORY = 10;
const MAX_JOURNAL_PREVIEW = 200;
const MAX_TEXTAREA_HEIGHT = 200;
const MIN_TEXTAREA_HEIGHT = 60;
const RATE_LIMIT_MS = 2000; // 2 seconds between messages

export default function AISponsor() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [showContext, setShowContext] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const messages = useAppStore((state) => state.getAISponsorMessages());
  const addMessage = useAppStore((state) => state.addAISponsorMessage);
  const clearChat = useAppStore((state) => state.clearAISponsorChat);
  const isTyping = useAppStore((state) => state.aiSponsorChat?.isTyping || false);
  const setTyping = useAppStore((state) => state.setAISponsorTyping);
  const trackEvent = useAppStore((state) => state.trackAnalyticsEvent);

  // Get user data for context
  const profile = useAppStore((state) => state.profile);
  const triggers = useAppStore((state) => state.triggers);
  const journals = useAppStore((state) => state.journals);
  const stepAnswers = useAppStore((state) => state.stepAnswers);

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
        content: "Hi! I'm your AI Sponsor. I'm here to listen and support you through difficult moments. I have access to your triggers, journal entries, and step progress to provide personalized guidance. How can I help you today?",
      });
    }
  }, [messages.length, addMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [input]);

  // Memoize user context to avoid recalculation on every render
  const userContext = useMemo(() => {
    const triggersList = Object.values(triggers || {});
    const journalsList = Object.values(journals || {})
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    return {
      name: profile?.name,
      sobrietyDate: profile?.cleanDate,
      triggers: triggersList.map(t => ({
        name: t.name,
        description: t.description,
        severity: t.severity,
      })),
      recentJournals: journalsList.map(j => ({
        date: j.date,
        // Truncate content on client side for privacy/performance
        content: j.content?.substring(0, MAX_JOURNAL_PREVIEW) || '',
        mood: j.mood,
      })),
      stepProgress: stepAnswers,
    };
  }, [profile?.name, profile?.cleanDate, triggers, journals, stepAnswers]);

  // Extract shared API call logic
  const sendToAI = useCallback(async (message: string) => {
    const response = await fetch('/api/ai-sponsor/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: messages.slice(-MAX_CONVERSATION_HISTORY),
        userContext,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.response || 'Failed to get response from AI Sponsor');
    }

    const data = await response.json();
    return data.response;
  }, [messages, userContext]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSentTime < RATE_LIMIT_MS) {
      toast({
        title: 'Please wait',
        description: 'Slow down a bit. Take a breath.',
        variant: 'default',
      });
      return;
    }

    setLastSentTime(now);

    addMessage({
      role: 'user',
      content: trimmedInput,
    });

    setInput('');
    setIsLoading(true);
    setTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const responseText = await sendToAI(trimmedInput);

      addMessage({
        role: 'assistant',
        content: responseText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to reach AI Sponsor. Please try again.';

      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });

      addMessage({
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or reach out to a human sponsor if you need immediate support.",
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, lastSentTime, sendToAI, addMessage, setTyping, toast]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleClearChat = useCallback(() => {
    clearChat();
    setShowClearDialog(false);
    setFeedbackGiven({});
    toast({
      title: 'Chat cleared',
      description: 'Your conversation has been cleared.',
    });
    // Focus textarea after clearing
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [clearChat, toast]);

  const copyToClipboard = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy message.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: type }));
    trackEvent(type === 'up' ? 'ai_sponsor_feedback_positive' : 'ai_sponsor_feedback_negative');
  }, [trackEvent]);

  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2 || isLoading) return;

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setIsLoading(true);
    setTyping(true);

    try {
      const responseText = await sendToAI(lastUserMessage.content);

      addMessage({
        role: 'assistant',
        content: responseText,
      });

      toast({
        title: 'Response regenerated',
        description: 'A new response has been generated.',
      });
    } catch (error) {
      toast({
        title: 'Regeneration failed',
        description: 'Unable to regenerate response.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  }, [messages, isLoading, sendToAI, addMessage, setTyping, toast]);

  const ContextPanel = () => {
    const daysClean = userContext.sobrietyDate
      ? Math.max(0, Math.floor((Date.now() - new Date(userContext.sobrietyDate).getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return (
      <Collapsible open={showContext} onOpenChange={setShowContext}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="text-xs">Personal Context</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', showContext && 'rotate-180')} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              AI Sponsor uses this information to provide personalized support:
            </p>

            {daysClean !== null && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Clean Date</div>
                  <div className="text-muted-foreground">{daysClean} days clean</div>
                </div>
              </div>
            )}

            {userContext.triggers.length > 0 && (
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium mb-1">Known Triggers</div>
                  <div className="flex flex-wrap gap-1">
                    {userContext.triggers.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {t.name}
                      </Badge>
                    ))}
                    {userContext.triggers.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{userContext.triggers.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {userContext.recentJournals.length > 0 && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Recent Journals</div>
                  <div className="text-muted-foreground">Last {userContext.recentJournals.length} entries</div>
                </div>
              </div>
            )}

            {userContext.stepProgress && Object.keys(userContext.stepProgress).length > 0 && (
              <div className="flex items-start gap-2">
                <List className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Step Progress</div>
                  <div className="text-muted-foreground">
                    {Object.keys(userContext.stepProgress).filter(s => userContext.stepProgress[s]?.completed).length} steps completed
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Your Personal AI Sponsor</h2>
      <p className="text-muted-foreground text-center max-w-md mb-2">
        I know your triggers, progress, and journey. Share what's on your mind.
      </p>
      <p className="text-xs text-muted-foreground mb-8">
        Available 24/7 for personalized support and guidance
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        <button
          onClick={() => setInput("I'm struggling with cravings today")}
          className="text-left p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="font-medium mb-1">Struggling with cravings</div>
          <div className="text-sm text-muted-foreground">Get a personalized action plan</div>
        </button>
        <button
          onClick={() => setInput("I need someone to talk to")}
          className="text-left p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="font-medium mb-1">Need to talk</div>
          <div className="text-sm text-muted-foreground">Vent and process your feelings</div>
        </button>
        <button
          onClick={() => setInput("Can you help me with my current step?")}
          className="text-left p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="font-medium mb-1">Help with my step work</div>
          <div className="text-sm text-muted-foreground">Work through the 12 steps</div>
        </button>
        <button
          onClick={() => setInput("I'm feeling overwhelmed")}
          className="text-left p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="font-medium mb-1">Feeling overwhelmed</div>
          <div className="text-sm text-muted-foreground">Find immediate coping strategies</div>
        </button>
      </div>
    </div>
  );

  const Message = ({ message, index }: { message: any; index: number }) => {
    const isUser = message.role === 'user';
    const isCopied = copiedMessageId === message.id;
    const feedback = feedbackGiven[message.id];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative py-6 px-4',
          isUser ? 'bg-background' : 'bg-muted/30'
        )}
        onMouseEnter={() => setHoveredMessageId(message.id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
              {isUser ? (
                <User className="h-5 w-5 text-primary" />
              ) : (
                <Bot className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-2">
                {isUser ? 'You' : 'AI Sponsor'}
              </div>
              {isUser ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-pre:bg-muted prose-pre:text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Actions (AI messages only) */}
              {!isUser && (
                <div
                  className={cn(
                    'flex items-center gap-2 mt-3 transition-opacity',
                    hoveredMessageId === message.id ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          {isCopied ? 'Copied' : 'Copy'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy message</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-8 px-2',
                            feedback === 'up' && 'bg-accent'
                          )}
                          onClick={() => handleFeedback(message.id, 'up')}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Good response</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-8 px-2',
                            feedback === 'down' && 'bg-accent'
                          )}
                          onClick={() => handleFeedback(message.id, 'down')}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Poor response</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-4" />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={handleRegenerate}
                          disabled={isLoading}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Regenerate
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Generate new response</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">AI Sponsor</h1>
              <p className="text-xs text-muted-foreground">Personal recovery companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ContextPanel />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearDialog(true)}
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="min-h-full">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <Message key={message.id} message={message} index={index} />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6 px-4 bg-muted/30"
                  >
                    <div className="max-w-3xl mx-auto">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-2">AI Sponsor</div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="min-h-[60px] max-h-[200px] resize-none"
                disabled={isLoading}
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI Sponsor uses your personal data to provide tailored support. For crisis, call 988 or your sponsor immediately.
            </p>
          </div>
        </div>

        {/* Clear Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all messages in this conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearChat}>
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
