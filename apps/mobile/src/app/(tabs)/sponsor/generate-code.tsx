/**
 * Generate Sponsor Code Screen
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGenerateSponsorCode } from "../../../hooks/useSponsor";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/Card";
import { Copy, Share2 } from "lucide-react-native";
import { Clipboard } from "@react-native-clipboard/clipboard";

export default function GenerateCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; expiresAt?: string }>();
  const generateMutation = useGenerateSponsorCode();

  const [code, setCode] = useState(params.code || "");
  const [expiresAt, setExpiresAt] = useState(params.expiresAt ? new Date(params.expiresAt) : null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync();
      setCode(result.code);
      setExpiresAt(new Date(result.expiresAt));
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to generate code"
      );
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setString(code);
      Alert.alert("Copied", "Code copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My sponsor code: ${code}\n\nThis code expires in 24 hours.`,
      });
    } catch (error) {
      // User cancelled
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {code ? (
          <>
            <Card style={styles.codeCard}>
              <Text style={styles.codeLabel}>Your Sponsor Code</Text>
              <Text style={styles.code}>{code}</Text>
              {expiresAt && (
                <Text style={styles.expiresText}>
                  Expires in: {timeRemaining}
                </Text>
              )}
            </Card>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to share:</Text>
              <Text style={styles.instructionsText}>
                1. Share this code with someone who wants you as their sponsor
              </Text>
              <Text style={styles.instructionsText}>
                2. They enter the code in their app
              </Text>
              <Text style={styles.instructionsText}>
                3. You'll receive a request to accept
              </Text>
            </View>

            <View style={styles.actions}>
              <Button
                title="Copy Code"
                onPress={handleCopy}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              <Button
                title="Share Code"
                onPress={handleShare}
                fullWidth
                style={styles.actionButton}
              />
              <Button
                title="Generate New Code"
                onPress={handleGenerate}
                variant="outline"
                fullWidth
                style={styles.actionButton}
                loading={generateMutation.isPending}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Generate Sponsor Code</Text>
            <Text style={styles.description}>
              Create a code that someone can use to connect with you as their sponsor.
              The code expires in 24 hours.
            </Text>
            <Button
              title="Generate Code"
              onPress={handleGenerate}
              loading={generateMutation.isPending}
              fullWidth
              style={styles.generateButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  description: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  codeCard: {
    alignItems: "center",
    padding: 32,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  code: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 8,
    color: "#007AFF",
    marginBottom: 16,
  },
  expiresText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  instructions: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  instructionsText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  generateButton: {
    marginTop: 24,
  },
});

