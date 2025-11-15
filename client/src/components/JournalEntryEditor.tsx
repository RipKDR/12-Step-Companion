import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InlineEditor } from "./InlineEditor"
import { Calendar, X, Sparkles } from "lucide-react"
import { useLocation } from "wouter"
import { cn } from "@/lib/utils"
import type { JournalEntry } from "@/types"

interface JournalEntryEditorProps {
  entry: JournalEntry
  onSave: (updates: Partial<JournalEntry>) => void
  onCancel: () => void
  className?: string
}

export function JournalEntryEditor({
  entry,
  onSave,
  onCancel,
  className,
}: JournalEntryEditorProps) {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState(entry.content)
  const [tags, setTags] = useState(entry.tags.join(", "))

  useEffect(() => {
    setContent(entry.content)
    setTags(entry.tags.join(", "))
  }, [entry])

  const handleSave = () => {
    onSave({
      content: content.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    })
  }

  const formattedDate = new Date(entry.date).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <InlineEditor
          value={content}
          onSave={(value) => {
            setContent(value)
            handleSave()
          }}
          placeholder="Write your thoughts..."
          multiline={true}
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none"
            placeholder="Write your thoughts..."
          />
        </InlineEditor>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tags (comma-separated)
          </label>
          <InlineEditor
            value={tags}
            onSave={(value) => {
              setTags(value)
              handleSave()
            }}
            placeholder="gratitude, reflection, ..."
          >
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              placeholder="gratitude, reflection, ..."
            />
          </InlineEditor>
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.setItem('copilot_initial_message', `Can you help me process this journal entry? I wrote: "${content.substring(0, 200)}${content.length > 200 ? '...' : ''}". Can you help me identify themes or connections to my step work?`);
              setLocation('/ai-sponsor');
            }}
            className="gap-2"
          >
            <Sparkles className="h-3 w-3" />
            Process with Copilot
          </Button>
          <Button onClick={handleSave} size="sm" className="flex-1">
            Save Changes
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

