import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Smile, Frown, Meh, AlertTriangle } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { SwipeableItem } from './SwipeableItem';
import { ContextualMenu } from './ContextualMenu';

interface JournalEntryCardProps {
  date: string;
  content: string;
  mood?: number;
  tags: string[];
  isTrigger?: boolean;
  triggerType?: string;
  triggerIntensity?: number;
  audioData?: string;
  audioDuration?: number;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

function getMoodIcon(mood?: number) {
  if (!mood) return null;
  if (mood >= 7) return <Smile className="h-4 w-4 text-green-600" />;
  if (mood >= 4) return <Meh className="h-4 w-4 text-yellow-600" />;
  return <Frown className="h-4 w-4 text-red-600" />;
}

export default function JournalEntryCard({ 
  date, 
  content, 
  mood, 
  tags, 
  isTrigger, 
  triggerType, 
  triggerIntensity, 
  audioData, 
  audioDuration, 
  onClick,
  onDelete,
  onEdit,
  onShare,
}: JournalEntryCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;

  const cardContent = (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Journal entry from ${formattedDate}`}
      data-testid="journal-entry-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time dateTime={date}>{formattedDate}</time>
          </div>
          {getMoodIcon(mood) && (
            <span aria-label={`Mood: ${mood ? (mood >= 7 ? 'Good' : mood >= 4 ? 'Neutral' : 'Low') : 'Not specified'}`}>
              {getMoodIcon(mood)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground line-clamp-3">{preview}</p>
        {audioData && (
          <div onClick={(e) => e.stopPropagation()}>
            <AudioPlayer audioData={audioData} duration={audioDuration} />
          </div>
        )}
        {isTrigger && (
          <div className="flex items-center gap-2 text-sm" role="alert" aria-label="Trigger entry">
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Trigger: {triggerType}
            </Badge>
            {triggerIntensity && (
              <Badge variant="outline" aria-label={`Trigger intensity: ${triggerIntensity} out of 10`}>
                Intensity: {triggerIntensity}/10
              </Badge>
            )}
          </div>
        )}
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

  // Wrap with swipeable and contextual menu if actions are provided
  if (onDelete || onEdit || onShare) {
    return (
      <SwipeableItem
        onDelete={onDelete}
        disabled={!onDelete}
      >
        <ContextualMenu
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
        >
          {cardContent}
        </ContextualMenu>
      </SwipeableItem>
    );
  }

  return cardContent;
}
