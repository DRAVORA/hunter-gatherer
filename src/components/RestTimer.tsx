import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { formatRestTime } from "../utils/formatting";

// ============================================================================
// REST TIMER COMPONENT
// ============================================================================
// Countdown timer between sets
// Editable duration before starting
// Shows MM:SS format
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
  const [editedSeconds, setEditedSeconds] = useState(targetSeconds.toString());

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            const actualRestTime = targetSeconds - prev + 1;
            onComplete(actualRestTime);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds, targetSeconds, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(targetSeconds);
    setEditedSeconds(targetSeconds.toString());
  };

  const handleEditComplete = () => {
    const newSeconds = parseInt(editedSeconds, 10);
    if (!isNaN(newSeconds) && newSeconds > 0) {
      setRemainingSeconds(newSeconds);
    } else {
      setEditedSeconds(remainingSeconds.toString());
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    onSkip();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest Timer</Text>

      {!isRunning && remainingSeconds === targetSeconds ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editedSeconds}
            onChangeText={setEditedSeconds}
            onBlur={handleEditComplete}
            keyboardType="number-pad"
            selectTextOnFocus
          />
          <Text style={styles.unit}>seconds</Text>
        </View>
      ) : (
        <Text style={styles.timer}>{formatRestTime(remainingSeconds)}</Text>
      )}

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
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#000",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  input: {
    fontSize: 32,
    fontWeight: "bold",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CCC",
    textAlign: "center",
    width: 100,
    marginRight: 8,
    color: "#000",
  },
  unit: {
    fontSize: 16,
    color: "#666",
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
