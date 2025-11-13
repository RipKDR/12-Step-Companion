# Meeting Finder Integration Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
Meeting Finder Integration makes it easier to find and attend NA/AA meetings. Research shows meeting attendance correlates with recovery success. This feature integrates real-world recovery activities (meetings) into the app, creating real value and keeping users engaged.

### Current State
- ✅ Meeting tracker exists (`client/src/routes/Meetings.tsx`)
- ✅ Can log meeting attendance
- ✅ Meeting statistics tracked
- ❌ No meeting finder (BMLT/AA integration)
- ❌ No meeting reminders
- ❌ No meeting details (location, time, format)

### Hard Constraints
- **Copyright**: Never quote copyrighted NA/AA literature
- **API Access**: BMLT Semantic API requires API key (user provides)
- **Deep Links**: AA uses Meeting Guide app deep links
- **Offline-First**: Cache meeting data for offline use
- **Privacy**: Location data is opt-in only

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why not just use Meeting Guide? Answer: Integrated with app data, reminders, logging, recovery context
- **Ship Small**: Start with BMLT integration, add AA later

### Risks & Mitigations
1. **Risk**: API keys required → **Mitigation**: User provides key, clear instructions, optional feature
2. **Risk**: Location privacy → **Mitigation**: Opt-in only, clear why needed, can revoke
3. **Risk**: API rate limits → **Mitigation**: Cache results, limit requests, offline fallback
4. **Risk**: Meeting data outdated → **Mitigation**: Cache with expiration, manual refresh

---

## M — Mission (What to Build)

### Core Features

#### 1. NA Meeting Finder (BMLT)
- **Geosearch**: Find meetings near user's location
- **Filters**: Day of week, time, format (in-person/online/hybrid), type (open/closed)
- **List View**: Show meetings with distance, time, format
- **Map View**: Show meetings on map (optional)
- **Details**: Meeting name, location, time, format, notes
- **Starts Soon Filter**: "Starts ≤60 minutes" filter

#### 2. AA Meeting Finder
- **Deep Link**: Link to Meeting Guide app (if installed)
- **Web Fallback**: Link to intergroup websites
- **Meeting Details**: Show meeting info if available
- **Region Support**: Support different regions/countries

#### 3. Meeting Integration
- **Quick Log**: Log attendance directly from finder
- **Favorites**: Save favorite meetings
- **Reminders**: Set reminders for regular meetings
- **Calendar Export**: Export to calendar (.ics file)

#### 4. Meeting Reminders
- **Smart Reminders**: "Your usual meeting starts in 30 minutes"
- **Geofenced Reminders**: "You're near [Meeting Name], starts in 15 minutes"
- **Customizable**: User controls reminder times

### Success Metrics
- **Finder Usage**: 50%+ of users use finder weekly
- **Meeting Attendance**: 3+ meetings logged per week (target)
- **Reminder Effectiveness**: 40%+ of reminders lead to attendance
- **Retention Impact**: 1.5x higher retention for users who use finder

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why not just use Meeting Guide? → Answer: Integrated with app data, reminders, logging, recovery context
- What about API keys? → Answer: User provides, clear instructions, optional feature
- What about location privacy? → Answer: Opt-in only, clear why needed, can revoke

