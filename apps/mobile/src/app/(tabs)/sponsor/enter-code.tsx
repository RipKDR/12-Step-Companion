/**
 * Enter Sponsor Code Screen
 */

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useConnectSponsor } from "../../../hooks/useSponsor";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function EnterCodeScreen() {
  const router = useRouter();
  const connectMutation = useConnectSponsor();
  const [code, setCode] = useState("");

  const formatCode = (text: string) => {
    // Remove non-alphanumeric, uppercase, limit to 8 chars
    const cleaned = text.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
    return cleaned;
  };

  const handleCodeChange = (text: string) => {
    setCode(formatCode(text));
  };

  const handleSubmit = async () => {
    if (code.length !== 8) {
      Alert.alert("Invalid Code", "Code must be 8 characters");
      return;
    }

    Keyboard.dismiss();

    try {
      await connectMutation.mutateAsync({ code });
      Alert.alert(
        "Success",
        "Connection request sent! Your sponsor will need to accept it.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to connect. The code may be invalid or expired."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Sponsor Code</Text>
        <Text style={styles.description}>
          Enter the 8-character code your sponsor shared with you
        </Text>

        <View style={styles.codeInputContainer}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={handleCodeChange}
            placeholder="ABCD1234"
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            textAlign="center"
            selectTextOnFocus
          />
          <Text style={styles.codeHint}>
            {code.length}/8 characters
          </Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionsText}>
            1. Enter the code your sponsor gave you
          </Text>
          <Text style={styles.instructionsText}>
            2. A connection request will be sent
          </Text>
          <Text style={styles.instructionsText}>
            3. Your sponsor needs to accept the request
          </Text>
          <Text style={styles.instructionsText}>
            4. Once accepted, you can share your recovery work
          </Text>
        </View>

        <Button
          title="Connect"
          onPress={handleSubmit}
          disabled={code.length !== 8 || connectMutation.isPending}
          loading={connectMutation.isPending}
          fullWidth
          style={styles.submitButton}
        />
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
  codeInputContainer: {
    marginBottom: 32,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    textAlign: "center",
    minHeight: 80,
  },
  codeHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
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
  submitButton: {
    marginTop: 24,
  },
});

