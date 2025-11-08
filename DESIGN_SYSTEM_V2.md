# Recovery Companion 2.0 - Design System

## Strategic Decisions (Approved)

✅ **Privacy**: Hybrid (local-first + optional anonymous sharing)
✅ **Gamification**: Balanced (respectful + engaging)
✅ **Notifications**: Moderate (2-4 smart notifications daily)
✅ **Analytics**: Optional anonymous telemetry (opt-in)
✅ **Tone**: Warm & Supportive

---

## 🎨 New Components Specification

### 1. Streak Counter Component

**Purpose**: Visualize user consistency and build daily habits

**Variants**:
```typescript
interface StreakCardProps {
  title: string;
  icon: LucideIcon;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onTap?: () => void;
}
```

**Visual Design**:
```
┌─────────────────────────────────┐
│ 🔥 Journaling Streak            │
│                                 │
│      ┌─────────────┐            │
│      │     12      │  ← Large, bold
│      │    DAYS     │  ← Smaller caps
│      └─────────────┘            │
│                                 │
│   Longest: 45 days              │
│   Last entry: Today at 8:32 PM  │
└─────────────────────────────────┘
```

**Interaction**:
- Tap → Navigate to relevant feature (journal, steps, etc.)
- Shake animation when streak increases
- Pulse glow effect on current streak number
- Fire emoji grows larger with longer streaks (3d→🔥 7d→🔥🔥 30d→🔥🔥🔥)

**States**:
- Active streak (green glow)
- Broken streak (gray, shows "Start a new streak!")
- New record (gold crown icon, confetti animation)

---

### 2. Quick Action Modal System

**Purpose**: Reduce friction to <30 seconds for common actions

**Component Structure**:
```typescript
interface QuickActionModalProps {
  type: 'journal' | 'gratitude' | 'meeting' | 'step-question';
  onComplete: (data: any) => void;
  onDismiss: () => void;
}
```

**Visual Design**:
```
┌─────────────────────────────────┐
│  Quick Journal Entry        ✕   │
├─────────────────────────────────┤
│                                 │
│  How are you feeling? 🤔        │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Voice input here...]   │   │
│  │                         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  [🎤 Voice]  [⌨️ Type]          │
│                                 │
│  Mood: 😊 😐 😢 😰 😡           │
│                                 │
│  [Skip]         [Save ✓]       │
└─────────────────────────────────┘
```

**UX Principles**:
- Modal overlay (not navigation)
- Pre-filled defaults where possible
- Max 3 fields visible
- Large touch targets (44×44px minimum)
- Auto-focus on primary input
- Escape key / swipe down to dismiss
- Success animation on save
- Returns to home immediately

**Animations**:
- Slide up from bottom (mobile)
- Fade + scale from center (desktop)
- Success: Checkmark animation + haptic feedback
- Return: Slide down + fade out

---

### 3. Notification Permission Flow

**Purpose**: Maximize opt-in rate with contextual value proposition

**Flow Design**:

**Step 1 - Context Primer (Custom UI, not browser prompt)**:
```
┌─────────────────────────────────┐
│         Stay On Track 🔔        │
│                                 │
│  Get gentle daily reminders:    │
│                                 │
│  ✓ Morning intention (8:00 AM)  │
│  ✓ Evening reflection (8:00 PM) │
│  ✓ Celebrate your milestones    │
│  ✓ Gentle check-ins if needed   │
│                                 │
│  You can customize or disable   │
│  anytime in settings.           │
│                                 │
│  [Maybe Later]  [Turn On ✓]    │
└─────────────────────────────────┘
```

**Step 2 - Time Customization (If user taps "Turn On")**:
```
┌─────────────────────────────────┐
│    Customize Your Reminders     │
│                                 │
│  Morning Check-In               │
│  ┌─────────┐                    │
│  │  8:00   │ AM  ✓ Enabled     │
│  └─────────┘                    │
│                                 │
│  Evening Reflection             │
│  ┌─────────┐                    │
│  │  8:00   │ PM  ✓ Enabled     │
│  └─────────┘                    │
│                                 │
│  Quiet Hours                    │
│  10:00 PM - 7:00 AM             │
│                                 │
│  [Continue →]                   │
└─────────────────────────────────┘
```

