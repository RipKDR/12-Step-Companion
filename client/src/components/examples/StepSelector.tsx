import StepSelector from '../StepSelector';
import { useState } from 'react';

export default function StepSelectorExample() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { number: 1, title: 'Step One', completed: false, progress: 70 },
    { number: 2, title: 'Step Two', completed: false, progress: 30 },
    { number: 3, title: 'Step Three', completed: false, progress: 0 },
    { number: 4, title: 'Step Four', completed: false, progress: 0 },
    { number: 5, title: 'Step Five', completed: false, progress: 0 },
    { number: 6, title: 'Step Six', completed: false, progress: 0 },
  ];

  return (
    <div className="bg-background p-4">
      <StepSelector 
        steps={steps} 
        onSelect={(num) => {
          console.log('Selected step:', num);
          setCurrentStep(num);
        }}
        currentStep={currentStep}
      />
    </div>
  );
}
