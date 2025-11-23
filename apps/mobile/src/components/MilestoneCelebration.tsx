/**
 * Milestone Celebration Component
 *
 * Enhanced celebration with shareable cards, rarity badges, and sponsor notifications
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Trophy, X, Share2 } from "lucide-react-native";
import { Badge } from "./ui/Badge";
import { Milestone, formatMilestoneShare } from "../lib/milestones";

interface MilestoneCelebrationProps {
  visible: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onShare?: (milestone: Milestone) => void;
}

const rarityColors: Record<string, string> = {
  common: "#8E8E93",
  uncommon: "#34C759",
  rare: "#007AFF",
  epic: "#FF9500",
};

export function MilestoneCelebration({
  visible,
  milestone,
  onClose,
  onShare,
}: MilestoneCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && milestone) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, milestone]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });

  const handleShare = async () => {
    if (!milestone) return;

    try {
      const shareText = formatMilestoneShare(milestone);
      const result = await Share.share({
        message: shareText,
        title: milestone.title,
      });

      if (onShare) {
        onShare(milestone);
      }
    } catch (error) {
      console.error("Error sharing milestone:", error);
      Alert.alert("Error", "Failed to share milestone");
    }
  };

  if (!milestone) return null;

  const rarityColor = rarityColors[milestone.rarity] || "#8E8E93";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotation },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={24} color="#8E8E93" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>{milestone.icon}</Text>
          </View>

          {/* Rarity Badge */}
          <Badge
            label={milestone.rarity.toUpperCase()}
            variant="info"
            style={[
              styles.rarityBadge,
              { backgroundColor: rarityColor + "20", borderColor: rarityColor },
            ]}
          />

          {/* Title */}
          <Text style={styles.title}>{milestone.title}</Text>

          {/* Description */}
          <Text style={styles.message}>{milestone.description}</Text>

          {/* Days */}
          <View style={styles.daysContainer}>
            <Text style={styles.daysLabel}>{milestone.days} Days</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
            >
              <Share2 size={18} color="#007AFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 16,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  iconEmoji: {
    fontSize: 64,
  },
  rarityBadge: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  message: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  daysContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  daysLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  shareButton: {
    backgroundColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
