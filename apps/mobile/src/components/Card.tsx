/**
 * Card Component for React Native
 * Premium card with animations and platform-specific polish
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Pressable,
  Platform,
  useColorScheme,
} from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "interactive";
  onPress?: () => void;
}

export function Card({
  children,
  style,
  variant = "default",
  onPress,
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const cardVariantStyles = {
    default: isDark ? styles.cardDark : styles.card,
    elevated: isDark ? styles.cardElevatedDark : styles.cardElevated,
    interactive: isDark ? styles.cardInteractiveDark : styles.cardInteractive,
  };

  const content = (
    <Animated.View
      style={[
        cardVariantStyles[variant],
        {
          opacity: fadeAnim,
          transform: [
            { scale: onPress ? pressAnim : scaleAnim },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  // Light mode styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardElevated: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardInteractive: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 123, 255, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  // Dark mode styles
  cardDark: {
    backgroundColor: "rgba(28, 28, 30, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardElevatedDark: {
    backgroundColor: "rgba(28, 28, 30, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardInteractiveDark: {
    backgroundColor: "rgba(28, 28, 30, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#0A84FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