**Step 3 - Browser Permission** (Only after user engagement):
```javascript
// NOW we ask for browser permission
const permission = await Notification.requestPermission();
```

**Step 4 - Success Confirmation**:
```
┌─────────────────────────────────┐
│     All Set! 🎉                 │
│                                 │
│  We'll send you a gentle        │
│  reminder tomorrow morning.     │
│                                 │
│  [Done ✓]                       │
└─────────────────────────────────┘
```

**Why This Works**:
- Explains value BEFORE asking permission
- Shows exact notification times (reduces uncertainty)
- Allows customization (user control)
- Only asks browser permission after user commitment
- Expected opt-in rate: 65-75% (vs. 20-30% without primer)

---

### 4. Milestone Celebration Component

**Purpose**: Create emotional connection and dopamine hits

**Trigger Events**:
- Sobriety milestones (1d, 7d, 30d, 60d, 90d, 6mo, 1yr, etc.)
- Streak milestones (3d, 7d, 14d, 30d, 90d)
- Achievement unlocks
- Step completion

**Visual Design**:
```
┌─────────────────────────────────┐
│                                 │
│          [Confetti Rain]        │
│                                 │
│            🎉  🎊               │
│                                 │
│       30 Days Clean!            │
│                                 │
│   One month of courage and      │
│   commitment. Your brain is     │
│   healing. Your life is         │
│   changing. Keep going! 💪      │
│                                 │
│   [Share Achievement]           │
│   [Journal About It]            │
│   [Continue ✓]                  │
│                                 │
└─────────────────────────────────┘
```

**Animation Sequence**:
1. Page dimmed with dark overlay (0.3s ease-out)
2. Modal scales in from 0.8→1.0 (0.4s spring)
3. Confetti cannons fire (particle system)
4. Achievement icon bounces in (0.3s delay)
5. Title fades in with slide up (0.2s delay)
6. Message fades in (0.1s delay)
7. Buttons fade in (0.1s delay)
8. Confetti continues for 3s total

**Personalized Messages by Milestone**:
```typescript
const milestoneMessages = {
  1: "One day at a time. You did it today! Tomorrow, you'll do it again. 💪",
  7: "A full week! Your body is healing. Every cell is recovering. 🌱",
  30: "One month of freedom! You're rewriting your story, one day at a time. 📖",
  60: "Two months clean! The fog is lifting. You're becoming who you were meant to be. ✨",
  90: "90 days! This is when real change happens. Your brain is rewiring. Keep going! 🧠",
  180: "Six months of recovery! Half a year of courage, growth, and change. Incredible! 🚀",
  365: "ONE YEAR! You did it. 365 days of choosing recovery. You are living proof that change is possible. 🏆"
};
```

**Sound Design** (Optional, with permission):
- Gentle chime sound on modal open
- Success sound on confetti fire
- Soft background music (optional, 10s loop)

---

### 5. Improved Onboarding Flow

**Purpose**: Deliver immediate value in <60 seconds

**New Flow (6 Steps)**:

**Step 1 - Welcome & Value Proposition**:
```
┌─────────────────────────────────┐
│                                 │
│      Recovery Companion 🌱      │
│                                 │
│   Your private, offline-first   │
│   companion for recovery.       │
│                                 │
│   ✓ Your data never leaves      │
│     your device                 │
│   ✓ No sign-up required         │
│   ✓ Works completely offline    │
│   ✓ Free & open source          │
│                                 │
│   [Get Started →]               │
│                                 │
└─────────────────────────────────┘
```

**Step 2 - Quick Profile** (Immediate Value):
```
┌─────────────────────────────────┐
│         Welcome! 👋              │
│                                 │
│  What should we call you?       │
│  ┌─────────────────────────┐   │
│  │ First name or nickname  │   │
│  └─────────────────────────┘   │
│                                 │
│  When did you start your        │
│  recovery journey?              │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📅 January 15, 2025     │   │
│  └─────────────────────────┘   │
│                                 │
│  [Continue →]                   │
│                                 │
│  Progress: ●●○○○○ (2/6)         │
└─────────────────────────────────┘
```

