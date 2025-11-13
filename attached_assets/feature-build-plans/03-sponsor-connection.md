# Sponsor Connection Feature - BMAD Build Plan

## B — Background (Context, Constraints, Guardrails)

### Context
Sponsor Connection enables real-time, privacy-first sharing between sponsees and sponsors. Research shows users with connections have 37 days longer sobriety and 2-3x higher retention. This feature creates network effects and builds trust through transparency.

### Current State
- ✅ `FellowshipContact` type exists (can store sponsor info)
- ✅ Encryption utilities exist (`client/src/lib/crypto.ts`)
- ✅ Data export/import exists
- ❌ No real-time sharing
- ❌ No sponsor dashboard
- ❌ No per-item sharing controls
- ❌ No encrypted messaging

### Hard Constraints
- **Privacy-First**: Per-item sharing granularity (not all-or-nothing)
- **No Service Role Keys**: Never expose service role keys to client
- **Encryption**: Use existing crypto utilities (AES-GCM)
- **Offline-First**: Sharing works offline, syncs when available
- **RLS**: Row Level Security on all shared data (if using Supabase)

### Principles
- **BMAD**: Operate in Background → Mission → Actions → Deliverables cycles
- **Challenge Assumptions**: Why not just use messaging apps? Answer: Recovery-focused, structured sharing, integrated with app data
- **Ship Small**: Start with code-based connection, add messaging later

### Risks & Mitigations
1. **Risk**: Privacy concerns → **Mitigation**: Per-item sharing, clear controls, can revoke anytime
2. **Risk**: Sponsor doesn't have app → **Mitigation**: Web portal for sponsors, or SMS/email summaries
3. **Risk**: Encryption complexity → **Mitigation**: Use existing crypto utilities, clear UX
4. **Risk**: Network effects slow → **Mitigation**: Make connection easy (code-based), show value immediately

---

## M — Mission (What to Build)

### Core Features

#### 1. Connection System
- **Code Generation**: Sponsor generates 6-digit code
- **Code Entry**: Sponsee enters code to connect
- **Relationship Status**: pending → accept → active → revoked
- **Multi-Sponsee Support**: Sponsor can have multiple sponsees

#### 2. Per-Item Sharing
- **Share Badge**: Visual indicator on shareable items
- **Share Toggle**: Per-item control (step entries, daily cards, journal entries, scenes, safety plans)
- **Version History**: Track what sponsor has seen
- **Revoke Sharing**: Can revoke anytime, per-item or all

#### 3. Sponsor Dashboard (Read-Only)
- **Shared Items View**: See all shared items from sponsees
- **Risk Indicators**: Visual alerts for high cravings, low mood, missed check-ins
- **Summary View**: Weekly/monthly summaries (if sponsee opts in)
- **Action Items**: "Call me" / "Need help" buttons

#### 4. Encrypted Messaging (Optional)
- **Two-Way Communication**: Sponsor ↔ Sponsee
- **End-to-End Encryption**: Using libsodium or existing crypto
- **Message Threads**: Organized conversations
- **Read Receipts**: Know when messages read

### Success Metrics
- **Connection Rate**: 40%+ of users connect with sponsor
- **Sharing Rate**: 60%+ of connected users share at least 1 item
- **Retention Impact**: 2-3x higher retention for connected users
- **Sobriety Impact**: 37+ days longer sobriety (research-backed)

---

## A — Actions (Step-by-Step Implementation)

### A0. Sanity & Risk Pass
**Challenge Thinking:**
- Why not just use messaging apps? → Answer: Recovery-focused, structured sharing, integrated with app data
- What if sponsor doesn't have app? → Answer: Web portal or SMS/email summaries
- What about privacy? → Answer: Per-item granularity, clear controls, can revoke

**Top Risks:**
1. Privacy concerns → Mitigation: Per-item sharing, clear opt-in, can revoke
2. Sponsor doesn't have app → Mitigation: Web portal, SMS/email fallback
3. Encryption complexity → Mitigation: Use existing crypto, clear UX
4. Network effects slow → Mitigation: Make connection easy, show value

### A1. Type System

**File**: `client/src/types.ts`

```typescript
export interface SponsorRelationship {
  id: string;
  sponsorId: string; // Sponsor's user ID (if they have account)
  sponsorCode: string; // 6-digit code for connection
  sponseeId?: string; // This user's ID (if they're sponsee)
  role: "sponsor" | "sponsee"; // User's role in this relationship
  status: "pending" | "active" | "revoked";
  createdAtISO: string;
  acceptedAtISO?: string;
  revokedAtISO?: string;
  sponsorName?: string; // Display name
  sponsorPhone?: string; // For "call sponsor" action
}

export interface SharedItem {
  id: string;
  itemType: "step-entry" | "daily-entry" | "journal-entry" | "scene" | "safety-plan";
  itemId: string; // ID of the actual item
  relationshipId: string; // SponsorRelationship ID
  sharedAtISO: string;
  revokedAtISO?: string;
  lastViewedAtISO?: string; // When sponsor last viewed
  version?: number; // For versioned items (step entries)
}

export interface SponsorMessage {
  id: string;
  threadId: string; // Conversation thread ID
  relationshipId: string; // SponsorRelationship ID
  senderId: string; // User ID or "sponsor"
  recipientId: string;
  contentCiphertext: string; // Encrypted message
  nonce: string; // For decryption
  createdAtISO: string;
  readAtISO?: string;
}

export interface SponsorSummary {
  id: string;
  relationshipId: string;
  periodStartISO: string;
  periodEndISO: string;
  summary: string; // AI-generated or user-written
  sharedAtISO: string;
  viewedAtISO?: string;
}

// Add to AppState
export interface AppState {
  // ... existing fields
  sponsorRelationships: Record<string, SponsorRelationship>; // id -> relationship
  sharedItems: Record<string, SharedItem>; // id -> shared item
  sponsorMessages: Record<string, SponsorMessage>; // id -> message
  sponsorSummaries: Record<string, SponsorSummary>; // id -> summary
}
```

