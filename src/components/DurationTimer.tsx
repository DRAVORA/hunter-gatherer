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

      <Text style={styles.timer}>{formatRestTime(elapsedSeconds)}</Text>

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
    padding: theme.spacing['4'],
    backgroundColor: theme.colors.execution.setup,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.accent.tertiary,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing['1'],
    textAlign: "center",
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    marginBottom: theme.spacing['3'],
  },
  timer: {
    fontSize: 72,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: "center",
    marginVertical: theme.spacing['5'],
    color: theme.colors.accent.tertiary,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing['3'],
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing['4'],
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: theme.borderWidth.hairline,
  },
  startButton: {
    backgroundColor: theme.colors.accent.secondary,
    borderColor: theme.colors.accent.secondaryDark,
  },
  stopButton: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primaryDark,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  completedText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.accent.tertiary,
    textAlign: "center",
    marginTop: theme.spacing['3'],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
