import { FixedSizeList as List } from "react-window"
import { ReactNode, useMemo } from "react"
import { cn } from "@/lib/utils"

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscanCount?: number
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    return (
      <div style={style} className={cn("px-4", className)}>
        {renderItem(item, index)}
      </div>
    )
  }

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      width="100%"
    >
      {Row}
    </List>
  )
}

// Hook to determine if virtualization is needed
export function useShouldVirtualize(itemCount: number, threshold = 50) {
  return useMemo(() => itemCount > threshold, [itemCount, threshold])
}

