import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ReadinessStatus } from "../types";

// ============================================================================
// READINESS INDICATOR COMPONENT
// ============================================================================
// Shows training readiness status with color-coded indicator
// Red = Rest Day / No Progression
// Amber = Volume Reduced
// Green = Ready
// ============================================================================

interface ReadinessIndicatorProps {
  status: ReadinessStatus;
  message: string;
}

export default function ReadinessIndicator({
  status,
  message,
}: ReadinessIndicatorProps) {
  const getStatusColor = (): string => {
    switch (status) {
      case ReadinessStatus.READY:
        return "#4CAF50"; // Green
      case ReadinessStatus.VOLUME_REDUCED:
        return "#FFA500"; // Amber/Orange
      case ReadinessStatus.NO_PROGRESSION:
      case ReadinessStatus.REST_DAY:
        return "#D32F2F"; // Red
      default:
        return "#757575"; // Grey fallback
    }
  };

  const getStatusLabel = (): string => {
    switch (status) {
      case ReadinessStatus.READY:
        return "READY";
      case ReadinessStatus.VOLUME_REDUCED:
        return "VOLUME REDUCED";
      case ReadinessStatus.NO_PROGRESSION:
        return "NO PROGRESSION";
      case ReadinessStatus.REST_DAY:
        return "REST DAY";
      default:
        return "UNKNOWN";
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: statusColor }]}>
        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
  },
  indicator: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  messageContainer: {
    paddingHorizontal: 8,
  },
  message: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
});
