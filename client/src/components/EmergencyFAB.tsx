import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { Link } from 'wouter';

export default function EmergencyFAB() {
  return (
    <Link href="/emergency">
      <a>
        <Button
          size="icon"
          variant="destructive"
          className="fixed bottom-20 right-4 md:right-6 h-16 w-16 rounded-full shadow-2xl z-50 animate-pulse"
          data-testid="emergency-fab"
          aria-label="Emergency help"
        >
          <Phone className="h-7 w-7" />
        </Button>
      </a>
    </Link>
  );
}
