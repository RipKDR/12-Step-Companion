import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Smile, Frown, Meh } from 'lucide-react';

interface JournalEntryCardProps {
  date: string;
  content: string;
  mood?: number;
  tags: string[];
  onClick: () => void;
}

function getMoodIcon(mood?: number) {
  if (!mood) return null;
  if (mood >= 7) return <Smile className="h-4 w-4 text-green-600" />;
  if (mood >= 4) return <Meh className="h-4 w-4 text-yellow-600" />;
  return <Frown className="h-4 w-4 text-red-600" />;
}

export default function JournalEntryCard({ date, content, mood, tags, onClick }: JournalEntryCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;

  return (
    <Card 
      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid="journal-entry-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          {getMoodIcon(mood)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground line-clamp-3">{preview}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
