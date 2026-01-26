import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../styles/theme";

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
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing['4'],
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing['3'],
    textAlign: "center",
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.accent.secondary,
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  countContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
