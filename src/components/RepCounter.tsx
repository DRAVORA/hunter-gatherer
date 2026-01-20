import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// ============================================================================
// REP COUNTER COMPONENT
// ============================================================================
// Manual rep tracking with +/- buttons
// Large, easy-to-tap buttons
// Shows current clean rep count
// ============================================================================

interface RepCounterProps {
  cleanReps: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function RepCounter({
  cleanReps,
  onIncrement,
  onDecrement,
}: RepCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clean Reps</Text>

      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={onDecrement}
          disabled={cleanReps === 0}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <View style={styles.countContainer}>
          <Text style={styles.count}>{cleanReps}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onIncrement}>
          <Text style={styles.buttonText}>+</Text>
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
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  countContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
  },
});
