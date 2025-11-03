import { useState } from 'react';
import SobrietyCounter from '@/components/SobrietyCounter';
import DailyCard from '@/components/DailyCard';
import ProgressRing from '@/components/ProgressRing';
import { Button } from '@/components/ui/button';
import { Sunrise, Moon, BookOpen, BookMarked, Phone } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  // TODO: Replace with actual data from store
  const cleanDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const [morningIntent, setMorningIntent] = useState('');
  const [morningComplete, setMorningComplete] = useState(false);
  const [eveningReflection, setEveningReflection] = useState('');
  const [eveningComplete, setEveningComplete] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-8">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main">
        {/* Sobriety Counter */}
        <section aria-labelledby="sobriety-heading">
          <h1 id="sobriety-heading" className="sr-only">Your Clean Time</h1>
          <SobrietyCounter cleanDate={cleanDate} timezone="Australia/Melbourne" />
        </section>

        {/* Progress Ring */}
        <section className="flex justify-center py-6" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">Current Step Progress</h2>
          <ProgressRing current={7} total={10} stepNumber={1} />
        </section>

        {/* Daily Cards */}
        <section className="space-y-4" aria-labelledby="daily-heading">
          <h2 id="daily-heading" className="text-xl font-semibold mb-4">Daily Practice</h2>
          <DailyCard
            title="Morning Intent"
            icon={<Sunrise className="h-5 w-5" />}
            value={morningIntent}
            completed={morningComplete}
            onChange={setMorningIntent}
            onComplete={() => setMorningComplete(!morningComplete)}
            testId="morning-card"
          />
          <DailyCard
            title="Evening Reflection"
            icon={<Moon className="h-5 w-5" />}
            value={eveningReflection}
            completed={eveningComplete}
            onChange={setEveningReflection}
            onComplete={() => setEveningComplete(!eveningComplete)}
            testId="evening-card"
          />
        </section>

        {/* Quick Actions */}
        <section className="space-y-3" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/steps">
              <a className="block">
                <Button
                  variant="outline"
                  className="w-full h-14 justify-start gap-3 text-base"
                  data-testid="button-step-work"
                >
                  <BookOpen className="h-5 w-5" />
                  Continue Step Work
                </Button>
              </a>
            </Link>
            <Link href="/journal">
              <a className="block">
                <Button
                  variant="outline"
                  className="w-full h-14 justify-start gap-3 text-base"
                  data-testid="button-journal"
                >
                  <BookMarked className="h-5 w-5" />
                  New Journal Entry
                </Button>
              </a>
            </Link>
            <Link href="/emergency">
              <a className="block">
                <Button
                  variant="destructive"
                  className="w-full h-14 justify-start gap-3 text-base"
                  data-testid="button-emergency"
                >
                  <Phone className="h-5 w-5" />
                  Emergency Help
                </Button>
              </a>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
