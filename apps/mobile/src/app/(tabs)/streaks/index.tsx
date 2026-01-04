/**
 * Streaks & Achievements Screen
 *
 * Displays all streaks and achievements
 */

import { View, Text, ScrollView, StyleSheet } from "react-native";
import { StreakCard } from "../../../components/StreakCard";
import { AchievementBadge } from "../../../components/AchievementBadge";
import { useStreaks } from "../../../hooks/useStreaks";
import { useAchievements } from "../../../hooks/useAchievements";
import { Card } from "../../../components/Card";
import { Trophy } from "lucide-react-native";

export default function StreaksScreen() {
  const streaks = useStreaks();
  const { achievements, unlockedCount, totalCount, progress } = useAchievements();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Overview */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Trophy size={32} color="#FFD700" />
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>Achievements</Text>
              <Text style={styles.overviewSubtitle}>
                {unlockedCount} of {totalCount} unlocked
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </Card>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Streaks</Text>
          <StreakCard
            type="journaling"
            current={streaks.journaling.current}
            longest={streaks.journaling.longest}
            label="Journaling"
          />
          <StreakCard
            type="stepWork"
            current={streaks.stepWork.current}
            longest={streaks.stepWork.longest}
            label="Step Work"
          />
          <StreakCard
            type="routines"
            current={streaks.routines.current}
            longest={streaks.routines.longest}
            label="Routines"
          />
          <StreakCard
            type="meetings"
            current={streaks.meetings.current}
            longest={streaks.meetings.longest}
            label="Meetings"
          />
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  overviewCard: {
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  overviewSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
});

