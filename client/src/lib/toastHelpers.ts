import { toast } from '@/hooks/use-toast';

/**
 * Toast notification helpers for consistent user feedback
 */

export const showSaveSuccess = (item: string) => {
  toast({
    title: 'Saved',
    description: `${item} saved successfully`,
    duration: 2000,
  });
};

export const showStreakUpdate = (type: string, days: number) => {
  toast({
    title: `🔥 ${days} day streak!`,
    description: `Keep up your ${type} streak`,
    duration: 3000,
  });
};

export const showError = (message: string) => {
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
    duration: 4000,
  });
};

export const showJournalSaved = () => {
  showSaveSuccess('Journal entry');
};

export const showStepAnswerSaved = () => {
  showSaveSuccess('Step answer');
};

export const showMeetingLogged = () => {
  showSaveSuccess('Meeting');
};

export const showChallengeCompleted = () => {
  toast({
    title: 'Challenge completed! 🎉',
    description: 'Great job completing today\'s challenge',
    duration: 3000,
  });
};

export const showDataExported = () => {
  toast({
    title: 'Data exported',
    description: 'Your data has been downloaded',
    duration: 2000,
  });
};

export const showDataImported = () => {
  toast({
    title: 'Data imported',
    description: 'Your data has been imported successfully',
    duration: 2000,
  });
};

/**
 * Trigger haptic feedback for mobile devices
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[type]);
  }
};

