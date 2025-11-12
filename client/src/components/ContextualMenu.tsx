import { ReactNode, useState, useEffect } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Edit, Trash2, Share2, Archive, Copy } from "lucide-react"
import { haptics } from "@/lib/haptics"

interface ContextualMenuProps {
  children: ReactNode
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onArchive?: () => void
  onCopy?: () => void
  disabled?: boolean
}

export function ContextualMenu({
  children,
  onEdit,
  onDelete,
  onShare,
  onArchive,
  onCopy,
  disabled = false,
}: ContextualMenuProps) {
  if (disabled) {
    return <>{children}</>
  }

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      haptics.medium()
      action()
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild aria-label="Open context menu">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48" role="menu" aria-label="Context menu">
        {onEdit && (
          <ContextMenuItem
            onClick={() => handleAction(onEdit)}
            role="menuitem"
            aria-label="Edit item"
          >
            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Edit</span>
          </ContextMenuItem>
        )}
        {onCopy && (
          <ContextMenuItem
            onClick={() => handleAction(onCopy)}
            role="menuitem"
            aria-label="Copy item"
          >
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Copy</span>
          </ContextMenuItem>
        )}
        {onShare && (
          <ContextMenuItem
            onClick={() => handleAction(onShare)}
            role="menuitem"
            aria-label="Share item"
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Share</span>
          </ContextMenuItem>
        )}
        {(onEdit || onCopy || onShare) && (onArchive || onDelete) && (
          <ContextMenuSeparator role="separator" aria-orientation="horizontal" />
        )}
        {onArchive && (
          <ContextMenuItem
            onClick={() => handleAction(onArchive)}
            role="menuitem"
            aria-label="Archive item"
          >
            <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Archive</span>
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem
            onClick={() => handleAction(onDelete)}
            className="text-destructive focus:text-destructive"
            role="menuitem"
            aria-label="Delete item"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Delete</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Long-press hook for touch devices
export function useLongPress(
  onLongPress: () => void,
  ms = 500
) {
  const [startLongPress, setStartLongPress] = useState(false)

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    if (startLongPress) {
      timerId = setTimeout(() => {
        haptics.medium()
        onLongPress()
        setStartLongPress(false)
      }, ms)
    } else {
      if (timerId) clearTimeout(timerId)
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [startLongPress, ms, onLongPress])

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  }
}

