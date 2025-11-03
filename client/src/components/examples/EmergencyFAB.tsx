import EmergencyFAB from '../EmergencyFAB';
import { Router } from 'wouter';

export default function EmergencyFABExample() {
  return (
    <Router>
      <div className="bg-background h-screen relative">
        <EmergencyFAB />
      </div>
    </Router>
  );
}
