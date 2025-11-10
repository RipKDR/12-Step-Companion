import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Vibrate,
  Waves,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDuration } from '@/lib/voice';
import { useAppStore } from '@/store/useAppStore';

interface MindfulnessMetadata {
  title: string;
  durationMinutes: number;
  audioUrl: string;
  overview?: string;
  chapters?: Array<{ label: string; start: string }>;
}

interface ReflectionState {
  sensation: string;
  compassionateAction: string;
}

export default function MindfulnessPack() {
  const [metadata, setMetadata] = useState<MindfulnessMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [sessionLogged, setSessionLogged] = useState(false);
  const [reflections, setReflections] = useState<ReflectionState>({
    sensation: '',
    compassionateAction: '',
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const logMindfulnessSession = useAppStore((state) => state.logMindfulnessSession);

  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        const response = await fetch('/content/mindfulness.json');
        if (!response.ok) {
          throw new Error('Unable to load mindfulness pack.');
        }
        const data: MindfulnessMetadata = await response.json();
        if (isMounted) {
          setMetadata(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load mindfulness pack.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || (metadata?.durationMinutes ? metadata.durationMinutes * 60 : 0));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration);
      if (!sessionLogged && metadata) {
        logMindfulnessSession({
          title: metadata.title,
          durationSeconds: Math.round(audio.duration || duration || metadata.durationMinutes * 60 || 0),
          audioUrl: metadata.audioUrl,
          hapticsEnabled,
          reflections,
        });
        setSessionLogged(true);
        toast({
          title: 'Mindfulness complete',
          description: 'Session logged in your recovery journey.',
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [duration, hapticsEnabled, logMindfulnessSession, metadata, reflections, sessionLogged, toast]);

  const transcript = useMemo(
    () => [
      'Notice your breath as an anchor—steady, present, and always available to you.',
      'Scan through the body and acknowledge each sensation without needing to change it.',
      'When an urge arises, picture it as a wave. Watch it swell, crest, and soften.',
      'Name what you are feeling: pressure, heat, buzzing, longing. Breathe spaciousness around it.',
      'Remind yourself: "This is temporary. I can ride this wave without acting on it."',
      'Offer yourself kindness for staying with the experience. You are building new pathways.',
    ],
    []
  );

  const urgeSurfingSteps = useMemo(
    () => [
      'Pause and ground through your senses. Feel your feet, soften your jaw, and notice three sounds around you.',
      'Label the urge. Describe where you feel it in your body and how it moves or changes.',
      'Breathe into the sensation for four slow counts. Imagine sending compassion to that part of you.',
      'Visualize the urge as a wave. Ride it with curiosity, reminding yourself it will pass.',
      'Check in after the swell: What do you need right now to stay aligned with your recovery?',
    ],
    []
  );

  const postSessionPrompts = useMemo(
    () => [
      'What sensations or emotions stood out most during the practice?',
      'How did the urge shift as you stayed with it?',
      'What supportive action will you take after this session?',
    ],
    []
  );

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleManualLog = () => {
    if (!metadata || sessionLogged) return;

    logMindfulnessSession({
      title: metadata.title,
      durationSeconds: Math.round(duration || metadata.durationMinutes * 60 || 0),
      audioUrl: metadata.audioUrl,
      hapticsEnabled,
      reflections,
    });
    setSessionLogged(true);
    toast({
      title: 'Mindfulness saved',
      description: 'Session marked complete with your reflections.',
    });
  };

  const handleReflectionChange = (field: keyof ReflectionState) => (value: string) => {
    setReflections((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card aria-live="polite">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading mindfulness tools
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !metadata) {
    return (
      <Card role="alert">
        <CardHeader>
          <CardTitle>Mindfulness pack unavailable</CardTitle>
          <CardDescription>{error ?? 'Please try again later.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Waves className="h-5 w-5" aria-hidden />
              {metadata.title}
            </CardTitle>
            <CardDescription>
              {metadata.overview ?? 'Ride out cravings with guided urge-surfing mindfulness.'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="uppercase tracking-wide">
            {metadata.durationMinutes} min session
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
              Mindful audio guidance
            </div>
            <Button variant="outline" size="sm" onClick={toggleMute} className="gap-2">
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4" aria-hidden />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" aria-hidden />
                  Mute
                </>
              )}
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <Button onClick={togglePlay} size="icon" variant="secondary" className="h-10 w-10">
                {isPlaying ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
                <span className="sr-only">{isPlaying ? 'Pause audio' : 'Play audio'}</span>
              </Button>
              <div className="flex-1 space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || metadata.durationMinutes * 60}
                  min={0}
                  step={0.1}
                  onValueChange={handleSeek}
                  aria-label="Mindfulness audio progress"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration || metadata.durationMinutes * 60)}</span>
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={metadata.audioUrl}
              preload="metadata"
              aria-label={`${metadata.title} audio`}
            />
          </div>
        </div>

        <Separator />

        <section aria-labelledby="urge-surfing-guidance" className="space-y-3">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-primary" aria-hidden />
            <h3 id="urge-surfing-guidance" className="font-semibold">Urge-surfing guidance</h3>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {urgeSurfingSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-semibold text-primary">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="accessibility-support" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" aria-hidden />
              Transcript & accessibility tools
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="haptics-toggle"
                  checked={hapticsEnabled}
                  onCheckedChange={setHapticsEnabled}
                  aria-describedby="haptics-hint"
                />
                <Label htmlFor="haptics-toggle" className="flex items-center gap-2 text-sm">
                  <Vibrate className="h-4 w-4" aria-hidden />
                  Haptics
                </Label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTranscript((prev) => !prev)}>
                {showTranscript ? 'Hide transcript' : 'View transcript'}
              </Button>
            </div>
          </div>
          <p id="haptics-hint" className="text-xs text-muted-foreground">
            Toggle to note whether you used device vibrations or tactile tools alongside the session.
          </p>
          {showTranscript && (
            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed" role="region" aria-live="polite">
              {transcript.map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="post-session-reflection" className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h3 id="post-session-reflection" className="font-semibold">Post-session reflection</h3>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="Noticed sensations, emotions, or insights..."
              value={reflections.sensation}
              onChange={(event) => handleReflectionChange('sensation')(event.target.value)}
              aria-label={postSessionPrompts[0]}
            />
            <Textarea
              placeholder="Supportive action I'll take next..."
              value={reflections.compassionateAction}
              onChange={(event) => handleReflectionChange('compassionateAction')(event.target.value)}
              aria-label={postSessionPrompts[2]}
            />
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Reflection prompts</p>
              <ul className="mt-2 space-y-2">
                {postSessionPrompts.map((prompt, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
            {sessionLogged ? 'Session logged in your recovery record.' : 'Mark complete once you finish the practice.'}
          </div>
          <Button onClick={handleManualLog} disabled={sessionLogged} className="gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {sessionLogged ? 'Logged' : 'Mark session complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
