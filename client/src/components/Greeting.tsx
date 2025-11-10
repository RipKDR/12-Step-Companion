import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface GreetingProps {
  className?: string;
}

export default function Greeting({ className }: GreetingProps) {
  const profile = useAppStore((state) => state.profile);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const name = profile?.name;
    return `Good ${period}${name ? `, ${name}` : ''}!`;
  }, [profile?.name]);

  return (
    <div className={className}>
      <h1 className="text-3xl font-bold">{greeting}</h1>
      {profile?.cleanDate && (
        <p className="text-muted-foreground mt-2">
          Keep up the great work on your recovery journey
        </p>
      )}
    </div>
  );
}

