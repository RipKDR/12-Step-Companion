import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ExternalLink, LifeBuoy, PhoneCall, ShieldCheck } from 'lucide-react';

interface HarmReductionContent {
  naloxone: {
    title: string;
    summary?: string;
    steps: Array<{ title: string; details: string }>;
    aftercare?: string[];
  };
  saferUse: {
    title: string;
    summary?: string;
    tips: string[];
  };
  resources: Array<{
    name: string;
    description?: string;
    url?: string;
    phone?: string;
    display?: string;
    type: 'web' | 'phone';
  }>;
}

const HARM_REDUCTION_CONTENT_PATH = '/content/harmReduction.json';

function getDialFromData(data: string): string | null {
  if (!data) return null;
  if (data.startsWith('tel:')) {
    return data.replace('tel:', '');
  }
  return data;
}

function normalisePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  return phone.replace(/[^+\d]/g, '');
}

export function HarmReductionCard() {
  const [content, setContent] = useState<HarmReductionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const emergencyActions = useAppStore((state) => state.emergencyActions);
  const updateEmergencyAction = useAppStore((state) => state.updateEmergencyAction);
  const harmReductionStatus = useAppStore((state) => state.harmReductionStatus);
  const updateHarmReductionStatus = useAppStore((state) => state.updateHarmReductionStatus);
  const contacts = useAppStore((state) => Object.values(state.fellowshipContacts));

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(HARM_REDUCTION_CONTENT_PATH);
        if (!response.ok) {
          throw new Error('Failed to load harm-reduction guidance');
        }
        const json = (await response.json()) as HarmReductionContent;
        if (isMounted) {
          setContent(json);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load harm-reduction instructions right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const harmReductionContacts = useMemo(
    () => contacts.filter((contact) => contact.isHarmReductionContact && contact.phone),
    [contacts]
  );

  const callActions = useMemo(
    () => emergencyActions.filter((action) => action.type === 'call'),
    [emergencyActions]
  );

  const preferredCallActions = useMemo(
    () => callActions.filter((action) => action.isHarmReductionPreferred),
    [callActions]
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!harmReductionStatus.updatedAtISO) return null;
    try {
      return formatDistanceToNow(new Date(harmReductionStatus.updatedAtISO), { addSuffix: true });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [harmReductionStatus.updatedAtISO]);

  if (loading) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-destructive" />
            Harm Reduction Support
          </CardTitle>
          <CardDescription>Preparing quick steps for overdose response…</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Harm Reduction Support
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or check back later for updated instructions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return null;
  }

  const handleStatusToggle = (
    key: 'naloxoneAvailable' | 'fentanylTestStripsAvailable' | 'sharpsContainerAvailable'
  ) =>
    (checked: boolean) => {
      updateHarmReductionStatus({ [key]: checked });
    };

  const phoneResources = content.resources.filter(
    (resource) => resource.type === 'phone' && resource.phone
  );

  const quickCallCount =
    harmReductionContacts.length + preferredCallActions.length + phoneResources.length;

  const renderQuickCallButton = (label: string, phoneNumber: string, key: string) => {
    const normalized = normalisePhone(phoneNumber);
    if (!normalized) return null;

    return (
      <Button
        key={key}
        asChild
        size="sm"
        variant="secondary"
        className="justify-start"
        data-testid={`button-harm-call-${key}`}
      >
        <a href={`tel:${normalized}`} className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </a>
      </Button>
    );
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-destructive" />
          Harm Reduction Support
        </CardTitle>
        <CardDescription>
          Quick access to overdose response steps, safer-use guidance, and trusted contacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-destructive/90">Quick call list</h3>
            <Badge variant="outline" className="text-xs">
              {quickCallCount} saved
            </Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {harmReductionContacts.map((contact) =>
              renderQuickCallButton(contact.name, contact.phone || '', `contact-${contact.id}`)
            )}
            {preferredCallActions.map((action) => {
              const dial = getDialFromData(action.data);
              return dial
                ? renderQuickCallButton(action.label, dial, `action-${action.id}`)
                : null;
            })}
            {phoneResources.map((resource) =>
              renderQuickCallButton(
                resource.display || resource.name,
                resource.phone!,
                `resource-${resource.phone}`
              )
            )}
            {quickCallCount === 0 && (
              <p className="text-sm text-muted-foreground">
                Flag contacts or emergency actions below to show them here for one-tap support.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-destructive">Kit readiness</h3>
              <p className="text-sm text-destructive/80">
                Track whether life-saving supplies are stocked and ready to go.
              </p>
            </div>
            {lastUpdatedLabel && (
              <span className="text-xs text-destructive/70">Updated {lastUpdatedLabel}</span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-background px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Naloxone kit on hand</p>
                  <p className="text-xs text-muted-foreground">Keep at least one unused kit nearby.</p>
                </div>
              </div>
              <Switch
                checked={harmReductionStatus.naloxoneAvailable}
                onCheckedChange={handleStatusToggle('naloxoneAvailable')}
                data-testid="switch-naloxone-available"
              />
            </div>
            <div className="flex items-center justify-between rounded-md bg-background px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Fentanyl test strips ready</p>
                  <p className="text-xs text-muted-foreground">Store them dry and out of direct sunlight.</p>
                </div>
              </div>
              <Switch
                checked={harmReductionStatus.fentanylTestStripsAvailable}
                onCheckedChange={handleStatusToggle('fentanylTestStripsAvailable')}
                data-testid="switch-test-strips"
              />
            </div>
            <div className="flex items-center justify-between rounded-md bg-background px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Sharps disposal available</p>
                  <p className="text-xs text-muted-foreground">Secure container reduces accidental injuries.</p>
                </div>
              </div>
              <Switch
                checked={harmReductionStatus.sharpsContainerAvailable}
                onCheckedChange={handleStatusToggle('sharpsContainerAvailable')}
                data-testid="switch-sharps-container"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Overdose response & safer-use guidance</h3>
            <p className="text-sm text-muted-foreground">
              Expand each section for step-by-step support you can follow in the moment.
            </p>
          </div>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="naloxone">
              <AccordionTrigger className="text-left">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{content.naloxone.title}</span>
                  {content.naloxone.summary && (
                    <span className="text-xs text-muted-foreground">{content.naloxone.summary}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 pl-5 text-sm list-decimal">
                  {content.naloxone.steps.map((step, index) => (
                    <li key={index} className="space-y-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-muted-foreground">{step.details}</p>
                    </li>
                  ))}
                </ol>
                {content.naloxone.aftercare && (
                  <div className="mt-4 rounded-md bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Aftercare
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {content.naloxone.aftercare.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="safer-use">
              <AccordionTrigger className="text-left">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{content.saferUse.title}</span>
                  {content.saferUse.summary && (
                    <span className="text-xs text-muted-foreground">{content.saferUse.summary}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {content.saferUse.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="text-base font-semibold">Trusted resources</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.resources.map((resource) => (
              <div key={resource.name} className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {resource.type === 'phone' ? 'Hotline' : 'Resource'}
                  </Badge>
                  <span className="font-medium text-sm">{resource.name}</span>
                </div>
                {resource.description && (
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                )}
                {resource.type === 'web' && resource.url && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start px-0 text-primary"
                    data-testid={`link-harm-resource-${resource.name}`}
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Visit site
                    </a>
                  </Button>
                )}
                {resource.type === 'phone' && resource.phone && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start px-0 text-primary"
                    data-testid={`link-harm-resource-${resource.phone}`}
                  >
                    <a href={`tel:${normalisePhone(resource.phone)}`}>
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Call {resource.display || resource.phone}
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="text-base font-semibold">Pin quick actions</h3>
          <p className="text-sm text-muted-foreground">
            Choose which emergency call buttons appear above for one-tap harm-reduction support.
          </p>
          <div className="space-y-2">
            {callActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.data}</p>
                </div>
                <Switch
                  checked={!!action.isHarmReductionPreferred}
                  onCheckedChange={(checked) =>
                    updateEmergencyAction(action.id, { isHarmReductionPreferred: checked })
                  }
                  data-testid={`switch-harm-action-${action.id}`}
                />
              </div>
            ))}
            {callActions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add a phone-based emergency action to make it available for quick pinning.
              </p>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

export default HarmReductionCard;
