/**
 * Create Action Plan Screen
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCreateActionPlan } from "../../../hooks/useActionPlans";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { X, Plus } from "lucide-react-native";

interface IfThenRule {
  if: string;
  then: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
}

export default function CreateActionPlanScreen() {
  const router = useRouter();
  const createMutation = useCreateActionPlan();

  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [ifThenRules, setIfThenRules] = useState<IfThenRule[]>([{ if: "", then: "" }]);
  const [checklist, setChecklist] = useState<string[]>([""]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: "", phone: "" },
  ]);
  const [isShared, setIsShared] = useState(false);

  const addIfThenRule = () => {
    setIfThenRules([...ifThenRules, { if: "", then: "" }]);
  };

  const removeIfThenRule = (index: number) => {
    setIfThenRules(ifThenRules.filter((_, i) => i !== index));
  };

  const updateIfThenRule = (index: number, field: "if" | "then", value: string) => {
    const updated = [...ifThenRules];
    updated[index] = { ...updated[index], [field]: value };
    setIfThenRules(updated);
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, ""]);
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updated = [...checklist];
    updated[index] = value;
    setChecklist(updated);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "" }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (
    index: number,
    field: "name" | "phone",
    value: string
  ) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        situation: situation.trim() || undefined,
        ifThen: ifThenRules.filter((r) => r.if.trim() && r.then.trim()),
        checklist: checklist.filter((item) => item.trim()),
        emergencyContacts: emergencyContacts.filter(
          (c) => c.name.trim() && c.phone.trim()
        ),
        isSharedWithSponsor: isShared,
      });
      Alert.alert("Success", "Action plan created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create action plan"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., When I feel triggered"
        />

        <View style={styles.section}>
          <Text style={styles.label}>Situation Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the situation this plan is for..."
            value={situation}
            onChangeText={setSituation}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* If-Then Rules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>If-Then Rules</Text>
            <TouchableOpacity onPress={addIfThenRule} style={styles.addButton}>
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {ifThenRules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleLabel}>Rule {index + 1}</Text>
                {ifThenRules.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeIfThenRule(index)}
                    style={styles.removeButton}
                  >
                    <X size={16} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <Input
                placeholder="If..."
                value={rule.if}
                onChangeText={(value) => updateIfThenRule(index, "if", value)}
              />
              <Input
                placeholder="Then..."
                value={rule.then}
                onChangeText={(value) => updateIfThenRule(index, "then", value)}
              />
            </View>
          ))}
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Checklist</Text>
            <TouchableOpacity onPress={addChecklistItem} style={styles.addButton}>
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {checklist.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <TextInput
                style={styles.checklistInput}
                placeholder={`Item ${index + 1}`}
                value={item}
                onChangeText={(value) => updateChecklistItem(index, value)}
              />
              {checklist.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeChecklistItem(index)}
                  style={styles.removeButton}
                >
                  <X size={16} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Emergency Contacts</Text>
            <TouchableOpacity
              onPress={addEmergencyContact}
              style={styles.addButton}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactLabel}>Contact {index + 1}</Text>
                {emergencyContacts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEmergencyContact(index)}
                    style={styles.removeButton}
                  >
                    <X size={16} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <Input
                placeholder="Name"
                value={contact.name}
                onChangeText={(value) => updateEmergencyContact(index, "name", value)}
              />
              <Input
                placeholder="Phone"
                value={contact.phone}
                onChangeText={(value) => updateEmergencyContact(index, "phone", value)}
                keyboardType="phone-pad"
              />
            </View>
          ))}
        </View>

        {/* Share Toggle */}
        <View style={styles.shareSection}>
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share with sponsor</Text>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.actions}>
          <Button
            title="Create Action Plan"
            onPress={handleSave}
            disabled={createMutation.isPending}
            loading={createMutation.isPending}
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
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginTop: 8,
  },
  addButton: {
    padding: 4,
  },
  ruleItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  ruleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  removeButton: {
    padding: 4,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checklistInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  contactItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  shareSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  actions: {
    marginBottom: 24,
  },
});

