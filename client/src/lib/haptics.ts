export const haptics = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 100, 30, 100, 30]);
    }
  },

  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
};
