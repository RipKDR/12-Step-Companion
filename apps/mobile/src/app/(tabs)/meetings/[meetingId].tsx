/**
 * Meeting Detail Screen
 *
 * Shows full meeting information with directions and calendar export
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "../../../lib/trpc";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { MapPin, Clock, Calendar, Phone, ExternalLink } from "lucide-react-native";
import { format, parseISO, addHours, isToday } from "date-fns";
import { useMeetingAttendance } from "../../../hooks/useMeetingAttendance";
import { calculateDistance, formatDistance } from "../../../utils/distance";
import { useLocation } from "../../../hooks/useLocation";

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { location } = useLocation();
  // Use hook pattern to avoid type inference issues
  const { data: meeting, isLoading } = (trpc as any).meetings.getById.useQuery(
    { id: meetingId || "" },
    { enabled: !!meetingId }
  ) as { data: any; isLoading: boolean };
  const { markAttendance, getAttendance } = useMeetingAttendance();
  const today = format(new Date(), "yyyy-MM-dd");
  const [attended, setAttended] = useState(false);

  useEffect(() => {
    if (meetingId) {
      setAttended(getAttendance(meetingId, today));
    }
  }, [meetingId, today]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Meeting not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  const handleDirections = () => {
    const lat = (meeting as any).latitude;
    const lng = (meeting as any).longitude;
    if (lat && lng) {
      const url = `https://maps.apple.com/?daddr=${lat},${lng}`;
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open maps app");
      });
    } else {
      Alert.alert("Error", "Location information not available");
    }
  };

  const handleCalendarExport = () => {
    const startTime = (meeting as any).start_time;
    if (!startTime) {
      Alert.alert("Error", "Meeting time not available");
      return;
    }

    // Create calendar URL (works on iOS/Android)
    const meetingName = encodeURIComponent((meeting as any).meeting_name || "Meeting");
    const location = encodeURIComponent((meeting as any).location_text || "");
    const [hours, minutes] = startTime.split(":").map(Number);
    const eventDate = new Date();
    eventDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, set for tomorrow
    if (eventDate < new Date()) {
      eventDate.setDate(eventDate.getDate() + 1);
    }

    const endDate = new Date(eventDate);
    endDate.setHours(hours + 1, minutes, 0, 0);

    // Format dates for calendar URL
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${meetingName}&dates=${formatDate(eventDate)}/${formatDate(endDate)}&details=12-Step Meeting&location=${location}`;

    Linking.openURL(calendarUrl).catch(() => {
      Alert.alert("Info", "Please install expo-file-system and expo-sharing for native calendar export");
    });
  };

  const handleAttendance = async () => {
    const newStatus = !attended;
    setAttended(newStatus);
    if (meetingId) {
      await markAttendance(meetingId, today, newStatus);
      Alert.alert("Success", `Marked as ${newStatus ? "attended" : "not attended"}`);
    }
  };

  const getNextOccurrence = () => {
    const startTime = (meeting as any).start_time;
    if (!startTime) return "Time TBD";

    // Try to parse the time and show next occurrence
    try {
      const [hours, minutes] = startTime.split(":").map(Number);
      const now = new Date();
      const meetingTime = new Date();
      meetingTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, show tomorrow
      if (meetingTime < now) {
        meetingTime.setDate(meetingTime.getDate() + 1);
      }

      if (isToday(meetingTime)) {
        return `Today at ${startTime}`;
      } else {
        return `${format(meetingTime, "EEE")} at ${startTime}`;
      }
    } catch {
      return `Daily at ${startTime}`;
    }
  };

  const getDistance = () => {
    if (!location || !meeting) return "Distance unknown";
    const meetingLat = (meeting as any).latitude;
    const meetingLng = (meeting as any).longitude;
    if (!meetingLat || !meetingLng) return "Distance unknown";

    const distance = calculateDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: meetingLat, longitude: meetingLng }
    );
    return formatDistance(distance);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.headerCard}>
          <Text style={styles.meetingName}>
            {(meeting as any).meeting_name || "Meeting"}
          </Text>
          {(meeting as any).format_shared_id_list && (
            <View style={styles.formatBadges}>
              {String((meeting as any).format_shared_id_list)
                .split(",")
                .slice(0, 3)
                .map((format: string, index: number) => (
                  <Badge key={index} label={format.trim()} variant="info" size="small" />
                ))}
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionRow}>
            <Clock size={20} color="#007AFF" />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Time</Text>
              <Text style={styles.sectionValue}>
                {(meeting as any).start_time || "TBD"}
              </Text>
              <Text style={styles.sectionSubtext}>{getNextOccurrence()}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionRow}>
            <MapPin size={20} color="#007AFF" />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Location</Text>
              <Text style={styles.sectionValue}>
                {(meeting as any).location_text || "Location TBD"}
              </Text>
              {(meeting as any).location_street && (
                <Text style={styles.sectionSubtext}>
                  {(meeting as any).location_street}
                </Text>
              )}
              {(meeting as any).location_city_subsection && (
                <Text style={styles.sectionSubtext}>
                  {(meeting as any).location_city_subsection}
                </Text>
              )}
              <Text style={styles.distanceText}>{getDistance()} away</Text>
            </View>
          </View>
        </Card>

        {(meeting as any).location_info && (
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Additional Info</Text>
            <Text style={styles.sectionText}>{(meeting as any).location_info}</Text>
          </Card>
        )}

        {(meeting as any).comments && (
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Comments</Text>
            <Text style={styles.sectionText}>{(meeting as any).comments}</Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Get Directions"
            onPress={handleDirections}
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Add to Calendar"
            onPress={handleCalendarExport}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title={attended ? "Mark as Not Attended" : "Mark as Attended"}
            onPress={handleAttendance}
            variant={attended ? "secondary" : "primary"}
            fullWidth
            style={styles.actionButton}
          />
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
  headerCard: {
    marginBottom: 16,
  },
  meetingName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  formatBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    gap: 12,
  },
  sectionContent: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
  distanceText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 0,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
});

