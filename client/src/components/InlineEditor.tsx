import { useState, useRef, useEffect, ReactNode } from "react"
import React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { haptics } from "@/lib/haptics"

interface InlineEditorProps {
  value: string
  onSave: (value: string) => void
  onCancel?: () => void
  placeholder?: string
  multiline?: boolean
  className?: string
  children?: ReactNode
  renderDisplay?: (value: string, onClick: () => void) => ReactNode
}

export function InlineEditor({
  value: initialValue,
  onSave,
  onCancel,
  placeholder = "Click to edit",
  multiline = false,
  className,
  children,
  renderDisplay,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setIsEditing(true)
    haptics.light()
  }

  const handleSave = () => {
    if (value.trim() !== initialValue) {
      onSave(value.trim())
      haptics.success()
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
    onCancel?.()
    haptics.light()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditing) {
    // If children are provided and it's a textarea/input, use them directly
    if (children && typeof children === 'object' && 'type' in children) {
      const childElement = children as React.ReactElement
      return (
        <div className={cn("relative", className)}>
          {React.cloneElement(childElement, {
            ref: inputRef,
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
            onKeyDown: handleKeyDown,
            onBlur: handleSave,
            placeholder: placeholder,
            className: cn(
              childElement.props.className,
              "border-primary focus:ring-2 focus:ring-ring"
            ),
          })}
          <div className="absolute top-2 right-2 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-6 w-6"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    }

    const InputComponent = multiline ? "textarea" : "input"
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <InputComponent
          ref={inputRef as HTMLInputElement & HTMLTextAreaElement}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={cn(
            "flex-1 px-2 py-1 rounded-md border border-primary bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            multiline && "min-h-[80px] resize-none"
          )}
        />
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            className="h-7 w-7"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-7 w-7"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (renderDisplay) {
    return <>{renderDisplay(value || placeholder, handleStartEdit)}</>
  }

  return (
    <div
      onClick={handleStartEdit}
      className={cn(
        "cursor-text hover:bg-muted/50 rounded-md px-2 py-1 transition-colors",
        !value && "text-muted-foreground italic",
        className
      )}
    >
      {children || value || placeholder}
    </div>
  )
}

