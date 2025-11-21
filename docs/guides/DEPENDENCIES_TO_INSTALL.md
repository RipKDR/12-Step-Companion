# Dependencies to Install

Run this command to install required dependencies:

```bash
npm install react-hotkeys-hook react-window @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-countup @use-gesture/react
```

Or with pnpm:
```bash
pnpm add react-hotkeys-hook react-window @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-countup @use-gesture/react
```

These dependencies are needed for:
- `react-hotkeys-hook`: Keyboard shortcuts (Cmd+K command palette)
- `react-window`: Virtual scrolling for performance
- `@dnd-kit/*`: Drag-and-drop functionality
- `react-countup`: Smooth number counting animations
- `@use-gesture/react`: Advanced gesture handling (alternative to framer-motion gestures)

Note: The code will work without these initially, but features requiring them will need installation.

