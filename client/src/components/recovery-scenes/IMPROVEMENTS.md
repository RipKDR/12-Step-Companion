# Recovery Scenes - Improvements & Optimizations

## 🚀 Performance Optimizations

### 1. Memoization & React Optimizations
**Current Issue**: Components re-render unnecessarily, filtering recalculates on every render

**Improvements**:
```typescript
// SceneList.tsx - Memoize filtered scenes
const filteredScenes = useMemo(() => {
  return allScenes.filter((scene) => {
    if (filter === 'active' && !scene.active) return false;
    if (filter === 'inactive' && scene.active) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        scene.label.toLowerCase().includes(query) ||
        scene.description?.toLowerCase().includes(query) ||
        scene.triggers.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });
}, [allScenes, filter, searchQuery]);

// Memoize handlers
const handleDelete = useCallback((sceneId: string) => {
  deleteRecoveryScene(sceneId);
  setDeletingSceneId(null);
}, [deleteRecoveryScene]);

// Memoize components
export const SceneCard = React.memo(({ scene, onActivate, onEdit, onDelete }) => {
  // ...
});
```

### 2. Store Selector Optimization
**Current Issue**: Components subscribe to entire store

**Improvement**:
```typescript
// Use shallow equality selectors
const getAllRecoveryScenes = useAppStore(
  (state) => state.getAllRecoveryScenes(),
  shallow
);
```

### 3. Lazy Loading Scene Playbook
**Current Issue**: ScenePlaybook loads all dependencies upfront

**Improvement**:
```typescript
const ScenePlaybook = lazy(() => import('./ScenePlaybook'));
```

---

## 🎨 UX Enhancements

### 1. Better Error Handling & User Feedback
**Current Issue**: Uses `alert()` and `console.log()`, no error boundaries

**Improvements**:
```typescript
// Replace alerts with toast notifications
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// In handleActionClick
case 'tool':
  if (action.data) {
    // Navigate using router instead of window.location
    navigate(`/tools/${action.data}`);
  } else {
    toast({
      title: 'Tool not configured',
      description: 'Please configure this action in scene settings.',
      variant: 'destructive',
    });
  }
  break;

case 'call':
case 'text':
  if (!contact?.phone) {
    toast({
      title: 'Contact missing phone number',
      description: 'This contact does not have a phone number configured.',
      variant: 'destructive',
    });
    return;
  }
  // ... rest of logic
```

### 2. Loading States
**Current Issue**: No loading indicators during scene operations

**Improvement**:
```typescript
const [isActivating, setIsActivating] = useState(false);

const handleActivate = async (sceneId: string) => {
  setIsActivating(true);
  try {
    activateScene(sceneId, 'manual');
    setActivatingSceneId(sceneId);
  } catch (error) {
    toast({
      title: 'Failed to activate scene',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setIsActivating(false);
  }
};
```

### 3. Form Validation & Feedback
**Current Issue**: Basic validation, no real-time feedback

**Improvement**:
```typescript
// Add Zod schema validation
import { z } from 'zod';

const sceneSchema = z.object({
  label: z.string().min(3, 'Scene name must be at least 3 characters'),
  triggers: z.array(z.string()).min(1, 'Add at least one trigger'),
  earlyWarningSigns: z.array(z.string()).min(1, 'Add at least one warning sign'),
  actions: z.array(actionSchema).min(1).max(3, 'Add 1-3 actions'),
  messageFromSoberMe: z.string().min(10, 'Message must be at least 10 characters'),
});

// Real-time validation
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: any) => {
  try {
    sceneSchema.shape[field].parse(value);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
    }
  }
};
```

### 4. Better Empty States
**Current Issue**: Generic empty state messages

**Improvement**:
```typescript
// SceneList.tsx
{filteredScenes.length === 0 && (
  <Card>
    <CardContent className="py-12 text-center">
      {searchQuery ? (
        <>
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No scenes found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or create a new scene.
          </p>
          <Button onClick={() => setSearchQuery('')} variant="outline">
            Clear Search
          </Button>
        </>
      ) : (
        <>
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Create your first recovery scene</h3>
          <p className="text-muted-foreground mb-4">
            Recovery scenes help you prepare for high-risk moments with personalized actions.
          </p>
          <div className="space-y-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Scene
            </Button>
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              View Examples
            </Button>
          </div>
        </>
      )}
    </CardContent>
  </Card>
)}
```

---

## 🔧 Feature Enhancements

### 1. Time-Based Notifications (Missing Implementation)
**Current Issue**: Time triggers exist but no notifications scheduled

