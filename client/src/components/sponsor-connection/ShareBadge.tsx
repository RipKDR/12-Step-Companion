import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import type { SharedItem } from '@/types';

interface ShareBadgeProps {
  itemType: SharedItem['itemType'];
  itemId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ShareBadge({
  itemType,
  itemId,
  className,
  size = 'md',
  showLabel = false,
}: ShareBadgeProps) {
  const { toast } = useToast();
  const getActiveRelationships = useAppStore((state) => state.getActiveRelationships);
  const shareItem = useAppStore((state) => state.shareItem);
  const revokeSharing = useAppStore((state) => state.revokeSharing);
  const getSharedItemsForItem = useAppStore((state) => state.getSharedItemsForItem);
  const isItemShared = useAppStore((state) => state.isItemShared);
  
  const activeRelationships = getActiveRelationships();
  const sharedItems = getSharedItemsForItem(itemType, itemId);
  const activeSharedItems = sharedItems.filter((item) => !item.revokedAtISO);
  
  const isShared = activeSharedItems.length > 0;
  const sharedWith = activeSharedItems
    .map((item) => {
      const relationship = activeRelationships.find((rel) => rel.id === item.relationshipId);
      return relationship?.role === 'sponsor' 
        ? relationship.sponseeName || 'Sponsee'
        : relationship?.sponsorName || 'Sponsor';
    })
    .filter(Boolean);

  const handleShare = (relationshipId: string) => {
    if (isItemShared(itemType, itemId, relationshipId)) {
      // Find and revoke the shared item
      const sharedItem = activeSharedItems.find((item) => item.relationshipId === relationshipId);
      if (sharedItem) {
        revokeSharing(sharedItem.id);
        haptics.impact('light');
        toast({
          title: 'Sharing stopped',
          description: 'This item is no longer shared',
        });
      }
    } else {
      shareItem(itemType, itemId, relationshipId);
      haptics.impact('light');
      toast({
        title: 'Item shared',
        description: 'Your sponsor can now view this item',
      });
    }
  };

  if (activeRelationships.length === 0) {
    return null; // Don't show badge if no active relationships
  }

  const sizeClasses = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-7 w-7 text-base',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-auto p-1.5 rounded-full hover:bg-muted',
            isShared && 'bg-primary/10',
            className
          )}
          aria-label={isShared ? `Shared with ${sharedWith.join(', ')}` : 'Share with sponsor'}
        >
          {isShared ? (
            <Eye className={cn(iconSize[size], 'text-primary')} />
          ) : (
            <EyeOff className={cn(iconSize[size], 'text-muted-foreground')} />
          )}
          {showLabel && (
            <span className="ml-1.5 text-xs">
              {isShared ? 'Shared' : 'Share'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share with</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {activeRelationships.map((relationship) => {
          const isSharedWithThis = isItemShared(itemType, itemId, relationship.id);
          const name = relationship.role === 'sponsor'
            ? relationship.sponseeName || 'Sponsee'
            : relationship.sponsorName || 'Sponsor';

          return (
            <DropdownMenuItem
              key={relationship.id}
              onClick={() => handleShare(relationship.id)}
              className="cursor-pointer min-h-[44px]"
            >
              <div className="flex items-center justify-between w-full">
                <span>{name}</span>
                {isSharedWithThis && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        {isShared && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Shared with: {sharedWith.join(', ')}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

