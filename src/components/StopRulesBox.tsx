import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { UNICODE } from "../constants/unicode";

// ============================================================================
// STOP RULES BOX COMPONENT
// ============================================================================
// Displays safety warnings during exercise execution
// ALWAYS VISIBLE during sets
// Amber background to draw attention
// ============================================================================

interface StopRulesBoxProps {
  rules: string[];
}

export default function StopRulesBox({ rules }: StopRulesBoxProps) {
  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STOP SET IF:</Text>
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleRow}>
          <Text style={styles.bullet}>{UNICODE.BULLET}</Text>
          <Text style={styles.ruleText}>{rule}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFD580", // Amber warning color
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FF8C00", // Dark orange border
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  ruleRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 8,
    color: "#000",
  },
  ruleText: {
    fontSize: 14,
    flex: 1,
    color: "#000",
  },
});
