import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SafetyPlanDisplay from './SafetyPlanDisplay';
import SafetyPlanBuilder from './SafetyPlanBuilder';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function SafetyPlanQuickAccess() {
  const [showPlan, setShowPlan] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const safetyPlan = useAppStore((state) => state.getSafetyPlan());

  const handleClick = () => {
    if (safetyPlan) {
      setShowPlan(true);
    } else {
      setShowBuilder(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 min-h-[56px] min-w-[56px]"
        aria-label={safetyPlan ? "I Need Help - Open Safety Plan" : "I Need Help - Create Safety Plan"}
        title={safetyPlan ? "Open Safety Plan" : "Create Safety Plan"}
      >
        <Shield className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Safety Plan Display */}
      <Dialog open={showPlan} onOpenChange={setShowPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanDisplay onClose={() => setShowPlan(false)} />
        </DialogContent>
      </Dialog>

      {/* Safety Plan Builder */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SafetyPlanBuilder
            onComplete={() => {
              setShowBuilder(false);
              setShowPlan(true);
            }}
            onCancel={() => setShowBuilder(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