### A2. State Management

**File**: `client/src/store/useAppStore.ts`

**Add Actions:**
```typescript
// Connection Management
generateSponsorCode: () => string; // Returns 6-digit code
connectToSponsor: (code: string) => Promise<void>; // Sponsee connects
acceptConnection: (relationshipId: string) => void; // Sponsor accepts
revokeConnection: (relationshipId: string) => void;

// Sharing Management
shareItem: (itemType: SharedItem['itemType'], itemId: string, relationshipId: string) => void;
revokeSharing: (sharedItemId: string) => void;
getSharedItems: (relationshipId: string) => SharedItem[];
isItemShared: (itemType: SharedItem['itemType'], itemId: string, relationshipId: string) => boolean;

// Messaging
sendSponsorMessage: (relationshipId: string, content: string) => Promise<void>; // Encrypts and sends
getMessages: (relationshipId: string) => SponsorMessage[];
markMessageRead: (messageId: string) => void;

// Summaries
generateWeeklySummary: (relationshipId: string) => Promise<SponsorSummary>; // AI-generated
sendSummaryToSponsor: (summaryId: string, relationshipId: string) => void;
```

### A3. UI Components

#### A3.1 Connection Flow Component

**File**: `client/src/components/sponsor-connection/ConnectionFlow.tsx`

**Features:**
- **Sponsor Mode**: Generate code, share with sponsee
- **Sponsee Mode**: Enter code, connect
- **Status Display**: Show connection status (pending/active/revoked)
- **Quick Actions**: "Call Sponsor", "Message Sponsor"

**UI Design:**
- Wizard flow: Role selection → Code generation/entry → Confirmation
- Large, clear code display (sponsor)
- Code input with validation (sponsee)
- Status indicator (pending/active)

#### A3.2 Share Badge Component

**File**: `client/src/components/sponsor-connection/ShareBadge.tsx`

**Features:**
- Visual indicator on shareable items
- Toggle to share/unshare
- Shows which sponsor(s) item is shared with
- Quick share menu

**UI Design:**
- Small badge icon (eye icon when shared, eye-slash when not)
- Tap to toggle or open share menu
- Shows sponsor name(s) when shared
- Accessible: "Shared with [Sponsor Name]"

#### A3.3 Sponsor Dashboard Component

**File**: `client/src/components/sponsor-connection/SponsorDashboard.tsx`

**Features:**
- List all sponsees
- View shared items per sponsee
- Risk indicators (high cravings, low mood, missed check-ins)
- Action buttons: "Call Sponsee", "Send Message"
- Weekly summaries view

**UI Design:**
- Card-based layout (one card per sponsee)
- Risk indicators with color coding
- Shared items list (grouped by type)
- Quick actions at top of each card

#### A3.4 Messaging Component

**File**: `client/src/components/sponsor-connection/SponsorMessaging.tsx`

**Features:**
- Message thread view
- Send/receive encrypted messages
- Read receipts
- Message encryption/decryption (transparent to user)

**UI Design:**
- Chat interface (similar to messaging apps)
- Message bubbles (sent/received)
- Input at bottom
- Encryption indicator (lock icon)

### A4. Integration Points

#### A4.1 Step Work Integration

**File**: `client/src/routes/Steps.tsx`

**Changes:**
- Add share badge to each step entry
- "Share with Sponsor" toggle
- Show version history (what sponsor has seen)

#### A4.2 Daily Cards Integration

**File**: `client/src/routes/Home.tsx`

**Changes:**
- Add share badge to daily cards
- "Share today's check-in" quick action
- Show sharing status

#### A4.3 Journal Integration

**File**: `client/src/routes/Journal.tsx`

**Changes:**
- Add share badge to journal entries
- Per-entry share toggle
- Filter: "Shared entries"

#### A4.4 Recovery Scenes Integration

**File**: `client/src/components/recovery-scenes/SceneList.tsx`

**Changes:**
- Add share badge to scenes
- "Share scene with sponsor" option
- Sponsor can see shared scenes

#### A4.5 Web Portal (Future)

**File**: `apps/web/src/app/sponsor/[code]/page.tsx` (NEW)

