/**
 * Data Export Screen
 */

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/ui/Button";
import { useDataExport } from "../../../hooks/useDataExport";

export default function DataExportScreen() {
  const { exportData, deleteAllData, exporting, deleting } = useDataExport();

  const handleExport = async () => {
    try {
      const jsonString = await exportData();
      await Share.share({
        message: jsonString,
        title: "Recovery Data Export",
      });
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to export data");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "Are you absolutely sure? This will delete everything including your step work, journal entries, and all other data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Everything",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAllData();
                      Alert.alert("Success", "All data has been deleted");
                    } catch (error) {
                      Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete data");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Export Your Data</Text>
          <Text style={styles.sectionDesc}>
            Download a copy of all your recovery data in JSON format. This includes your step work, journal entries, action plans, routines, and settings.
          </Text>
          <Button
            title="Export Data"
            onPress={handleExport}
            loading={exporting}
            disabled={exporting}
            fullWidth
            style={styles.actionButton}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delete All Data</Text>
          <Text style={styles.sectionDesc}>
            Permanently delete all your data from our servers. This action cannot be undone. Your local data will also be deleted.
          </Text>
          <Button
            title="Delete All Data"
            onPress={handleDelete}
            variant="danger"
            loading={deleting}
            disabled={deleting}
            fullWidth
            style={styles.actionButton}
          />
        </Card>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Data deletion is permanent and cannot be recovered. Make sure you have exported your data before deleting.
          </Text>
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
  },
  warning: {
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFC107",
    marginTop: 24,
  },
  warningText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
});

