import React from "react";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatRestTime } from "../utils/formatting";
import { theme } from "../styles/theme";

// ============================================================================
// DURATION TIMER COMPONENT
// ============================================================================
// Countdown timer for holds/carries
// Counts DOWN from target duration
// User can stop early when they can no longer hold
// Automatically ends set at 00:00
// ============================================================================

interface DurationTimerProps {
  targetSeconds: number;
  onStop: (actualSeconds: number) => void;
  title?: string;
  subtitle?: string;
}

export default function DurationTimer({
  targetSeconds,
  onStop,
  title = "Hold Duration",
  subtitle,
}: DurationTimerProps) {
  const isMaxHold = targetSeconds === 0;
  const { running: isRunning, remainingSeconds, elapsedSeconds: heldSeconds, stop: handleStop } =
    useWorkoutTimer(targetSeconds, isMaxHold, onStop);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {subtitle ?? (isMaxHold ? "Max time" : `${targetSeconds}s target`)}
      </Text>

      <Text style={styles.timer}>
        {formatRestTime(isMaxHold ? heldSeconds : remainingSeconds)}
      </Text>

      <View style={styles.buttonRow}>
        {isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.buttonText}>{isMaxHold ? "Finish Set" : "End Set Early"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => onStop(heldSeconds)}>
            <Text style={styles.buttonText}>Review Result</Text>
          </TouchableOpacity>
        )}
      </View>

      {heldSeconds > 0 && !isRunning && (
        <Text style={styles.completedText}>Held for {heldSeconds} seconds</Text>
      )}
    </View>
  );
}

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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    paddingVertical: theme.spacing["3"],
    paddingHorizontal: theme.spacing["6"],
    borderRadius: theme.borderRadius.md,
    minWidth: 140,
  },
  startButton: {
    backgroundColor: theme.colors.state.success,
  },
  stopButton: {
    backgroundColor: theme.colors.state.error,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
  },
  completedText: {
    marginTop: theme.spacing["3"],
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
});
