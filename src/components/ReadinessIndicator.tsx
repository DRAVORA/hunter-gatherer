import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ReadinessStatus } from "../types";
import { theme } from "../styles/theme";

// ============================================================================
// READINESS INDICATOR COMPONENT
// ============================================================================
// Shows training readiness status with color-coded indicator
// Uses theme-specific readiness colors
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
        return theme.colors.readiness.ready;
      case ReadinessStatus.VOLUME_REDUCED:
        return theme.colors.readiness.volumeReduced;
      case ReadinessStatus.NO_PROGRESSION:
        return theme.colors.readiness.noProgression;
      case ReadinessStatus.REST_DAY:
        return theme.colors.readiness.restDay;
      default:
        return theme.colors.surface.base;
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
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  indicator: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[3],
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  messageContainer: {
    paddingHorizontal: theme.spacing[2],
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
});
