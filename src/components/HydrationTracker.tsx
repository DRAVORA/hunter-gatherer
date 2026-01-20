import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

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
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#757575",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  label: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});
