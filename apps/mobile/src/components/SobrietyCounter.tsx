/**
 * Sobriety Counter Component for React Native
 */

import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";

interface SobrietyCounterProps {
  cleanDate: Date;
  timezone?: string;
}

export function SobrietyCounter({ cleanDate, timezone = "UTC" }: SobrietyCounterProps) {
  const { days, hours, minutes, seconds } = useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - cleanDate.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }, [cleanDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clean Time</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{days}</Text>
          <Text style={styles.timeLabel}>Days</Text>
        </View>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{hours}</Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{minutes}</Text>
          <Text style={styles.timeLabel}>Minutes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 20,
  },
  timeUnit: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  timeLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
});

