import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatRestTime } from "../utils/formatting";

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
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4CAF50",
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
    fontSize: 72,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#2E7D32",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  completedText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
});
