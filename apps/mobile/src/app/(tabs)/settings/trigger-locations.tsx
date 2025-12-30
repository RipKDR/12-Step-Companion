/**
 * Trigger Locations Screen
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Plus, MapPin } from "lucide-react-native";
import * as Location from "expo-location";

export default function TriggerLocationsScreen() {
  const router = useRouter();
  const [geofencingEnabled, setGeofencingEnabled] = useState(false);
  const [locations, setLocations] = useState<any[]>([]); // TODO: Use actual hook

  const handleRequestPermission = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted") {
      setGeofencingEnabled(true);
      Alert.alert("Success", "Background location permission granted");
    } else {
      Alert.alert(
        "Permission Required",
        "Background location permission is required for geofenced triggers"
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Geofencing</Text>
                <Text style={styles.switchHint}>
                  Enable location-based triggers for your action plans
                </Text>
              </View>
              <Switch
                value={geofencingEnabled}
                onValueChange={(value) => {
                  if (value) {
                    handleRequestPermission();
                  } else {
                    setGeofencingEnabled(false);
                  }
                }}
                trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          {geofencingEnabled && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trigger Locations</Text>
                {locations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      No trigger locations set up yet
                    </Text>
                    <Text style={styles.emptyHint}>
                      Add locations where you want to trigger action plans
                    </Text>
                  </View>
                ) : (
                  locations.map((location) => (
                    <Card key={location.id} style={styles.locationCard}>
                      <View style={styles.locationHeader}>
                        <MapPin size={20} color="#007AFF" />
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationName}>{location.label}</Text>
                          <Text style={styles.locationDetails}>
                            Radius: {location.radius_m}m
                          </Text>
                        </View>
                        {location.active && (
                          <Badge label="Active" variant="success" size="small" />
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          // TODO: Navigate to edit
                        }}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </Card>
                  ))
                )}
              </View>
            </>
          )}

          {!geofencingEnabled && (
            <Card style={styles.infoCard}>
              <Text style={styles.infoText}>
                Enable geofencing to set up trigger locations. When you enter or exit a location, your action plan will automatically open.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
      {geofencingEnabled && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // TODO: Navigate to add location
            Alert.alert("Info", "Add location screen coming soon");
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  switchHint: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  emptyHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  locationCard: {
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  locationDetails: {
    fontSize: 14,
    color: "#8E8E93",
  },
  editButton: {
    marginTop: 8,
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  infoCard: {
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

