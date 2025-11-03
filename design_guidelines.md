# Design Guidelines: Twelve-Step Recovery Companion PWA

## Design Approach

**Selected Approach:** Hybrid Design System + Reference-Based
- **Primary Inspiration:** Apple Health (calm, trustworthy health UI) + Google Material (accessible, familiar patterns)
- **Core Principle:** Therapeutic design—every element supports recovery, reduces cognitive load, and builds trust
- **Key References:** Headspace (calm interactions), Calm app (minimal stress), Apple Fitness (progress visualization)

**Justification:** This is a utility-focused health application requiring maximum accessibility, trust-building, and stress reduction. The design must feel professional, safe, and supportive while maintaining excellent usability for users potentially in crisis.

## Typography System

**Font Family:**
- Primary: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- Rationale: Native performance, maximum legibility, universal accessibility

**Type Scale:**
- Headings (h1): text-3xl (1.875rem) font-bold, line-height relaxed
- Headings (h2): text-2xl (1.5rem) font-semibold
- Headings (h3): text-xl (1.25rem) font-semibold
- Body Large: text-lg (1.125rem) for important content, clean-time counter
- Body: text-base (1rem) for primary content, line-height-relaxed (1.625)
- Small: text-sm (0.875rem) for helper text, timestamps
- Minimum body text: 16px (never smaller for accessibility)

**Weight Distribution:**
- Bold (700): Primary headings, critical information
- Semibold (600): Section headers, active states
- Regular (400): Body text, form inputs
- Light weights avoided for accessibility

## Layout System

**Spacing Primitives:** Consistent use of Tailwind units 2, 4, 8, 12, 16, 20
- Micro spacing (p-2, gap-2): Between related elements within components
- Standard spacing (p-4, gap-4, m-4): Card padding, form field spacing
- Section spacing (p-8, gap-8): Between major UI sections
- Generous spacing (p-12, p-16, p-20): Screen-level padding, breathing room

**Container Strategy:**
- App max-width: max-w-2xl (672px) for optimal readability and thumb reach
- Cards: Full-width within container, never cramped
- Forms: max-w-lg (512px) for optimal completion rates

**Grid System:**
- Mobile-first: Single column (grid-cols-1) default
- Dashboard cards: grid-cols-1 md:grid-cols-2 for daily cards
- Emergency actions: grid-cols-2 for quick access
- Worksheets list: grid-cols-1 with full-width cards

## Component Library

### Navigation
**Bottom Navigation Bar:**
- Fixed bottom position, elevation shadow
- 5 equal-width tabs: Home, Steps, Journal, Worksheets, Settings
- Icons + labels (always visible, never icon-only)
- Active state: filled icon, semibold label
- Minimum tap target: 56px height
- Safe-area padding for iOS notch

**Top App Bar:**
- Minimal: Logo/title left, optional action right
- Sticky on scroll for context retention
- No hamburger menus—all nav via bottom bar

### Cards & Containers
**Standard Card:**
- Rounded corners: rounded-xl (12px)
- Padding: p-6 (1.5rem)
- Subtle elevation: shadow-md with soft blur
- Hover state: subtle scale (scale-[1.02]) with shadow-lg transition
- Background: distinct from app background (layered depth)

**Dashboard Cards (Daily Intent/Reflection):**
- Full-width, stacked vertically with gap-4
- Icon header + title + quick input field
- Checkmark on completion (large, satisfying)
- Autosave indicator (subtle, non-intrusive)

### Sobriety Counter
**Visual Hierarchy:**
- Largest text on screen: text-5xl or text-6xl for primary count
- Nested time units stacked vertically: Years → Days → Hours → Minutes
- Each unit: Number (bold, large) + Label (regular, smaller)
- Optional: Subtle progress arc/ring visualization
- ARIA live region: polite, announces updates

### Forms & Inputs
**Text Inputs:**
- Height: h-12 (48px minimum) for accessibility
- Padding: px-4, py-3
- Border: 2px solid with rounded-lg
- Focus: ring-4 with offset, never invisible
- Helper text: text-sm below input, adequate spacing

**Buttons:**
- Primary: Solid fill, semibold text, h-12 minimum, rounded-lg
- Secondary: Outlined variant, same height
- Tap target: Minimum 44x44px, generous padding (px-6, py-3)
- Loading state: Spinner replaces text, maintains dimensions

**Textareas (Journal, Step Work):**
- Minimum height: min-h-32 (8rem)
- Resize: vertical only
- Auto-growing preferred for step work (no scrolling within textarea)

### Progress Visualization
**Progress Ring (Current Step):**
- Circular progress indicator
- Center: Step number large + "X/Y questions"
- Stroke: Thick (8-12px), rounded caps
- Animate on change: 300ms ease-out

