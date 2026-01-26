import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
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
  onSkip: () => void;
}

export default function RestTimer({
  targetSeconds,
  onComplete,
  onSkip,
}: RestTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(targetSeconds);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  // Show alarm when timer completes
  useEffect(() => {
    if (hasCompleted) {
      setHasCompleted(false);
      onComplete(targetSeconds);
      Alert.alert("Rest Complete", "Time to start your next set", [
        { text: "OK", onPress: () => onSkip() }
      ]);
    }
  }, [hasCompleted, targetSeconds, onComplete, onSkip]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(targetSeconds);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    onSkip();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest Timer (Fixed)</Text>
      <Text style={styles.subtitle}>{targetSeconds} seconds prescribed</Text>

      <Text style={[styles.timer, isRunning && styles.timerActive]}>
        {formatRestTime(remainingSeconds)}
      </Text>

      <View style={styles.buttonRow}>
        {!isRunning ? (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSkip}
        >
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
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
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.timer.rest,
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
    marginVertical: theme.spacing[4],
    color: theme.colors.timer.rest,
    fontFamily: theme.typography.fontFamily.mono,
  },
  timerActive: {
    color: theme.colors.timer.active,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing[3],
    gap: theme.spacing[2],
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderColor: theme.colors.border.default,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: "center",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});