**Step 3 - IMMEDIATE VALUE - Show Sobriety Counter**:
```
┌─────────────────────────────────┐
│                                 │
│         That's...               │
│                                 │
│      ┌───────────────┐          │
│      │   14  DAYS    │          │
│      │   11  HOURS   │          │
│      │   23  MINUTES │          │
│      └───────────────┘          │
│                                 │
│   ...of courage and strength!   │
│                                 │
│   Every moment counts. 💪       │
│                                 │
│   [Continue →]                  │
│                                 │
│  Progress: ●●●○○○ (3/6)         │
└─────────────────────────────────┘
```

**Step 4 - First Quick Win - Gratitude**:
```
┌─────────────────────────────────┐
│    Quick Win 🎯                 │
│                                 │
│  Name one thing you're          │
│  grateful for right now:        │
│                                 │
│  ┌─────────────────────────┐   │
│  │ My sobriety             │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  (This builds positive habits   │
│   and trains your brain to see  │
│   the good in recovery)         │
│                                 │
│  [Skip]        [Continue →]    │
│                                 │
│  Progress: ●●●●○○ (4/6)         │
└─────────────────────────────────┘
```

**Step 5 - Emergency Setup**:
```
┌─────────────────────────────────┐
│    Safety First 🛟              │
│                                 │
│  Add your sponsor or an         │
│  emergency contact:             │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Name                    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Phone number            │   │
│  └─────────────────────────┘   │
│                                 │
│  Quick access in crisis mode    │
│                                 │
│  [Skip]        [Continue →]    │
│                                 │
│  Progress: ●●●●●○ (5/6)         │
└─────────────────────────────────┘
```

