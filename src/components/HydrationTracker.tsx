import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

// ============================================================================
// HYDRATION TRACKER COMPONENT
// ============================================================================
// Simple checkbox-style tracker for daily hydration goals
// Morning, pre-training, during, post-training
// Toggle on/off
// ============================================================================

interface HydrationTrackerProps {
  morning: boolean;
  preTraining: boolean;
  duringTraining: boolean;
  postTraining: boolean;
  onToggle: (field: "morning" | "preTraining" | "duringTraining" | "postTraining") => void;
}

export default function HydrationTracker({
  morning,
  preTraining,
  duringTraining,
  postTraining,
  onToggle,
}: HydrationTrackerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hydration Checklist</Text>

      <HydrationItem
        label="Morning (750ml + 1/4 tsp salt)"
        completed={morning}
        onToggle={() => onToggle("morning")}
      />

      <HydrationItem
        label="Pre-Training (500-750ml)"
        completed={preTraining}
        onToggle={() => onToggle("preTraining")}
      />

      <HydrationItem
        label="During Training"
        completed={duringTraining}
        onToggle={() => onToggle("duringTraining")}
      />

      <HydrationItem
        label="Post-Training (500-750ml)"
        completed={postTraining}
        onToggle={() => onToggle("postTraining")}
      />
    </View>
  );
}

// ============================================================================
// HYDRATION ITEM SUB-COMPONENT
// ============================================================================

interface HydrationItemProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
}

function HydrationItem({ label, completed, onToggle }: HydrationItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onToggle}>
      <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
        {completed && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[3],
    color: theme.colors.text.emphasis,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing[3],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.elevated,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.state.success,
    borderColor: theme.colors.state.success,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
});
