/**
 * Badge Component
 *
 * Small status indicator badge
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "small" | "medium";
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = "default",
  size = "medium",
  style,
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const variantStyles = {
    default: isDark ? styles.defaultDark : styles.default,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    info: isDark ? styles.infoDark : styles.info,
  };

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  };

  return (
    <View
      style={[
        styles.badge,
        variantStyles[variant],
        sizeStyles[size],
        style,
      ]}
    >
      <Text style={[styles.text, sizeStyles[size]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
    color: "#fff",
  },
  default: {
    backgroundColor: "#8E8E93",
  },
  defaultDark: {
    backgroundColor: "#636366",
  },
  success: {
    backgroundColor: "#34C759",
  },
  warning: {
    backgroundColor: "#FF9500",
  },
  danger: {
    backgroundColor: "#FF3B30",
  },
  info: {
    backgroundColor: "#007AFF",
  },
  infoDark: {
    backgroundColor: "#0A84FF",
  },
});

