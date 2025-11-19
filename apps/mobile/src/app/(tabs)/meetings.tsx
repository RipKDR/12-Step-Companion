/**
 * Meetings Tab - Mobile App
 * 
 * Meeting finder using tRPC and BMLT
 */

import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocation } from "../../hooks/useLocation";
import { useMeetingSearch } from "../../hooks/useMeetings";
import * as Location from "expo-location";

export default function MeetingsScreen() {
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Program Selector */}
        <View style={styles.programSelector}>
          <TouchableOpacity
            style={[styles.programButton, program === "NA" && styles.programButtonActive]}
            onPress={() => setProgram("NA")}
          >
            <Text style={styles.programButtonText}>NA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.programButton, program === "AA" && styles.programButtonActive]}
            onPress={() => setProgram("AA")}
          >
            <Text style={styles.programButtonText}>AA</Text>
          </TouchableOpacity>
        </View>

        {/* Meetings List */}
        {meetings.length > 0 ? (
          meetings.map((meeting: any, index: number) => (
            <View key={index} style={styles.meetingCard}>
              <Text style={styles.meetingName}>{meeting.meeting_name || "Meeting"}</Text>
              {meeting.location_text && (
                <Text style={styles.meetingLocation}>{meeting.location_text}</Text>
              )}
              {meeting.start_time && (
                <Text style={styles.meetingTime}>{meeting.start_time}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No meetings found nearby</Text>
        )}
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
    marginBottom: 20,
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
  meetingCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    fontStyle: "italic",
    marginTop: 40,
  },
});

