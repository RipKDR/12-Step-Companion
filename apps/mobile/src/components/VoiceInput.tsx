/**
 * Voice Input Component
 *
 * Provides voice-to-text input with fallback to manual typing
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Mic, MicOff, X } from "lucide-react-native";
import { SpeechRecognition, SpeechRecognitionOptions } from "../lib/speech-recognition";
import { Button } from "./ui/Button";

export interface VoiceInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (error: Error) => void;
  style?: any;
}

export function VoiceInput({
  value,
  onChangeText,
  placeholder = "Tap microphone to speak or type here...",
  multiline = true,
  disabled = false,
  onStartRecording,
  onStopRecording,
  onError,
  style,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    checkAvailability();
    return () => {
      if (recognition) {
        recognition.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await SpeechRecognition.isAvailable();
      setIsAvailable(available);
      if (available) {
        const hasPerm = await SpeechRecognition.requestPermissions();
        setHasPermission(hasPerm);
      }
    } catch (error) {
      console.error("Failed to check speech recognition availability:", error);
      setIsAvailable(false);
    }
  };

  const startRecording = async () => {
    if (!isAvailable || !hasPermission) {
      Alert.alert(
        "Speech Recognition Unavailable",
        "Speech recognition is not available on this device or permissions were denied. Please use manual typing instead.",
        [
          { text: "OK", onPress: () => setShowManualInput(true) },
        ]
      );
      return;
    }

    try {
      const rec = new SpeechRecognition();

      rec.onResult((result) => {
        if (result.isFinal && result.text) {
          const newText = value ? `${value} ${result.text}` : result.text;
          onChangeText(newText);
        }
        // Note: Interim results could be shown here for better UX
        // but might cause flickering, so we only use final results
      });

      rec.onError((error) => {
        setIsRecording(false);
        const err = new Error(error.message);
        if (onError) {
          onError(err);
        } else {
          Alert.alert("Recognition Error", error.message);
        }
        if (onStopRecording) {
          onStopRecording();
        }
      });

      rec.onEnd(() => {
        setIsRecording(false);
        if (onStopRecording) {
          onStopRecording();
        }
      });

      setRecognition(rec);
      await rec.start({
        language: "en-US",
        continuous: true,
        interimResults: true,
      });

      setIsRecording(true);
      if (onStartRecording) {
        onStartRecording();
      }
    } catch (error) {
      setIsRecording(false);
      const err = error instanceof Error ? error : new Error("Failed to start recording");
      if (onError) {
        onError(err);
      } else {
        Alert.alert(
          "Recording Failed",
          "Could not start voice recording. Please use manual typing instead.",
          [
            { text: "OK", onPress: () => setShowManualInput(true) },
          ]
        );
      }
    }
  };

  const stopRecording = async () => {
    if (recognition) {
      try {
        await recognition.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
      setRecognition(null);
    }
    setIsRecording(false);
    if (onStopRecording) {
      onStopRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (showManualInput || !isAvailable) {
    return (
      <View style={[styles.container, style]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          editable={!disabled}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {isAvailable && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={() => setShowManualInput(false)}
            disabled={disabled}
          >
            <Mic size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          editable={!disabled}
          textAlignVertical={multiline ? "top" : "center"}
        />
        <View style={styles.actions}>
          {isRecording ? (
            <TouchableOpacity
              style={[styles.recordButton, styles.recordButtonActive]}
              onPress={stopRecording}
              disabled={disabled}
            >
              {isRecording ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MicOff size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={toggleRecording}
              disabled={disabled}
            >
              <Mic size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          {value.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onChangeText("")}
              disabled={disabled}
            >
              <X size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Listening...</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.fallbackButton}
        onPress={() => setShowManualInput(true)}
      >
        <Text style={styles.fallbackButtonText}>Type instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 100,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#000",
    minHeight: 100,
  },
  inputMultiline: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonActive: {
    backgroundColor: "#FF3B30",
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButton: {
    marginTop: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FFF3F3",
    borderRadius: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
  },
  fallbackButton: {
    marginTop: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  fallbackButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});

