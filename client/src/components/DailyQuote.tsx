import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Quote } from 'lucide-react';
import { loadQuotes } from '@/lib/contentLoader';
import { useAppStore } from '@/store/useAppStore';
import type { RecoveryQuote } from '@/types';
import { cn } from '@/lib/utils';

export default function DailyQuote() {
  const [quote, setQuote] = useState<RecoveryQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const toggleFavoriteQuote = useAppStore((state) => state.toggleFavoriteQuote);
  const isFavoriteQuote = useAppStore((state) => state.isFavoriteQuote);

  useEffect(() => {
    loadQuotes().then((quotes) => {
      if (quotes.length > 0) {
        // Select quote based on day of year so it rotates daily
        const dayOfYear = Math.floor(
          (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        const selectedQuote = quotes[dayOfYear % quotes.length];
        setQuote(selectedQuote);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Quote className="h-5 w-5 text-primary" />
            </div>
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  const isFavorite = isFavoriteQuote(quote.id);

  const handleToggleFavorite = () => {
    toggleFavoriteQuote(quote.id);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      hope: 'text-blue-600 dark:text-blue-400',
      strength: 'text-orange-600 dark:text-orange-400',
      connection: 'text-purple-600 dark:text-purple-400',
      principles: 'text-green-600 dark:text-green-400',
      service: 'text-amber-600 dark:text-amber-400',
      gratitude: 'text-pink-600 dark:text-pink-400',
    };
    return colors[category as keyof typeof colors] || 'text-primary';
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2" data-testid="card-daily-quote">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Quote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Daily Recovery Quote</h2>
              <p className={cn("text-xs font-medium", getCategoryColor(quote.category))}>
                {getCategoryLabel(quote.category)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={cn(
              "transition-colors",
              isFavorite && "text-pink-600 dark:text-pink-400"
            )}
            data-testid="button-favorite-quote"
            aria-label={isFavorite ? "Unfavorite quote" : "Favorite quote"}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        </div>

        <blockquote className="relative">
          <p className="text-base italic text-foreground leading-relaxed mb-3">
            "{quote.text}"
          </p>
          {(quote.author || quote.source) && (
            <footer className="text-sm text-muted-foreground">
              — {quote.author || quote.source}
            </footer>
          )}
        </blockquote>
      </CardContent>
    </Card>
  );
}
