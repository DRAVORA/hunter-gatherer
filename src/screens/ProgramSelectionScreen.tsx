import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

type ProgramSelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProgramSelection"
>;

interface Props {
  navigation: ProgramSelectionNavigationProp;
}

// ============================================================================
// AVAILABLE PROGRAMS
// ============================================================================

interface ProgramOption {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  duration: string;
  frequency: string;
}

const AVAILABLE_PROGRAMS: ProgramOption[] = [
  {
    id: "no-gym",
    name: "No-Gym Program",
    description:
      "4-day bodyweight program requiring only a pull-up bar. Focus on controlled execution and injury prevention.",
    requirements: ["Pull-up bar", "Open floor space", "Backpack (for carries)"],
    duration: "35-45 min per session",
    frequency: "4 days per week",
  },
  {
    id: "gym",
    name: "Gym Program",
    description:
      "3-day program with barbell and dumbbell work. Compound movements with 2 reps in reserve.",
    requirements: ["Squat rack", "Bench press", "Pull-up bar", "Dumbbells", "Barbell"],
    duration: "45-60 min per session",
    frequency: "3 days per week",
  },
];

// ============================================================================
// PROGRAM SELECTION SCREEN
// ============================================================================

export default function ProgramSelectionScreen({ navigation }: Props) {
  function handleSelectProgram(programId: string) {
    // Navigate to Home with selected program
    navigation.navigate("Home", { programId });
  }

  function handleOpenManual() {
    navigation.navigate("TrainingManual");
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hunter-Gatherer</Text>
          <Text style={styles.subtitle}>Select Your Training Program</Text>
        </View>

        <TouchableOpacity style={styles.manualButton} onPress={handleOpenManual}>
          <Text style={styles.manualButtonText}>Read the Training Manual</Text>
        </TouchableOpacity>

        {/* Program Cards */}
        <View style={styles.programList}>
          {AVAILABLE_PROGRAMS.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => handleSelectProgram(program.id)}
            >
              <View style={styles.programHeader}>
                <Text style={styles.programName}>{program.name}</Text>
              </View>

              <Text style={styles.programDescription}>
                {program.description}
              </Text>

              <View style={styles.programDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequency:</Text>
                  <Text style={styles.detailValue}>{program.frequency}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{program.duration}</Text>
                </View>
              </View>

              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {program.requirements.map((req, index) => (
                  <Text key={index} style={styles.requirementItem}>
                    {UNICODE.BULLET} {req}
                  </Text>
                ))}
              </View>

              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Program</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Program Philosophy</Text>
          <Text style={styles.infoText}>
            All programs prioritize execution quality over volume, with
            automatic adjustments based on daily readiness metrics. Stop rules
            are enforced to prevent overreach and injury.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing[4],
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing[8],
    marginTop: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent.tertiary,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  manualButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  manualButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  programList: {
    marginBottom: theme.spacing[6],
  },
  programCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[5],
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    ...theme.shadows.md,
  },
  programHeader: {
    marginBottom: theme.spacing[3],
  },
  programName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.emphasis,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  programDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[4],
  },
  programDetails: {
    marginBottom: theme.spacing[4],
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: theme.spacing[2],
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    width: 90,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  requirementsSection: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  requirementsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  requirementItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  selectButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  infoBox: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.emphasis,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
});
