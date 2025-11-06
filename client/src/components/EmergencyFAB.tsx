import { buttonVariants } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { Link } from 'wouter';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

export default function EmergencyFAB() {
  const handleClick = () => {
    haptics.warning();
  };

  return (
    <Link
      href="/emergency"
      className={cn(
        buttonVariants({ variant: "destructive", size: "icon" }),
        "fixed bottom-20 right-4 md:right-6 h-16 w-16 rounded-full shadow-2xl z-50 animate-pulse"
      )}
      data-testid="emergency-fab"
      aria-label="Emergency help"
      onClick={handleClick}
    >
      <Phone className="h-7 w-7" />
    </Link>
  );
}
