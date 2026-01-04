/**
 * Button Component
 *
 * Accessible, customizable button with loading states
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: isDark ? styles.primaryDark : styles.primary,
    secondary: isDark ? styles.secondaryDark : styles.secondary,
    outline: isDark ? styles.outlineDark : styles.outline,
    danger: isDark ? styles.dangerDark : styles.danger,
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? (isDark ? "#fff" : "#007AFF") : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.outlineText,
            sizeStyles[size],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // WCAG minimum touch target
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineText: {
    color: "#007AFF",
  },
  // Primary variant
  primary: {
    backgroundColor: "#007AFF",
  },
  primaryDark: {
    backgroundColor: "#0A84FF",
  },
  // Secondary variant
  secondary: {
    backgroundColor: "#34C759",
  },
  secondaryDark: {
    backgroundColor: "#30D158",
  },
  // Outline variant
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  outlineDark: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0A84FF",
  },
  // Danger variant
  danger: {
    backgroundColor: "#FF3B30",
  },
  dangerDark: {
    backgroundColor: "#FF453A",
  },
});

