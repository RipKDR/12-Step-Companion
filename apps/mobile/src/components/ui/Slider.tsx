/**
 * Slider Component
 *
 * Range input slider for numeric values
 * Simple implementation using TouchableOpacity
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  PanResponder,
  Animated,
} from "react-native";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
}

export function SliderComponent({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  label,
  showValue = true,
  disabled = false,
}: SliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const trackWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    Animated.timing(trackWidth, {
      toValue: percentage,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePress = (event: any) => {
    if (disabled) return;
    const { locationX } = event.nativeEvent;
    const containerWidth = 300; // Approximate width
    const percentage = Math.max(0, Math.min(100, (locationX / containerWidth) * 100));
    const newValue = Math.round(
      minimumValue + (percentage / 100) * (maximumValue - minimumValue)
    );
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange(Math.max(minimumValue, Math.min(maximumValue, steppedValue)));
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            {label}
          </Text>
          {showValue && (
            <Text style={[styles.value, isDark && styles.valueDark]}>
              {value}
            </Text>
          )}
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.track,
          isDark && styles.trackDark,
          disabled && styles.trackDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: trackWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: isDark ? "#0A84FF" : "#007AFF",
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`,
              backgroundColor: isDark ? "#0A84FF" : "#007AFF",
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

// Export as Slider for compatibility
export const Slider = SliderComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  labelDark: {
    color: "#fff",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  valueDark: {
    color: "#0A84FF",
  },
  track: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    position: "relative",
    width: "100%",
  },
  trackDark: {
    backgroundColor: "#38383A",
  },
  trackDisabled: {
    opacity: 0.5,
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    position: "absolute",
    top: -8,
    marginLeft: -10,
  },
});
