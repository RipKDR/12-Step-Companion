import DailyCard from '../DailyCard';
import { Sunrise, Moon } from 'lucide-react';
import { useState } from 'react';

export default function DailyCardExample() {
  const [morningValue, setMorningValue] = useState('Set a positive intention for the day');
  const [morningComplete, setMorningComplete] = useState(false);
  const [eveningValue, setEveningValue] = useState('');
  const [eveningComplete, setEveningComplete] = useState(false);

  return (
    <div className="bg-background p-4 space-y-4">
      <DailyCard
        title="Morning Intent"
        icon={<Sunrise className="h-5 w-5" />}
        value={morningValue}
        completed={morningComplete}
        onChange={setMorningValue}
        onComplete={() => setMorningComplete(!morningComplete)}
        testId="morning-card"
      />
      <DailyCard
        title="Evening Reflection"
        icon={<Moon className="h-5 w-5" />}
        value={eveningValue}
        completed={eveningComplete}
        onChange={setEveningValue}
        onComplete={() => setEveningComplete(!eveningComplete)}
        testId="evening-card"
      />
    </div>
  );
}