**Top Risks:**
1. API keys required → Mitigation: User provides, clear instructions, optional
2. Location privacy → Mitigation: Opt-in only, clear why, can revoke
3. API rate limits → Mitigation: Cache, limit requests, offline fallback
4. Meeting data outdated → Mitigation: Cache with expiration, manual refresh

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface Meeting {
  id: string;
  name: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM format (24-hour)
  format: "in-person" | "online" | "hybrid";
  type: "open" | "closed" | "speaker" | "discussion" | "step-study" | "other";
  location?: {
    name: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  onlineDetails?: {
    platform: "zoom" | "webex" | "teams" | "other";
    link?: string;
    phone?: string;
    accessCode?: string;
  };
  notes?: string;
  program: "NA" | "AA";
  source: "bmlt" | "meeting-guide" | "manual";
  sourceId?: string; // ID from source system
  distanceKm?: number; // Distance from user
  isFavorite: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number; // e.g., 30 minutes before
  createdAtISO: string;
  updatedAtISO: string;
}

export interface MeetingSearchFilters {
  program?: "NA" | "AA" | "both";
  dayOfWeek?: number[];
  timeRange?: { start: string; end: string }; // HH:MM format
  format?: ("in-person" | "online" | "hybrid")[];
  type?: string[];
  maxDistanceKm?: number;
  startsSoon?: boolean; // Starts ≤60 minutes
  favoritesOnly?: boolean;
}

export interface MeetingCache {
  meetings: Meeting[];
  cachedAtISO: string;
  expiresAtISO: string;
  location: { lat: number; lng: number };
  radiusKm: number;
}

// Enhance existing Meeting type in AppState
export interface AppState {
  // ... existing fields
  meetings: Meeting[]; // Enhance existing
  meetingCache?: MeetingCache;
  meetingSearchFilters: MeetingSearchFilters;
  bmltApiKey?: string; // User-provided API key
}
```

### A2. BMLT Integration

**File**: `client/src/lib/bmlt-api.ts` (NEW)

**Features:**
- BMLT Semantic API integration
- Geosearch for meetings
- Cache results locally
- Handle API errors gracefully

**Implementation:**
```typescript
export interface BMLTConfig {
  apiRoot: string; // User-provided BMLT root URL
  apiKey?: string; // Optional API key if required
}

export async function searchBMLTMeetings(
  config: BMLTConfig,
  location: { lat: number; lng: number },
  radiusKm: number,
  filters?: MeetingSearchFilters
): Promise<Meeting[]> {
  // Call BMLT Semantic API
  // Transform to Meeting format
  // Return meetings
}

export function cacheBMLTMeetings(
  meetings: Meeting[],
  location: { lat: number; lng: number },
  radiusKm: number
): void {
  // Cache meetings locally
  // Set expiration (e.g., 24 hours)
}
```

### A3. AA Integration

**File**: `client/src/lib/aa-meetings.ts` (NEW)

**Features:**
- Deep link to Meeting Guide app
- Web fallback to intergroup websites
- Region detection
- Meeting Guide app detection

**Implementation:**
```typescript
export function openMeetingGuide(meetingId?: string): void {
  // Try to open Meeting Guide app
  // Fallback to web if app not installed
}

export function getAAIntergroupUrl(region: string): string {
  // Return intergroup website URL for region
  // Default regions: US, CA, UK, AU, etc.
}
```

### A4. UI Components

#### A4.1 Meeting Finder Component

**File**: `client/src/components/meeting-finder/MeetingFinder.tsx`

**Features:**
- Search meetings by location
- Apply filters (day, time, format, type)
- List view with distance, time, format
- Map view (optional)
- "Starts soon" filter
- Refresh button

**UI Design:**
- Search bar at top
- Filter chips below
- List of meetings (cards)
- Each card: Name, Distance, Time, Format, Quick actions
- Map toggle (list/map view)
- Pull to refresh

#### A4.2 Meeting Details Component

**File**: `client/src/components/meeting-finder/MeetingDetails.tsx`

**Features:**
- Show full meeting details
- Location (with map link)
- Online details (link, phone, access code)
- Notes
- Quick actions: Log attendance, Add to favorites, Set reminder, Export to calendar

**UI Design:**
- Modal or full-screen
- Meeting name at top
- Details below (time, location, format)
- Online details (if online/hybrid)
- Action buttons at bottom
- Can close/dismiss

#### A4.3 Meeting Reminders Component

**File**: `client/src/components/meeting-finder/MeetingReminders.tsx`

**Features:**
- List of meetings with reminders
- Enable/disable reminders
- Set reminder time (15, 30, 60 minutes before)
- Show upcoming reminders
- Notification when reminder fires

**UI Design:**
- List of favorite meetings
- Toggle for each meeting
- Reminder time selector
- Upcoming reminders section
- Can edit/delete reminders

### A5. Integration Points

#### A5.1 Meetings Screen Integration

**File**: `client/src/routes/Meetings.tsx`

**Changes:**
- Add "Find Meetings" button/tab
- Show finder interface
- Quick log from finder
- Show favorites
- Show reminders

#### A5.2 Home Screen Integration

**File**: `client/src/routes/Home.tsx`

**Changes:**
- Show "Meetings starting soon" card
- Show next meeting reminder
- Quick access to finder

#### A5.3 Recovery Scenes Integration

**File**: `client/src/components/recovery-scenes/SceneAction.tsx`

**Changes:**
- Add "Find Meeting" as action type
- Can trigger meeting finder from scene
- Pre-filter by location/time

#### A5.4 JITAI Integration

**File**: `client/src/lib/jitai-engine.ts`

**Changes:**
- When high risk detected, suggest meetings
- "Want to find a meeting near you?"
- Show meetings starting soon

### A6. Calendar Export

**File**: `client/src/lib/calendar-export.ts` (NEW)

**Features:**
- Export meeting to calendar (.ics file)
- Include meeting details
- Recurring events (weekly)
- Can export single or multiple meetings

**Implementation:**
```typescript
export function exportMeetingToCalendar(meeting: Meeting): string {
  // Generate .ics file content
  // Include meeting details
  // Return ICS string (can download)
}

export function exportMeetingsToCalendar(meetings: Meeting[]): string {
  // Export multiple meetings
  // Return ICS string
}
```

### A7. Notification Integration

**File**: `client/src/service-worker.ts`

**Enhance:**
- Check for meeting reminders
- Send notification: "Your meeting '[Name]' starts in [X] minutes"
- Include meeting details
- Action buttons: "Open", "Directions", "Dismiss"

**Settings:**
- Add to `NotificationSettings`:
  ```typescript
  meetingReminders: {
    enabled: boolean;
    minutesBefore: number[]; // [15, 30, 60]
    respectQuietHours: boolean;
  };
  ```

### A8. Testing

**Unit Tests:**
- `client/src/lib/__tests__/bmlt-api.test.ts`
  - Test API integration
  - Test caching
  - Test error handling

**Integration Tests:**
- `client/src/components/__tests__/MeetingFinder.test.tsx`
  - Test search
  - Test filters
  - Test meeting details

**E2E Tests:**
- Search meetings → View details → Log attendance → Set reminder
- Reminder fires → Notification → User attends → Logs attendance

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ Enhanced `Meeting` type with BMLT/AA fields
2. ✅ BMLT API integration (`bmlt-api.ts`)
3. ✅ AA integration (`aa-meetings.ts`)
4. ✅ `MeetingFinder` component
5. ✅ `MeetingDetails` component
6. ✅ `MeetingReminders` component
7. ✅ Calendar export (`calendar-export.ts`)
8. ✅ Integration with Meetings screen, Home, Scenes, JITAI
9. ✅ Notification system for reminders

### UX Deliverables
1. ✅ Meeting finder is easy to use (<3 taps to find meeting)
2. ✅ Meeting details are clear
3. ✅ Reminders are helpful
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive

### Data Deliverables
1. ✅ Meetings cached locally
2. ✅ Favorites stored
3. ✅ Reminders stored
4. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Meeting Finder works
2. ✅ User guide: How to set up BMLT API key
3. ✅ Developer notes: BMLT API integration, AA deep links

---

## Success Criteria

### Must Have (MVP)
- [ ] BMLT meeting search works (with API key)
- [ ] Meetings displayed with distance, time, format
- [ ] Meeting details shown
- [ ] Can log attendance from finder
- [ ] Can add favorites
- [ ] Meetings cached locally

### Should Have (Enhanced)
- [ ] AA integration (deep links)
- [ ] Meeting reminders
- [ ] Calendar export
- [ ] Map view
- [ ] "Starts soon" filter

### Nice to Have (Future)
- [ ] Offline meeting database (periodic updates)
- [ ] Meeting check-in (attendance tracking)
- [ ] Meeting notes (user notes per meeting)
- [ ] Share meeting with sponsor

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: BMLT API integration
- Day 3-4: Meeting finder component
- Day 5: Meeting details component

### Week 2: Integration
- Day 1-2: Integration with Meetings screen
- Day 3: Favorites and reminders
- Day 4: Calendar export
- Day 5: Testing + polish

### Week 3: Enhancement
- Day 1-2: AA integration
- Day 3: Map view
- Day 4: Notification reminders
- Day 5: Integration with other features

### Week 4: Polish (Optional)
- Day 1-3: Advanced features
- Day 4-5: Optimization

---

## Notes & Considerations

### Privacy
- Location data is opt-in only
- Can revoke location permission anytime
- Meeting data cached locally
- No sharing without explicit action

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Large touch targets (44px+)

### Performance
- Meeting search should be <2 seconds
- Cache should reduce API calls
- Offline fallback if API fails

### Edge Cases
- What if API key invalid? → Clear error, instructions to fix
- What if no meetings found? → Show message, suggest expand search
- What if location denied? → Manual location entry, or use last known
- What if API rate limited? → Use cache, show message, retry later

---

**Status**: Ready for Implementation
**Priority**: P2 (Nice-to-Have, Not Retention-Critical)
**Estimated Effort**: 3-4 weeks (MVP: 2 weeks)
**Dependencies**: BMLT API key (user-provided), Location permission (opt-in)

