import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { formatRestTime } from "../utils/formatting";

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

      <Text style={styles.timer}>{formatRestTime(remainingSeconds)}</Text>

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
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  secondaryButton: {
    backgroundColor: "#757575",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
});
