import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Home, BookOpen, BookMarked, BarChart3, Settings, FileText, MapPin, Users, Trophy, MoreHorizontal } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation()
  const profile = useAppStore((state) => state.profile)

  const routes = [
    { path: "/", label: "Home", icon: Home, keywords: ["home", "dashboard", "main"] },
    { path: "/steps", label: "Steps", icon: BookOpen, keywords: ["steps", "step work", "12 steps"] },
    { path: "/journal", label: "Journal", icon: BookMarked, keywords: ["journal", "entries", "log"] },
    { path: "/analytics", label: "Analytics", icon: BarChart3, keywords: ["analytics", "insights", "stats"] },
    { path: "/worksheets", label: "Worksheets", icon: FileText, keywords: ["worksheets", "forms"] },
    { path: "/meetings", label: "Meetings", icon: MapPin, keywords: ["meetings", "meeting finder"] },
    { path: "/contacts", label: "Contacts", icon: Users, keywords: ["contacts", "sponsor"] },
    { path: "/achievements", label: "Achievements", icon: Trophy, keywords: ["achievements", "badges"] },
    { path: "/settings", label: "Settings", icon: Settings, keywords: ["settings", "preferences"] },
    { path: "/more", label: "More", icon: MoreHorizontal, keywords: ["more", "menu"] },
  ]

  const handleSelect = (path: string) => {
    setLocation(path)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} aria-label="Command palette">
      <CommandInput placeholder="Search or navigate..." aria-label="Search commands" />
      <CommandList role="listbox" aria-label="Command list">
        <CommandEmpty role="option">No results found.</CommandEmpty>
        <CommandGroup heading="Navigation" role="group" aria-label="Navigation commands">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <CommandItem
                key={route.path}
                value={`${route.label} ${route.keywords.join(" ")}`}
                onSelect={() => handleSelect(route.path)}
                role="option"
                aria-label={`Navigate to ${route.label}`}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{route.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        {profile && (
          <>
            <CommandSeparator role="separator" />
            <CommandGroup heading="Quick Actions" role="group" aria-label="Quick action commands">
              <CommandItem
                value="new journal entry"
                onSelect={() => {
                  // This would trigger the journal modal
                  onOpenChange(false)
                }}
                role="option"
                aria-label="Create new journal entry"
              >
                <BookMarked className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>New Journal Entry</span>
              </CommandItem>
              <CommandItem
                value="gratitude"
                onSelect={() => {
                  // This would trigger the gratitude modal
                  onOpenChange(false)
                }}
                role="option"
                aria-label="Add gratitude entry"
              >
                <span className="mr-2" aria-hidden="true">🙏</span>
                <span>Add Gratitude</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

// Hook to manage command palette with keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}

