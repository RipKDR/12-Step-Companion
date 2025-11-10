import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  helpText?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  helpText,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="mb-4 rounded-full bg-muted p-6">
      <Icon className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Button onClick={onAction} size="lg">
        {actionLabel}
      </Button>
      {secondaryAction && (
        <Button onClick={secondaryAction.onClick} variant="outline" size="lg">
          {secondaryAction.label}
        </Button>
      )}
    </div>
    {helpText && (
      <p className="text-sm text-muted-foreground mt-4">{helpText}</p>
    )}
  </div>
);