**Features:**
- Sponsor can access dashboard via web (no app needed)
- View shared items
- Send messages
- See risk indicators

**Implementation:**
- Next.js 14 App Router
- Code-based authentication
- Read-only access (no editing sponsee data)

### A5. Encryption Implementation

**File**: `client/src/lib/sponsor-crypto.ts` (NEW)

**Features:**
- Encrypt messages using existing crypto utilities
- Generate shared keys per relationship
- Store keys securely (expo-secure-store or localStorage with encryption)

**Implementation:**
- Use existing `crypto.ts` utilities
- Generate shared secret per relationship
- Encrypt messages before sending
- Decrypt messages when receiving

### A6. Cloud Sync Integration (Optional)

**File**: `server/routes.ts` (if using Supabase)

**Features:**
- Store relationships in Supabase
- Store shared items with RLS
- Store encrypted messages
- Sync when online

**RLS Policies:**
- Owner can read own relationships
- Sponsor can read shared items from sponsees
- Sponsee can read shared items they shared
- No service role keys on client

### A7. Testing

**Unit Tests:**
- `client/src/lib/__tests__/sponsor-connection.test.ts`
  - Test code generation
  - Test connection flow
  - Test sharing logic
  - Test encryption/decryption

**Integration Tests:**
- `client/src/components/__tests__/ConnectionFlow.test.tsx`
  - Test sponsor code generation
  - Test sponsee code entry
  - Test connection acceptance

**E2E Tests:**
- Sponsor generates code → Sponsee enters code → Connection established
- Sponsee shares item → Sponsor views item → Revoke sharing

---

## D — Deliverables (What Must Exist)

### Code Deliverables
1. ✅ `SponsorRelationship`, `SharedItem`, `SponsorMessage` types
2. ✅ Connection CRUD actions in Zustand store
3. ✅ `ConnectionFlow` component
4. ✅ `ShareBadge` component
5. ✅ `SponsorDashboard` component
6. ✅ `SponsorMessaging` component
7. ✅ Integration with Step Work, Daily Cards, Journal, Scenes
8. ✅ Encryption utilities for messaging
9. ✅ Cloud sync (if using Supabase)

### UX Deliverables
1. ✅ Connection can be established in <1 minute
2. ✅ Sharing is <2 taps per item
3. ✅ Sponsor dashboard is clear and actionable
4. ✅ All components accessible (keyboard, screen reader)
5. ✅ Mobile-responsive

### Data Deliverables
1. ✅ Relationships stored locally (Zustand)
2. ✅ Shared items tracked
3. ✅ Messages encrypted
4. ✅ Analytics events fire correctly

### Documentation Deliverables
1. ✅ README update: How Sponsor Connection works
2. ✅ User guide: How to connect and share
3. ✅ Developer notes: Encryption implementation

---

## Success Criteria

### Must Have (MVP)
- [ ] Sponsor can generate code
- [ ] Sponsee can enter code and connect
- [ ] Sponsee can share items (step entries, daily cards, journal)
- [ ] Sponsor can view shared items (read-only)
- [ ] Sharing can be revoked
- [ ] Per-item sharing controls work

### Should Have (Enhanced)
- [ ] Encrypted messaging
- [ ] Risk indicators on sponsor dashboard
- [ ] Weekly summaries
- [ ] Web portal for sponsors

### Nice to Have (Future)
- [ ] SMS/email fallback for sponsors without app
- [ ] Multiple sponsors per sponsee
- [ ] Group sharing (sponsor + recovery friends)
- [ ] Share analytics (what sponsor views most)

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Type system + state management
- Day 3-4: Connection flow (code generation/entry)
- Day 5: Basic sharing logic

### Week 2: Sharing
- Day 1-2: Share badge component
- Day 3: Integration with Step Work, Daily Cards, Journal
- Day 4: Sponsor dashboard (basic)
- Day 5: Testing + polish

### Week 3: Enhancement
- Day 1-2: Encrypted messaging
- Day 3: Risk indicators
- Day 4-5: Weekly summaries

### Week 4: Web Portal (Optional)
- Day 1-3: Next.js sponsor portal
- Day 4-5: Testing + deployment

---

## Notes & Considerations

### Privacy
- Per-item sharing granularity (not all-or-nothing)
- Clear opt-in for sharing
- Can revoke anytime
- No service role keys on client
- Encryption for sensitive messages

### Accessibility
- All components WCAG 2.2 AA compliant
- Keyboard navigation required
- Screen reader support required
- Large touch targets (44px+)

### Performance
- Connection should be instant
- Sharing should be <100ms
- Encryption/decryption should be transparent

### Edge Cases
- What if sponsor doesn't have app? → Web portal or SMS/email
- What if code is wrong? → Clear error, allow retry
- What if relationship revoked? → Clear UI, can reconnect
- What if encryption fails? → Fallback to unencrypted (with warning)

---

**Status**: Ready for Implementation
**Priority**: P0 (Critical for Retention & Network Effects)
**Estimated Effort**: 3-4 weeks (MVP: 2 weeks)
**Dependencies**: Existing crypto utilities, optional Supabase

