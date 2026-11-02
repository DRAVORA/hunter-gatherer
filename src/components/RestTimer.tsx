import React from "react";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import { View, Text, StyleSheet, Alert } from "react-native";
import { formatRestTime } from "../utils/formatting";
import { theme } from "../styles/theme";

// ============================================================================
// REST TIMER COMPONENT
// ============================================================================
// Countdown timer between sets
// Shows MM:SS format
// Shows a completion alert when finished
// ============================================================================

interface RestTimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
}

export default function RestTimer({
  targetSeconds,
  onComplete,
}: RestTimerProps) {
  const { remainingSeconds } = useWorkoutTimer(targetSeconds, false, seconds => {
    onComplete(seconds);
    if (targetSeconds > 0) Alert.alert("Rest Complete", "Time to start your next set.");
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest Timer</Text>
      <Text style={styles.subtitle}>{targetSeconds} seconds prescribed</Text>

      <Text style={styles.timer}>{formatRestTime(remainingSeconds)}</Text>
    </View>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing["4"],
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing["1"],
    textAlign: "center",
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    marginBottom: theme.spacing["3"],
  },
  timer: {
    fontSize: 64,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
    marginVertical: theme.spacing["4"],
    color: theme.colors.timer.active,
  },
});