**Step 6 - Notification Setup** (Using primer from #3):
```
[Use Notification Permission Flow from above]

Progress: ●●●●●● (6/6)
```

**Step 7 - Success & Next Steps**:
```
┌─────────────────────────────────┐
│        You're All Set! 🎉       │
│                                 │
│  Here are some ways to start:   │
│                                 │
│  📖 Answer your first           │
│     Step 1 question             │
│                                 │
│  ✍️  Write a journal entry      │
│                                 │
│  🙏 Add more gratitude items    │
│                                 │
│  📍 Log a meeting               │
│                                 │
│  Or just explore! Everything    │
│  is saved automatically.        │
│                                 │
│  [Go to Home →]                 │
└─────────────────────────────────┘
```

**Why This Works**:
- Shows value in <60 seconds (sobriety counter)
- Creates investment (gratitude entry)
- Builds safety (emergency contact)
- Explains notifications with value
- Total time: 2-3 minutes
- Expected Day 1 retention: 70%+ (vs. current ~40%)

---

### 6. Daily Challenge System

**Purpose**: Give users a "reason to open the app today"

**Component Design**:
```
┌─────────────────────────────────┐
│  Today's Challenge 🎯           │
├─────────────────────────────────┤
│                                 │
│  Connection Monday              │
│                                 │
│  Call or text your sponsor or   │
│  one fellowship friend today.   │
│                                 │
│  Why? Connection is the         │
│  opposite of addiction.         │
│                                 │
│  [Mark as Done ✓]               │
│                                 │
│  Streak: 3 challenges this week │
└─────────────────────────────────┘
```

**Challenge Schedule** (Themed Days):
```typescript
const dailyChallenges = {
  Monday: {
    theme: "Connection",
    challenges: [
      "Call or text your sponsor",
      "Reach out to a fellowship friend",
      "Attend a meeting today",
      "Share something in a meeting"
    ]
  },
  Tuesday: {
    theme: "Step Work",
    challenges: [
      "Answer 3 step questions",
      "Review your Step 4 inventory",
      "Read from the basic text",
      "Reflect on your recovery journey"
    ]
  },
  Wednesday: {
    theme: "Gratitude",
    challenges: [
      "List 5 things you're grateful for",
      "Thank someone who helped you",
      "Write about what recovery has given you",
      "Share your gratitude in a meeting"
    ]
  },
  Thursday: {
    theme: "Self-Care",
    challenges: [
      "Meditate for 5 minutes",
      "Take a walk in nature",
      "Do something creative",
      "Practice deep breathing"
    ]
  },
  Friday: {
    theme: "Reflection",
    challenges: [
      "Journal about your week",
      "Do a daily tenth step",
      "Review your progress",
      "Set intentions for the weekend"
    ]
  },
  Saturday: {
    theme: "Fellowship",
    challenges: [
      "Attend a weekend meeting",
      "Help another person in recovery",
      "Volunteer for service",
      "Visit your home group"
    ]
  },
  Sunday: {
    theme: "Rest & Renewal",
    challenges: [
      "Practice meditation",
      "Read recovery literature",
      "Plan your week ahead",
      "Express gratitude for your recovery"
    ]
  }
};
```

**Personalization**:
- Rotates through challenges within theme
- Adapts to user's primary program (AA/NA/CA/SMART)
- Considers user's clean time (easier challenges for early recovery)
- Skips challenges user has already done today

**Completion Flow**:
```
User taps "Mark as Done" →
Modal: "Great work! 🎉 Want to share what you did?"
[Text box for optional notes]
[Skip] [Save & Continue]
→ Achievement animation
→ Challenge streak +1
→ Returns to home
```

---

### 7. Achievement System

**Purpose**: Visualize progress, motivate continued engagement

**Achievement Categories**:

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'sobriety' | 'step-work' | 'community' | 'self-care' | 'crisis';
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  unlockedAt?: string;
  progress?: number; // 0-100 for incremental achievements
  requirement: {
    type: string;
    count: number;
    current: number;
  };
}
```

**Achievement Categories & Examples**:

**Sobriety Milestones** (Epic/Rare):
- 🌅 "First Light" - 24 hours clean
- 🌱 "New Beginnings" - 7 days clean
- 🌿 "Growing Strong" - 30 days clean
- 🌳 "Deep Roots" - 90 days clean
- 🏆 "One Year Miracle" - 365 days clean

**Step Work** (Uncommon/Rare):
- 📖 "First Step" - Completed all Step 1 questions
- 🔍 "Truth Seeker" - Answered 50 step questions
- 📝 "Inventory Taker" - Completed Step 4
- 🎯 "Step Master" - Completed all 12 steps
- 🔄 "Working the Steps" - Started working steps again

**Community** (Common/Uncommon):
- 🤝 "Fellowship" - Logged first meeting
- 📅 "Regular" - Attended 3 meetings in one week
- 🏅 "Committed" - 90 meetings in 90 days
- 🎤 "Sharing" - Logged a meeting where you shared
- 👥 "Home Group" - Attended same meeting 4 times

**Self-Care** (Common):
- 🙏 "Grateful Heart" - Listed gratitude 7 days in a row
- ✍️ "Daily Writer" - Journaled 7 days in a row
- 🧘 "Mindful" - Used meditation timer 10 times
- 🌅 "Morning Person" - Set intentions 10 days in a row
- 📖 "Reflective" - Completed evening reflection 10 times

**Crisis Management** (Rare):
- 🛟 "Prepared" - Set up emergency contacts
- 🌬️ "Breathe" - Used breathing exercise 5 times
- 💪 "Resilient" - Activated crisis mode but stayed strong
- 🆘 "Reaching Out" - Used emergency contact feature

**Hidden Achievements** (Surprise & Delight):
- 🌟 "Midnight Oil" - Journaled between midnight-3am
- 🔥 "Unstoppable" - 30-day streak in any category
- 🎨 "Creative Recovery" - Used voice journaling 10 times
- 🎯 "Perfect Week" - Completed all 7 daily challenges in one week
- 📈 "Progress Tracker" - Viewed analytics 5 times

**Achievement Unlock Animation**:
```
1. Banner slides in from top
2. Achievement icon bounces
3. Particle effects around icon
4. Title fades in
5. Progress bar fills
6. Haptic feedback (buzz)
7. Sound effect (optional)
8. Banner auto-dismisses after 4s or tap to dismiss
```

**Achievement Display Component**:
```
┌─────────────────────────────────┐
│      Achievements 🏆            │
├─────────────────────────────────┤
│                                 │
│  Sobriety (3/10)                │
│  ┌────┬────┬────┬────┬────┐    │
│  │ 🌅 │ 🌱 │ 🌿 │ 🔒 │ 🔒 │   │
│  └────┴────┴────┴────┴────┘    │
│                                 │
│  Step Work (2/8)                │
│  ┌────┬────┬────┬────┬────┐    │
│  │ 📖 │ 🔍 │ 🔒 │ 🔒 │ 🔒 │   │
│  └────┴────┴────┴────┴────┘    │
│                                 │
│  Community (4/6)                │
│  ┌────┬────┬────┬────┬────┐    │
│  │ 🤝 │ 📅 │ 🏅 │ 🎤 │ 🔒 │   │
│  └────┴────┴────┴────┴────┘    │
│                                 │
│  [View All →]                   │
└─────────────────────────────────┘
```

**Individual Achievement Detail**:
```
┌─────────────────────────────────┐
│              🌿                  │
│                                 │
│       Growing Strong            │
│                                 │
│      30 days clean              │
│                                 │
│   One month of courage and      │
│   commitment. Your brain is     │
│   healing. Your life is         │
│   changing.                     │
│                                 │
│   Unlocked: Jan 15, 2025        │
│                                 │
│   Rarity: RARE (15% of users)   │
│                                 │
│   [Share Achievement]           │
│   [Close]                       │
└─────────────────────────────────┘
```

---

### 8. Voice-to-Text Journaling

**Purpose**: Remove typing barrier, enable journaling while driving/walking

**Component Integration**:
```typescript
interface VoiceJournalProps {
  onTranscript: (text: string) => void;
  onComplete: () => void;
  existingText?: string;
}
```

**Visual Design**:
```
┌─────────────────────────────────┐
│  Voice Journal Entry 🎤         │
├─────────────────────────────────┤
│                                 │
│     ┌─────────────┐             │
│     │             │             │
│     │   [  🎤 ]   │ ← Pulsing   │
│     │             │    red dot  │
│     └─────────────┘             │
│                                 │
│     "Tap to start speaking"     │
│                                 │
│  Or tap here to type instead ↓  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Today I'm feeling...    │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Cancel]           [Done ✓]   │
└─────────────────────────────────┘
```

**During Recording**:
```
┌─────────────────────────────────┐
│  Voice Journal Entry 🎤         │
├─────────────────────────────────┤
│                                 │
│     ┌─────────────┐             │
│     │   🔴  00:23  │ ← Recording │
│     │             │    timer    │
│     │  [  STOP ]  │             │
│     └─────────────┘             │
│                                 │
│  Live Transcript:               │
│  ┌─────────────────────────┐   │
│  │ Today I'm feeling good  │   │
│  │ about my recovery. I    │   │
│  │ went to a meeting and...│   │
│  └─────────────────────────┘   │
│                                 │
│  [Delete]        [Pause]        │
└─────────────────────────────────┘
```

**After Recording**:
```
┌─────────────────────────────────┐
│  Voice Journal Entry 🎤         │
├─────────────────────────────────┤
│                                 │
│  Your entry (0:47):             │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Today I'm feeling good  │   │
│  │ about my recovery. I    │   │
│  │ went to a meeting and   │   │
│  │ connected with my       │   │
│  │ sponsor. We talked...   │   │
│  └─────────────────────────┘   │
│                                 │
│  [Edit Text]  [Re-record]       │
│                                 │
│  [Cancel]           [Save ✓]   │
└─────────────────────────────────┘
```

**Technical Implementation**:
```typescript
// Use Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript;
    }
  }

  updateTranscript(finalTranscript + interimTranscript);
};
```

**Features**:
- Real-time transcription
- Auto-punctuation
- Edit after recording
- Mix voice + typing
- Save audio (optional, local storage)
- Fallback to typing if Speech API unavailable

**Accessibility**:
- Large tap target for record button
- Visual feedback (pulsing animation)
- Timer visible during recording
- Clear stop/pause controls
- Keyboard navigation support

---

## 🎨 Animation Guidelines

### Timing Functions

```css
/* Standard easing */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-quad: cubic-bezier(0.55, 0.085, 0.68, 0.53);
--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);

