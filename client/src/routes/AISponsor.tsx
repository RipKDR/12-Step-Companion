import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Bot,
  Send,
  Trash2,
  Loader2,
  Heart,
  User,
  Sparkles,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AISponsor() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        content: "Hi there! 👋 I'm your AI Sponsor - a supportive companion here to listen, offer guidance, and help you through difficult moments.\n\nI'm here 24/7, whenever you need someone to talk to. How are you feeling today?",
      });
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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
          conversationHistory: messages.slice(-10),
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
        title: 'Connection Error',
        description: 'Unable to reach AI Sponsor. Please check your connection and try again.',
        variant: 'destructive',
      });

      addMessage({
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. 😔\n\nPlease try again in a moment, or reach out to a human sponsor if you need immediate support.",
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
    setFeedbackGiven({});
    toast({
      title: 'Chat cleared',
      description: 'Your conversation has been cleared.',
    });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Message copied successfully.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy message.',
        variant: 'destructive',
      });
    }
  };

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: type }));
    trackEvent(type === 'up' ? 'ai_sponsor_feedback_positive' : 'ai_sponsor_feedback_negative');
    toast({
      title: 'Thank you for your feedback',
      description: 'Your feedback helps improve the AI Sponsor experience.',
    });
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setIsLoading(true);
    setTyping(true);

    try {
      const response = await fetch('/api/ai-sponsor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: lastUserMessage.content,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate response');
      }

      const data = await response.json();

      addMessage({
        role: 'assistant',
        content: data.response,
      });

      toast({
        title: 'Response regenerated',
        description: 'A new response has been generated.',
      });
    } catch (error) {
      toast({
        title: 'Regeneration failed',
        description: 'Unable to regenerate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full py-12 px-4 text-center"
    >
      <motion.div
        className="relative mb-8"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/20 shadow-2xl">
          <Bot className="h-16 w-16 text-primary" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="h-8 w-8 text-pink-500 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
      >
        Your AI Sponsor is Ready
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-8 text-base leading-relaxed"
      >
        A safe, judgment-free space for support and guidance. Share what's on your mind—I'm here to listen and help you through.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center max-w-lg"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("I'm struggling with cravings today...")}
          className="text-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Struggling with cravings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("I need someone to talk to...")}
          className="text-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Heart className="mr-2 h-4 w-4" />
          Need to talk
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Can you help me understand step 1?")}
          className="text-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Bot className="mr-2 h-4 w-4" />
          Help with the steps
        </Button>
      </motion.div>
    </motion.div>
  );

  // Message component
  const Message = ({ message, index }: { message: any; index: number }) => {
    const isUser = message.role === 'user';
    const isCopied = copiedMessageId === message.id;
    const feedback = feedbackGiven[message.id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={cn(
          'flex gap-3 group',
          isUser ? 'justify-end' : 'justify-start'
        )}
        onMouseEnter={() => setHoveredMessageId(message.id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* AI Avatar */}
        {!isUser && (
          <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content */}
        <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]">
          {/* Message Bubble */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-md transition-all duration-200',
              isUser
                ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-br-md'
                : 'bg-gradient-to-br from-card to-muted/50 border border-border/50 rounded-bl-md',
              hoveredMessageId === message.id && 'shadow-lg scale-[1.01]'
            )}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Timestamp (appears on hover) */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredMessageId === message.id ? 0.7 : 0 }}
              className={cn(
                'text-xs mt-2 transition-opacity duration-200',
                isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </motion.p>
          </div>

          {/* Message Actions (AI messages only) */}
          {!isUser && hoveredMessageId === message.id && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 px-2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCopied ? 'Copied!' : 'Copy message'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-7 w-7 p-0',
                        feedback === 'up' && 'text-green-500'
                      )}
                      onClick={() => handleFeedback(message.id, 'up')}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Good response</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-7 w-7 p-0',
                        feedback === 'down' && 'text-red-500'
                      )}
                      onClick={() => handleFeedback(message.id, 'down')}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Needs improvement</p>
                  </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-4 mx-1" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleRegenerate}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <Avatar className="w-9 h-9 border-2 border-primary shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-5xl p-4 pb-24 h-screen flex flex-col">
        <Card className="flex-1 flex flex-col h-full overflow-hidden shadow-2xl border-2">
          {/* Enhanced Header */}
          <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                  <Avatar className="relative w-12 h-12 border-2 border-primary/30 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    AI Sponsor
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Heart className="h-5 w-5 text-pink-500" />
                    </motion.div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Available 24/7 for support and guidance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowClearDialog(true)}
                        disabled={messages.length === 0}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          {/* Messages Container with ScrollArea */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6 min-h-full">
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3 justify-start"
                    >
                      <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="bg-gradient-to-br from-card to-muted/50 rounded-2xl rounded-bl-md px-5 py-4 border border-border/50 shadow-md">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary/60"
                              animate={{
                                y: [0, -8, 0],
                                opacity: [0.6, 1, 0.6],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Enhanced Input Area */}
          <div className="flex-shrink-0 border-t bg-gradient-to-r from-background via-muted/30 to-background p-4 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Share what's on your mind... (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[60px] max-h-[160px] resize-none pr-12 text-base leading-relaxed transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:shadow-lg border-2"
                  disabled={isLoading}
                  rows={1}
                />
                <AnimatePresence>
                  {input.trim() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-3 right-3"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-[60px] w-[60px] shadow-xl transition-all hover:scale-110 hover:shadow-2xl disabled:scale-100 disabled:shadow-none"
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Send className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mt-3 text-center px-2"
            >
              💙 This AI provides support but is not a replacement for human connection or professional help
            </motion.p>
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
    </TooltipProvider>
  );
}