**Implementation**:
```typescript
// client/src/lib/scene-notifications.ts
import { NotificationManager } from './notifications';

export async function scheduleSceneNotifications(scenes: RecoveryScene[]) {
  const activeScenes = scenes.filter((s) => s.active && s.timeTriggers);
  
  for (const scene of activeScenes) {
    const { dayOfWeek, timeRange } = scene.timeTriggers!;
    
    if (dayOfWeek && timeRange) {
      // Schedule for each day
      for (const day of dayOfWeek) {
        await scheduleSceneNotification(scene, day, timeRange);
      }
    }
  }
}

async function scheduleSceneNotification(
  scene: RecoveryScene,
  dayOfWeek: number,
  timeRange: { start: string; end: string }
) {
  // Calculate next occurrence
  const now = new Date();
  const [startHours, startMinutes] = timeRange.start.split(':').map(Number);
  
  // Schedule notification at start of time range
  const notificationTime = getNextOccurrence(dayOfWeek, startHours, startMinutes);
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_SCENE_NOTIFICATION',
      sceneId: scene.id,
      time: notificationTime.getTime(),
      notification: {
        title: `Recovery Scene: ${scene.label}`,
        body: `This is one of your risky times. Want to open your "${scene.label}" scene?`,
        tag: `scene-${scene.id}`,
        data: { type: 'scene-trigger', sceneId: scene.id },
        actions: [
          { action: 'open-scene', title: 'Open Scene' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      }
    });
  }
}
```

### 2. Scene Templates
**Current Issue**: Users start from scratch

**Enhancement**:
```typescript
// client/src/data/scene-templates.ts
export const SCENE_TEMPLATES: Partial<RecoveryScene>[] = [
  {
    label: 'Home alone after 10pm',
    description: 'When you\'re alone at home late at night',
    triggers: ['loneliness', 'boredom', 'isolation'],
    earlyWarningSigns: ['restlessness', 'racing thoughts', 'fantasizing'],
    actions: [
      {
        id: 'temp-1',
        type: 'call',
        label: 'Call sponsor',
        data: '',
        order: 1
      },
      {
        id: 'temp-2',
        type: 'tool',
        label: 'Do breathing exercise',
        data: 'breathing',
        order: 2
      }
    ],
    messageFromSoberMe: 'Remember: This feeling is temporary. You are not alone. Reach out to someone.',
  },
  // ... more templates
];

// In SceneEditor
const [useTemplate, setUseTemplate] = useState<Partial<RecoveryScene> | null>(null);

const handleUseTemplate = (template: Partial<RecoveryScene>) => {
  setFormData({
    ...formData,
    ...template,
    actions: template.actions?.map((a, idx) => ({
      ...a,
      id: `action_${Date.now()}_${idx}`,
    })) || [],
  });
  setUseTemplate(null);
  setStep(1);
};
```

### 3. Duplicate Scene Functionality
**Enhancement**:
```typescript
// SceneList.tsx
const handleDuplicate = (scene: RecoveryScene) => {
  const duplicated: Omit<RecoveryScene, 'id' | 'createdAtISO' | 'updatedAtISO' | 'usageCount'> = {
    ...scene,
    label: `${scene.label} (Copy)`,
    active: false, // Start inactive
  };
  createRecoveryScene(duplicated);
  toast({
    title: 'Scene duplicated',
    description: 'Edit the new scene to customize it.',
  });
};
```

### 4. Scene Analytics & Insights
**Enhancement**:
```typescript
// Add to SceneList
const getSceneStats = (sceneId: string) => {
  const usages = Object.values(sceneUsages || {}).filter((u) => u.sceneId === sceneId);
  const totalUsages = usages.length;
  const helpedCount = usages.filter((u) => u.outcome === 'helped').length;
  const avgActionsCompleted = usages.reduce((sum, u) => sum + u.actionsCompleted.length, 0) / totalUsages || 0;
  
  return {
    totalUsages,
    helpedRate: totalUsages > 0 ? (helpedCount / totalUsages) * 100 : 0,
    avgActionsCompleted,
    lastUsed: usages.sort((a, b) => 
      new Date(b.activatedAtISO).getTime() - new Date(a.activatedAtISO).getTime()
    )[0]?.activatedAtISO,
  };
};
```

### 5. Better Action Handling
**Current Issue**: Tool actions use console.log, meeting uses window.location

**Improvement**:
```typescript
// Use proper routing
import { useLocation } from 'wouter';

const [, setLocation] = useLocation();

case 'tool':
  // Map tool names to routes
  const toolRoutes: Record<string, string> = {
    breathing: '/emergency?tool=breathing',
    grounding: '/emergency?tool=grounding',
    meditation: '/resources?tool=meditation',
    journal: '/journal?quick=true',
    affirmations: '/resources?tool=affirmations',
  };
  
  const route = toolRoutes[action.data] || '/emergency';
  setLocation(route);
  break;

case 'meeting':
  setLocation('/meetings');
  break;
```

---

## 🛡️ Code Quality Improvements

### 1. Error Boundaries
**Enhancement**:
```typescript
// Wrap ScenePlaybook in error boundary
<ErrorBoundary
  fallback={
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">Failed to load scene</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading this recovery scene.
        </p>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </CardContent>
    </Card>
  }
>
  <ScenePlaybook sceneId={sceneId} open={open} onOpenChange={onOpenChange} />
</ErrorBoundary>
```

