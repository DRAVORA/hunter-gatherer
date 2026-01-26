import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

// ============================================================================
// STOP RULES BOX COMPONENT
// ============================================================================
// Displays safety warnings during exercise execution
// ALWAYS VISIBLE during sets
// Warm dark brown background with amber border to draw attention
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
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.stopRules.background,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.stopRules.border,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    color: theme.colors.stopRules.text,
    letterSpacing: theme.typography.letterSpacing.widest,
  },
  ruleRow: {
    flexDirection: "row",
    marginBottom: theme.spacing[1],
  },
  bullet: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing[2],
    color: theme.colors.stopRules.text,
  },
  ruleText: {
    fontSize: theme.typography.fontSize.sm,
    flex: 1,
    color: theme.colors.stopRules.text,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },
});