/* Spring animations (for celebrations) */
--spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Smooth (for streaks, counters) */
--smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
```

### Duration Standards

```css
/* Micro-interactions */
--duration-instant: 100ms;   /* Hover, tap feedback */
--duration-quick: 200ms;      /* Toggles, checkboxes */
--duration-normal: 300ms;     /* Modals, drawers */
--duration-slow: 500ms;       /* Page transitions */
--duration-celebration: 800ms; /* Achievement unlocks */
```

### Motion Principles

1. **Respect User Preferences**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Use opacity fades only, no movement
  // Reduce duration by 70%
  // Disable particle effects
}
```

2. **Purposeful Motion**:
- Animations should communicate meaning
- Avoid animation for decoration only
- Use consistent directions (modals slide up, notifications slide down)

3. **Performance**:
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Remove animations from DOM after completion

---

## 🎨 Color System Extensions

### Streak Colors
```css
--streak-active: hsl(142, 76%, 36%);      /* Green - active streak */
--streak-inactive: hsl(220, 9%, 46%);     /* Gray - broken streak */
--streak-record: hsl(45, 93%, 47%);       /* Gold - new record */
--streak-fire: hsl(14, 100%, 57%);        /* Orange - fire emoji accent */
```

### Achievement Rarity Colors
```css
--achievement-common: hsl(220, 9%, 46%);    /* Gray */
--achievement-uncommon: hsl(142, 76%, 36%); /* Green */
--achievement-rare: hsl(221, 83%, 53%);     /* Blue */
--achievement-epic: hsl(271, 76%, 53%);     /* Purple */
--achievement-legendary: hsl(45, 93%, 47%); /* Gold */
```