### 2. Input Validation & Sanitization
**Enhancement**:
```typescript
// Validate and sanitize inputs
const sanitizeTrigger = (trigger: string): string => {
  return trigger.trim().slice(0, 50); // Max 50 chars
};

const addTrigger = () => {
  const trigger = prompt('Enter a trigger:');
  if (trigger && trigger.trim()) {
    const sanitized = sanitizeTrigger(trigger);
    if (sanitized.length < 2) {
      toast({
        title: 'Trigger too short',
        description: 'Triggers must be at least 2 characters.',
        variant: 'destructive',
      });
      return;
    }
    setFormData({
      ...formData,
      triggers: [...(formData.triggers || []), sanitized],
    });
  }
};
```

### 3. Type Safety Improvements
**Enhancement**:
```typescript
// Add stricter types
type SceneActionType = SceneAction['type'];

const ACTION_TYPE_CONFIG: Record<SceneActionType, {
  requiresData: boolean;
  requiresContact: boolean;
  defaultLabel: string;
}> = {
  'call': { requiresData: false, requiresContact: true, defaultLabel: 'Call Contact' },
  'text': { requiresData: false, requiresContact: true, defaultLabel: 'Text Contact' },
  'tool': { requiresData: true, requiresContact: false, defaultLabel: 'Use Tool' },
  'meeting': { requiresData: false, requiresContact: false, defaultLabel: 'Find Meeting' },
  'safety-plan': { requiresData: false, requiresContact: false, defaultLabel: 'Open Safety Plan' },
  'reminder': { requiresData: true, requiresContact: false, defaultLabel: 'Reminder' },
  'custom': { requiresData: true, requiresContact: false, defaultLabel: 'Custom Action' },
};
```

---

## ♿ Accessibility Improvements

### 1. Better ARIA Labels
**Enhancement**:
```typescript
<Button
  onClick={() => handleActivate(scene.id)}
  aria-label={`Activate recovery scene: ${scene.label}`}
  aria-describedby={`scene-${scene.id}-description`}
>
  <Play className="h-4 w-4 mr-2" aria-hidden="true" />
  Use Scene
</Button>
<div id={`scene-${scene.id}-description`} className="sr-only">
  {scene.description || `Scene with ${scene.actions.length} actions`}
</div>
```

### 2. Keyboard Navigation
**Enhancement**:
```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K to open quick access
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
    // Escape to close dialogs
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowEditor(false);
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 3. Focus Management
**Enhancement**:
```typescript
// Auto-focus first action when scene opens
useEffect(() => {
  if (open && scene?.actions.length > 0) {
    const firstActionButton = document.querySelector(
      `[data-action-id="${scene.actions[0].id}"]`
    ) as HTMLButtonElement;
    firstActionButton?.focus();
  }
}, [open, scene]);
```

---

## 🔗 Integration Improvements

### 1. Better Contact Handling
**Enhancement**:
```typescript
// Validate contact exists before allowing selection
const availableContacts = contacts.filter((c) => {
  if (action.type === 'call' || action.type === 'text') {
    return c.phone; // Only show contacts with phone numbers
  }
  return true;
});

// Show warning if contact deleted
useEffect(() => {
  if (action.contactId) {
    const contact = contacts.find((c) => c.id === action.contactId);
    if (!contact) {
      toast({
        title: 'Contact not found',
        description: 'This contact may have been deleted. Please select a different contact.',
        variant: 'destructive',
      });
      updateAction(idx, { contactId: undefined });
    }
  }
}, [contacts, action.contactId]);
```

### 2. Scene Usage Analytics Integration
**Enhancement**:
```typescript
// Track scene usage in analytics
const activateScene = (sceneId: string, activationType: SceneUsage['activationType']) => {
  // ... existing logic
  
  // Track analytics
  if (get().settings.analytics.enabled) {
    trackAnalyticsEvent('scene_activated', {
      sceneId,
      activationType,
      sceneLabel: scene.label,
    });
  }
};
```

---

## 📊 Performance Metrics to Track

1. **Scene Creation Time**: Time from clicking "Create" to scene saved
2. **Scene Activation Time**: Time from clicking scene to playbook displayed
3. **Action Completion Rate**: % of actions completed per scene usage
4. **Scene Effectiveness**: % of usages marked as "helped"
5. **Scene Usage Frequency**: How often scenes are used

---

## 🎯 Priority Recommendations

### High Priority (Do First)
1. ✅ Replace `alert()` with toast notifications
2. ✅ Add proper error handling and validation
3. ✅ Implement time-based notifications
4. ✅ Add loading states
5. ✅ Memoize expensive computations

### Medium Priority
1. ✅ Add scene templates
2. ✅ Improve empty states
3. ✅ Better action handling (routing)
4. ✅ Add scene analytics/insights
5. ✅ Accessibility improvements

### Low Priority (Nice to Have)
1. ✅ Duplicate scene functionality
2. ✅ Keyboard shortcuts
3. ✅ Scene export/import
4. ✅ Scene sharing with sponsor
5. ✅ Advanced filtering and sorting

---

## 🧪 Testing Improvements Needed

1. **Unit Tests**: Test scene CRUD operations
2. **Integration Tests**: Test scene activation flow
3. **E2E Tests**: Test complete scene creation → activation → outcome flow
4. **Accessibility Tests**: Screen reader, keyboard navigation
5. **Performance Tests**: Measure render times, filter performance

