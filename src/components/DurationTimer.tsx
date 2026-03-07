import React, { useState, useEffect, useRef } from "react";
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
}

export default function DurationTimer({
  targetSeconds,
  onStop,
}: DurationTimerProps) {
  const [isRunning, setIsRunning] = useState(true);
  const isMaxHold = targetSeconds === 0;
  const [remainingSeconds, setRemainingSeconds] = useState(targetSeconds);
  const [heldSeconds, setHeldSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(Date.now());
  const endTimeRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const finalizeStop = (seconds: number) => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    setIsRunning(false);
    startTimeRef.current = null;
    endTimeRef.current = null;
    onStop(seconds);
  };

  useEffect(() => {
    const now = Date.now();
    setIsRunning(true);
    setRemainingSeconds(targetSeconds);
    setHeldSeconds(0);
    startTimeRef.current = now;
    endTimeRef.current = isMaxHold
      ? Number.MAX_SAFE_INTEGER
      : now + targetSeconds * 1000;
    hasCompletedRef.current = false;
  }, [isMaxHold, targetSeconds]);

  useEffect(() => {
    if (!isRunning || startTimeRef.current === null) {
      return;
    }

    const tick = () => {
      if (startTimeRef.current === null || endTimeRef.current === null) return;

      const now = Date.now();
      const secondsHeld = Math.max(
        0,
        Math.floor((now - startTimeRef.current) / 1000),
      );
      const secondsLeft = isMaxHold
        ? 0
        : Math.max(0, Math.floor((endTimeRef.current - now) / 1000));

      setHeldSeconds(secondsHeld);
      setRemainingSeconds(secondsLeft);

      if (!isMaxHold && now >= endTimeRef.current && !hasCompletedRef.current) {
        finalizeStop(targetSeconds);
      }
    };

    tick();
    const interval = setInterval(tick, 250);

    return () => clearInterval(interval);
  }, [isMaxHold, isRunning, onStop, targetSeconds]);

  const handleStop = () => {
    if (hasCompletedRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      finalizeStop(heldSeconds);
      return;
    }

    const actualHeld = Math.max(
      0,
      Math.floor((Date.now() - startTimeRef.current) / 1000),
    );

    setHeldSeconds(actualHeld);
    setRemainingSeconds(Math.max(0, targetSeconds - actualHeld));
    finalizeStop(actualHeld);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hold Duration</Text>
      <Text style={styles.subtitle}>{isMaxHold ? "Max time" : `${targetSeconds}s target`}</Text>

      <Text style={styles.timer}>{formatRestTime(isMaxHold ? heldSeconds : remainingSeconds)}</Text>

      <View style={styles.buttonRow}>
        {isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.buttonText}>End Hold Early</Text>
          </TouchableOpacity>
        ) : null}
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
