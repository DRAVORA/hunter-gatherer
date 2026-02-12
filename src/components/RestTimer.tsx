import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { formatRestTime } from "../utils/formatting";
import { theme } from "../styles/theme";

// ============================================================================
// REST TIMER COMPONENT
// ============================================================================
// Countdown timer between sets
// Editable duration before starting
// Shows MM:SS format
// Plays alarm when finished
// ============================================================================

interface RestTimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
}

export default function RestTimer({
  targetSeconds,
  onComplete,
}: RestTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(targetSeconds);
  const endTimeRef = useRef<number>(Date.now() + targetSeconds * 1000);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    endTimeRef.current = Date.now() + targetSeconds * 1000;
    hasCompletedRef.current = false;
    setRemainingSeconds(targetSeconds);
  }, [targetSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000),
      );

      setRemainingSeconds(secondsLeft);

      if (secondsLeft === 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete(targetSeconds);
        Alert.alert("Rest Complete", "Time to start your next set.");
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [onComplete, targetSeconds]);

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
