/**
 * Sync Status Screen
 *
 * Shows offline sync status, queued mutations, and conflict resolution
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useOfflineSync } from "../../../hooks/useOfflineSync";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react-native";

export default function SyncStatusScreen() {
  const { isOnline, isOffline, queuedMutations, sync, canSync } = useOfflineSync();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync();
      Alert.alert("Success", "Sync completed successfully");
    } catch (error) {
      Alert.alert(
        "Sync Error",
        error instanceof Error ? error.message : "Failed to sync"
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Connection Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            {isOnline ? (
              <>
                <Wifi size={24} color="#34C759" />
                <View style={styles.statusContent}>
                  <Text style={styles.statusTitle}>Online</Text>
                  <Text style={styles.statusText}>
                    All changes are syncing automatically
                  </Text>
                </View>
              </>
            ) : (
              <>
                <WifiOff size={24} color="#FF9500" />
                <View style={styles.statusContent}>
                  <Text style={styles.statusTitle}>Offline</Text>
                  <Text style={styles.statusText}>
                    Changes are being saved locally
                  </Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Queued Mutations */}
        {queuedMutations.length > 0 && (
          <Card style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>
                Queued Changes ({queuedMutations.length})
              </Text>
              {canSync && (
                <Button
                  title="Sync Now"
                  onPress={handleSync}
                  loading={syncing}
                  size="small"
                  style={styles.syncButton}
                />
              )}
            </View>
            <ScrollView style={styles.queueList}>
              {queuedMutations.map((mutation: any, index: number) => (
                <View key={index} style={styles.queueItem}>
                  <View style={styles.queueItemContent}>
                    <Text style={styles.queueItemType}>
                      {mutation.type || "Update"}
                    </Text>
                    <Text style={styles.queueItemTime}>
                      {mutation.timestamp
                        ? new Date(mutation.timestamp).toLocaleString()
                        : "Pending"}
                    </Text>
                  </View>
                  {mutation.error && (
                    <View style={styles.errorBadge}>
                      <AlertCircle size={16} color="#FF3B30" />
                      <Text style={styles.errorText}>Failed</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Sync Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Sync Works</Text>
          <Text style={styles.infoText}>
            • Changes are saved locally first for offline access
          </Text>
          <Text style={styles.infoText}>
            • When online, changes sync automatically to the cloud
          </Text>
          <Text style={styles.infoText}>
            • You can manually sync queued changes anytime
          </Text>
          <Text style={styles.infoText}>
            • Conflicts are resolved automatically (server wins)
          </Text>
        </Card>

        {/* Manual Sync */}
        <View style={styles.actions}>
          <Button
            title="Manual Sync"
            onPress={handleSync}
            disabled={!canSync || syncing}
            loading={syncing}
            fullWidth
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
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  statusText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  queueCard: {
    marginBottom: 16,
    maxHeight: 300,
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  syncButton: {
    marginLeft: "auto",
  },
  queueList: {
    maxHeight: 200,
  },
  queueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  queueItemContent: {
    flex: 1,
  },
  queueItemType: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  queueItemTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  errorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFEBEE",
    borderRadius: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "600",
  },
  infoCard: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  infoText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    lineHeight: 20,
  },
  actions: {
    marginBottom: 24,
  },
});

