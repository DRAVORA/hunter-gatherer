import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatRestTime } from "../utils/formatting";
import { theme } from "../styles/theme";

// ============================================================================
// DURATION TIMER COMPONENT
// ============================================================================
// Stopwatch-style timer for holds/carries
// Counts UP from 0
// User stops when they can no longer hold
// ============================================================================

interface DurationTimerProps {
  targetSeconds: number; // Target duration to display
  onStop: (actualSeconds: number) => void;
}

export default function DurationTimer({
  targetSeconds,
  onStop,
}: DurationTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop(elapsedSeconds);
  };

  const targetDisplay =
    targetSeconds === 0 ? "Max time" : `${targetSeconds}s target`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hold Duration</Text>
      <Text style={styles.subtitle}>{targetDisplay}</Text>

      <Text style={[styles.timer, isRunning && styles.timerActive]}>
        {formatRestTime(elapsedSeconds)}
      </Text>

      <View style={styles.buttonRow}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Start Hold</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.buttonText}>Stop Hold</Text>
          </TouchableOpacity>
        )}
      </View>

      {elapsedSeconds > 0 && !isRunning && (
        <Text style={styles.completedText}>
          Held for {elapsedSeconds} seconds
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.timer.active,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[1],
    textAlign: "center",
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    marginBottom: theme.spacing[3],
  },
  timer: {
    fontSize: 64,
    fontWeight: theme.typography.fontWeight.heavy,
    textAlign: "center",
    marginVertical: theme.spacing[5],
    color: theme.colors.timer.rest,
    fontFamily: theme.typography.fontFamily.mono,
  },
  timerActive: {
    color: theme.colors.timer.active,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: theme.colors.accent.secondary,
  },
  stopButton: {
    backgroundColor: theme.colors.accent.primary,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  completedText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.timer.complete,
    textAlign: "center",
    marginTop: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