### Notification Priority Colors
```css
--notification-info: hsl(199, 89%, 48%);      /* Blue */
--notification-success: hsl(142, 76%, 36%);   /* Green */
--notification-warning: hsl(45, 93%, 47%);    /* Yellow */
--notification-critical: hsl(0, 84%, 60%);    /* Red */
```

---

## 📱 Responsive Patterns

### Breakpoints
```css
--mobile: 640px;    /* 0-640px */
--tablet: 768px;    /* 641-768px */
--desktop: 1024px;  /* 769-1024px */
--wide: 1280px;     /* 1025px+ */
```

### Component Adaptations

**Streak Cards**:
- Mobile: Full width, stacked vertically
- Tablet: 2 columns
- Desktop: 3-4 columns

**Quick Action Modals**:
- Mobile: Full screen bottom sheet
- Tablet: Centered modal (600px max width)
- Desktop: Centered modal (600px max width)

**Celebration Modals**:
- Mobile: Full screen with scroll if needed
- Tablet/Desktop: Centered, max 500px width

---

## ♿ Accessibility Requirements

### Focus Management
```typescript
// Trap focus in modals
function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}
```

### Screen Reader Support
```typescript
// Announce achievements to screen readers
function announceAchievement(title: string, description: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Achievement unlocked: ${title}. ${description}`;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 5000);
}
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Modals close with Escape key
- Quick actions trigger with Enter/Space
- Clear visible focus indicators
- Skip links for main content

---

## 🔔 Notification Design

### Notification Types

**Morning Check-In**:
```
Title: "Good morning! ☀️"
Body: "Set your intention for today"
Actions: [Open App] [Dismiss]
Icon: App icon
Badge: Number of unread items
```

**Evening Reflection**:
```
Title: "How was your day? 🌙"
Body: "Take a moment to reflect"
Actions: [Quick Journal] [Dismiss]
Icon: App icon
```

**Milestone Alert**:
```
Title: "🎉 30 Days Clean!"
Body: "One month of courage! Tap to celebrate."
Actions: [Celebrate!] [Later]
Icon: Trophy emoji
Vibration: [200, 100, 200]
```