**Step Selector:**
- Grid: grid-cols-3 md:grid-cols-4
- Each step: Card with number + title + completion percentage
- Completed: Checkmark badge overlay
- Current: Distinct border/shadow

### Emergency FAB (Floating Action Button)
**Position:** Fixed bottom-right, above bottom nav
- Size: w-16 h-16 (64px)—large, unmissable
- Icon: Phone or SOS symbol, white on high-contrast background
- Shadow: shadow-2xl for prominence
- Pulse animation: Subtle, continuous (respects reduced-motion)
- Z-index: Highest layer, always accessible

### Modal/Overlay Patterns
**Full-Screen Modals (Onboarding, Settings):**
- Slide up transition: 200ms ease-out
- Close button: Top-right, large tap target
- Scrollable content within safe-area

**Dialog Modals:**
- Centered, max-w-md
- Backdrop: Semi-transparent overlay
- Actions: Right-aligned, primary right-most

### Worksheets FormRenderer
**Dynamic Form Layout:**
- Label above input, never side-by-side on mobile
- Conditional fields: Slide down transition when revealed
- Section headers: Divider lines with label
- Save state: Auto-save with timestamp indicator

## Accessibility Specifications

**Focus Management:**
- Visible focus rings: 4px offset ring with high contrast
- Skip links: "Skip to main content" first interactive element
- Focus trap in modals
- Auto-focus first input on screen load (form contexts)

**Semantic HTML:**
- Main landmarks: header, nav, main, aside, footer
- ARIA labels on icon-only buttons
- Landmark regions clearly defined
- Heading hierarchy never skipped

**High Contrast Mode:**
- Toggle in Settings
- Increased border weights (2px → 3px)
- Stronger shadows
- No color-only differentiation (always pair with icon/text)

**Reduced Motion:**
- Respects `prefers-reduced-motion: reduce`
- Transitions disabled or reduced to 50ms
- Counter updates instant instead of animated
- Progress rings: Direct state change, no arc animation

## Animation & Motion

**Transition Timing:** 150-200ms default, ease-out curve
**Allowed Animations:**
- Page transitions: Slide or fade, 200ms
- Button press: Scale down (0.98) on active, 100ms
- Card hover: Lift (shadow increase), 150ms
- Modal entry: Slide up, 200ms
- Success feedback: Checkmark scale-in, 200ms

**Prohibited:**
- Continuous animations (except FAB pulse, subtle)
- Parallax scrolling
- Decorative motion without purpose
- Animations >300ms

## Images

**Hero Section:** Not applicable—this is a utility app without marketing needs
**Icons:** Use Heroicons (outline for nav, solid for filled states) via CDN
**Illustrations:** Minimal, supportive only
- Empty states: Simple line illustrations (optional)
- Onboarding: Single welcome graphic (abstract, calming)
- No stock photos of people

## Screen-Specific Layouts

**Home Dashboard:**
- Sobriety counter: Top, centered, maximum prominence
- Daily cards: Below counter, gap-4 vertical stack
- Quick actions: Grid of 2-3 buttons, icon + label
- Bottom nav: Fixed

**Step Work:**
- Step selector: Full-width list or grid
- Question view: Single question fills viewport, large textarea
- Navigation: Prev/Next buttons bottom, progress indicator top

**Journal:**
- Entry list: Chronological cards, newest first
- Entry card: Date large, mood indicator, preview text, tags
- Create button: Fixed FAB position (alternative to emergency FAB when not needed)

**Emergency Screen:**
- Large action buttons: 2-column grid, icon + label
- Each button minimum h-24, full visual weight
- Emergency contacts: List with tel: links, large tap targets

**Settings:**
- Grouped sections with headers
- Toggle switches: Right-aligned, large
- Export/Import: Prominent cards with descriptive help text
- Danger zone (data clearing): Bottom, visually separated

## Empty States & Onboarding

**Empty State Pattern:**
- Centered icon (96px)
- Heading: "No entries yet"
- Subtext: Encouraging prompt
- Primary action button: "Create your first..."

**Onboarding Wizard:**
- Progress indicator: Dots or step numbers, top
- Single-column form, one question per screen
- Primary button: "Continue" (right-aligned)
- Skip option: Text link, subtle (where appropriate)

## Content Density

**Generous Whitespace:** Never cramped, breathing room essential for therapeutic context
**Reading Width:** Text blocks max-w-prose (65ch)
**List Spacing:** Minimum gap-3 between list items
**Card Spacing:** gap-4 to gap-6 between cards

This design system prioritizes trust, calm, and accessibility—essential for users in recovery who may be experiencing stress or crisis.