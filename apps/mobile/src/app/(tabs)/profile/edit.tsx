/**
 * Profile Edit Screen
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useProfile, useUpdateProfile } from "../../../hooks/useProfile";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/Card";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/supabase";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [handle, setHandle] = useState("");
  const [cleanDate, setCleanDate] = useState("");
  const [program, setProgram] = useState<"NA" | "AA" | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setHandle(profile.handle || "");
      setCleanDate(profile.clean_date ? new Date(profile.clean_date).toISOString().split("T")[0] : "");
      setProgram(profile.program);
      setAvatarUri(profile.avatar_url);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setAvatarUri(imageUri);

      // Upload to Supabase Storage
      setUploading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Not authenticated");
        }

        // Convert image to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Generate unique filename
        const fileExt = imageUri.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          setAvatarUri(urlData.publicUrl);
        }
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        Alert.alert("Error", "Failed to upload avatar. Please try again.");
        setAvatarUri(profile?.avatar_url || null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        handle: handle.trim() || undefined,
        cleanDate: cleanDate ? new Date(cleanDate) : undefined,
        program: program || null,
        avatarUrl: avatarUri || undefined,
      });
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar */}
        <Card style={styles.avatarCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {handle.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <Text style={styles.avatarHint}>
              {uploading ? "Uploading..." : "Tap to change photo"}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Handle */}
        <Input
          label="Handle"
          value={handle}
          onChangeText={setHandle}
          placeholder="Your handle (optional)"
          maxLength={30}
        />

        {/* Program */}
        <View style={styles.section}>
          <Text style={styles.label}>Program</Text>
          <View style={styles.programSelector}>
            <TouchableOpacity
              style={[
                styles.programButton,
                program === "NA" && styles.programButtonActive,
              ]}
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
              style={[
                styles.programButton,
                program === "AA" && styles.programButtonActive,
              ]}
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
        </View>

        {/* Clean Date */}
        <Input
          label="Clean Date"
          value={cleanDate}
          onChangeText={setCleanDate}
          placeholder="YYYY-MM-DD"
        />

        {/* Save Button */}
        <View style={styles.actions}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            disabled={updateMutation.isPending}
            loading={updateMutation.isPending}
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
  avatarCard: {
    alignItems: "center",
    marginBottom: 24,
    padding: 24,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarHint: {
    fontSize: 14,
    color: "#8E8E93",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  programSelector: {
    flexDirection: "row",
    gap: 12,
  },
  programButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
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
  actions: {
    marginTop: 24,
    marginBottom: 24,
  },
});