**Streak Alert** (If user hasn't checked in by 9 PM):
```
Title: "Don't break your streak! 🔥"
Body: "Quick check-in to keep your 7-day journaling streak"
Actions: [Quick Entry] [Skip Today]
Icon: Fire emoji
```

**Gentle Check-In** (If no activity for 3 days):
```
Title: "We miss you 💙"
Body: "Everything okay? We're here if you need support."
Actions: [I'm Good] [Need Help]
Icon: Heart emoji
```

### Notification Behavior

**Timing**:
- Morning: User's configured time (default 8:00 AM)
- Evening: User's configured time (default 8:00 PM)
- Milestones: Immediately when unlocked
- Streak reminders: 2 hours before midnight
- Check-ins: After 3 days of inactivity

**Quiet Hours**:
- Default: 10:00 PM - 7:00 AM
- Configurable in settings
- Only critical notifications (crisis-related) can bypass

**Notification Stacking**:
- Max 2 notifications per day (unless milestone/achievement)
- Group multiple achievements into one notification
- Never send more than 4 total per day

---

## 📊 Home Page Redesign

### New Home Layout

```
┌─────────────────────────────────────────┐
│  Recovery Companion          ⚙️ 🔔      │
├─────────────────────────────────────────┤
│                                         │
│  👋 Good morning, Alex!                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🌅 Clean Time                    │ │
│  │                                   │ │
│  │     30 Days, 12 Hours, 43 Min    │ │
│  │                                   │ │
│  │  Next milestone: 60 days (30d)   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⚡ Quick Actions                       │
│  ┌────┬────┬────┬────┐                │
│  │ ✍️  │ 📖 │ 📍 │ 🙏 │               │
│  │Jrnl│Step│Meet│Thx │               │
│  └────┴────┴────┴────┘                │
│                                         │
│  🔥 Your Streaks                        │
│  ┌───────────────────────────────────┐ │
│  │ ✍️  Journaling      12 days  🔥🔥 │ │
│  │ 📝 Daily Cards       8 days  🔥   │ │
│  │ 📖 Step Work         3 days  🔥   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  🎯 Today's Challenge                   │
│  ┌───────────────────────────────────┐ │
│  │  Connection Monday                │ │
│  │                                   │ │
│  │  Call or text your sponsor or    │ │
│  │  one fellowship friend today.    │ │
│  │                                   │ │
│  │  [Mark as Done ✓]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💬 Daily Quote                         │
│  ┌───────────────────────────────────┐ │
│  │  "Just for today, I will have a  │ │
│  │  program. I may not follow it    │ │
│  │  exactly, but I will have it."   │ │
│  │                                   │ │
│  │  — Just For Today                │ │
│  │  ❤️ Add to Favorites              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  📊 Quick Stats                         │
│  ┌─────────┬─────────┬──────────┐     │
│  │ 🤝  15  │ ✍️  24  │ 📖  67%  │     │
│  │Meetings │Entries  │ Step 1   │     │
│  └─────────┴─────────┴──────────┘     │
│                                         │
│  [View All Features →]                 │
│                                         │
└─────────────────────────────────────────┘
```

**Component Hierarchy**:
1. **Greeting** (Personalized with time of day)
2. **Sobriety Counter** (Most prominent, always visible)
3. **Quick Actions** (One-tap access to key features)
4. **Streaks** (Habit reinforcement)
5. **Daily Challenge** (Engagement hook)
6. **Daily Quote** (Inspiration)
7. **Quick Stats** (Progress visibility)

**Interaction States**:
- Tap sobriety counter → See detailed milestones
- Tap quick action → Open modal (not navigate)
- Tap streak → See streak history
- Complete challenge → Animation + achievement unlock
- Favorite quote → Adds to saved quotes
- Tap stat → Navigate to relevant feature

---

## 🎨 Design Tokens Update

```typescript
// Add to existing design system

export const tokens = {
  // Existing tokens...

  // New tokens for v2 features
  streaks: {
    colors: {
      active: 'hsl(142, 76%, 36%)',
      inactive: 'hsl(220, 9%, 46%)',
      record: 'hsl(45, 93%, 47%)',
      fire: 'hsl(14, 100%, 57%)',
    },
    animations: {
      pulse: 'pulse 2s ease-in-out infinite',
      grow: 'grow 0.3s ease-out',
      shake: 'shake 0.5s ease-in-out',
    }
  },

  achievements: {
    rarity: {
      common: { color: 'hsl(220, 9%, 46%)', glow: '0 0 10px rgba(0,0,0,0.1)' },
      uncommon: { color: 'hsl(142, 76%, 36%)', glow: '0 0 15px rgba(34, 197, 94, 0.3)' },
      rare: { color: 'hsl(221, 83%, 53%)', glow: '0 0 20px rgba(59, 130, 246, 0.4)' },
      epic: { color: 'hsl(271, 76%, 53%)', glow: '0 0 25px rgba(168, 85, 247, 0.5)' },
    }
  },

  celebrations: {
    confetti: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      particleCount: 100,
      spread: 70,
      duration: 3000,
    }
  },

  quickActions: {
    size: '80px',
    gap: '12px',
    iconSize: '32px',
    labelSize: '12px',
  }
};
```

---

## Next: Technical Architecture

This design system provides the blueprint. Next I'll create the technical architecture document detailing:
- Database schema updates for streaks, achievements, challenges
- State management patterns
- Notification scheduling system
- Analytics event taxonomy
- Service worker updates

Ready to proceed to Technical Architecture phase?
