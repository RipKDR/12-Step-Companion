/**
 * Meetings Map View
 *
 * Shows meetings on a map (placeholder - requires react-native-maps)
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocation } from "../../../hooks/useLocation";
import { useMeetingSearch } from "../../../hooks/useMeetings";
import { Card } from "../../../components/Card";
import { MapPin } from "lucide-react-native";

export default function MeetingsMapScreen() {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const [program, setProgram] = useState<"NA" | "AA">("NA");

  const { meetings, isLoading: meetingsLoading } = useMeetingSearch({
    lat: location?.latitude || 0,
    lng: location?.longitude || 0,
    radius: 25,
    program,
  });

  if (locationLoading || meetingsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Location permission required to show map
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Placeholder for map - would use react-native-maps in production */}
      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color="#8E8E93" />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} found
        </Text>
        <Text style={styles.mapPlaceholderNote}>
          Map integration requires react-native-maps package
        </Text>
      </View>

      {/* Meetings List */}
      <View style={styles.meetingsList}>
        {meetings.slice(0, 5).map((meeting: any, index: number) => {
          const meetingId = meeting.id_bigint || meeting.id || index.toString();
          return (
            <Card
              key={meetingId}
              variant="interactive"
              onPress={() => router.push(`/(tabs)/meetings/${meetingId}`)}
              style={styles.meetingCard}
            >
              <Text style={styles.meetingName}>
                {meeting.meeting_name || "Meeting"}
              </Text>
              {meeting.location_text && (
                <Text style={styles.meetingLocation} numberOfLines={1}>
                  {meeting.location_text}
                </Text>
              )}
              {meeting.start_time && (
                <Text style={styles.meetingTime}>{meeting.start_time}</Text>
              )}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    margin: 16,
    borderRadius: 8,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    color: "#000",
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
  mapPlaceholderNote: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 32,
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
  meetingsList: {
    maxHeight: 300,
    padding: 16,
  },
  meetingCard: {
    marginBottom: 8,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  meetingLocation: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    color: "#007AFF",
  },
});

