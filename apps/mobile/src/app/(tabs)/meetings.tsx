/**
 * Meetings Tab - Mobile App
 *
 * Meeting finder using tRPC and BMLT
 */

import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useLocation } from "../../hooks/useLocation";
import { useMeetingSearch } from "../../hooks/useMeetings";
import { Card } from "../../components/Card";
import { Badge } from "../../components/ui/Badge";
import { MapPin, Clock, Filter } from "lucide-react-native";
import { format, parse, isToday, addDays } from "date-fns";
import { calculateDistance, formatDistance } from "../../utils/distance";

export default function MeetingsScreen() {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const [program, setProgram] = useState<"NA" | "AA">("NA");
  const [radius, setRadius] = useState(25);
  const [showStartingSoon, setShowStartingSoon] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { meetings, isLoading: meetingsLoading } = useMeetingSearch({
    lat: location?.latitude || 0,
    lng: location?.longitude || 0,
    radius,
    program,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh handled by TanStack Query
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredMeetings = showStartingSoon
    ? meetings.filter((m: any) => {
        // Filter meetings starting in next 60 minutes
        if (!m.start_time) return false;
        try {
          const meetingTime = parse(m.start_time, "HH:mm", new Date());
          const now = new Date();
          const meetingDateTime = new Date();
          meetingDateTime.setHours(meetingTime.getHours(), meetingTime.getMinutes());

          const diffMinutes = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60);
          return diffMinutes >= 0 && diffMinutes <= 60;
        } catch {
          return false;
        }
      })
    : meetings;

  const getMeetingTime = (meeting: any) => {
    if (!meeting.start_time) return "Time TBD";
    return meeting.start_time;
  };

  const isStartingSoon = (meeting: any) => {
    if (!meeting.start_time) return false;
    try {
      const meetingTime = parse(meeting.start_time, "HH:mm", new Date());
      const now = new Date();
      const meetingDateTime = new Date();
      meetingDateTime.setHours(meetingTime.getHours(), meetingTime.getMinutes());

      const diffMinutes = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60);
      return diffMinutes >= 0 && diffMinutes <= 60;
    } catch {
      return false;
    }
  };

  if (locationLoading || meetingsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Finding meetings...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Location permission required to find meetings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Program Selector */}
          <View style={styles.programSelector}>
            <TouchableOpacity
              style={[styles.programButton, program === "NA" && styles.programButtonActive]}
              onPress={() => setProgram("NA")}
            >
              <Text
                style={[
                  styles.programButtonText,
                  program === "NA" && styles.programButtonTextActive,
                ]}
              >
                NA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.programButton, program === "AA" && styles.programButtonActive]}
              onPress={() => setProgram("AA")}
            >
              <Text
                style={[
                  styles.programButtonText,
                  program === "AA" && styles.programButtonTextActive,
                ]}
              >
                AA
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.filters}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showStartingSoon && styles.filterButtonActive,
              ]}
              onPress={() => setShowStartingSoon(!showStartingSoon)}
            >
              <Filter size={16} color={showStartingSoon ? "#fff" : "#007AFF"} />
              <Text
                style={[
                  styles.filterButtonText,
                  showStartingSoon && styles.filterButtonTextActive,
                ]}
              >
                Starting ≤60m
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => router.push("/(tabs)/meetings/map")}
            >
              <MapPin size={16} color="#007AFF" />
              <Text style={styles.mapButtonText}>Map</Text>
            </TouchableOpacity>
          </View>

          {/* Meetings List */}
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting: any, index: number) => {
              const meetingId = meeting.id_bigint || meeting.id || index.toString();
              return (
                <Card
                  key={meetingId}
                  variant="interactive"
                  onPress={() => router.push(`/(tabs)/meetings/${meetingId}`)}
                  style={styles.meetingCard}
                >
                  <View style={styles.meetingHeader}>
                    <Text style={styles.meetingName}>
                      {meeting.meeting_name || "Meeting"}
                    </Text>
                    {isStartingSoon(meeting) && (
                      <Badge label="Starting Soon" variant="success" size="small" />
                    )}
                  </View>
                  <View style={styles.meetingInfo}>
                    <View style={styles.meetingInfoRow}>
                      <Clock size={16} color="#8E8E93" />
                      <Text style={styles.meetingTime}>
                        {getMeetingTime(meeting)}
                      </Text>
                    </View>
                    {meeting.location_text && (
                      <View style={styles.meetingInfoRow}>
                        <MapPin size={16} color="#8E8E93" />
                        <Text style={styles.meetingLocation} numberOfLines={1}>
                          {meeting.location_text}
                        </Text>
                      </View>
                    )}
                  </View>
                  {location && meeting.latitude && meeting.longitude && (
                    <Text style={styles.distanceText}>
                      {formatDistance(
                        calculateDistance(
                          { latitude: location.latitude, longitude: location.longitude },
                          { latitude: meeting.latitude, longitude: meeting.longitude }
                        )
                      )} away
                    </Text>
                  )}
                </Card>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {showStartingSoon
                  ? "No meetings starting in the next hour"
                  : "No meetings found nearby"}
              </Text>
              {showStartingSoon && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => setShowStartingSoon(false)}
                >
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
    color: "#8E8E93",
  },
  errorText: {
    textAlign: "center",
    color: "#FF3B30",
    padding: 20,
  },
  programSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  programButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  programButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  programButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  programButtonTextActive: {
    color: "#fff",
  },
  filters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  meetingCard: {
    marginBottom: 12,
  },
  meetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: "#000",
  },
  meetingInfo: {
    gap: 8,
    marginBottom: 8,
  },
  meetingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meetingLocation: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
  },
  meetingTime: {
    fontSize: 14,
    color: "#8E8E93",
  },
  distanceText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    fontStyle: "italic",
    marginBottom: 16,
  },
  clearFilterButton: {
    padding: 8,
  },
  clearFilterText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});

