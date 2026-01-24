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
  // Future programs can be added here:
  // {
  //   id: "minimal-equipment",
  //   name: "Minimal Equipment",
  //   description: "Program with dumbbells and resistance bands",
  //   requirements: ["Pull-up bar", "Dumbbells", "Resistance bands"],
  //   duration: "40-50 min per session",
  //   frequency: "4 days per week",
  // },
];

// ============================================================================
// PROGRAM SELECTION SCREEN
// ============================================================================

export default function ProgramSelectionScreen({ navigation }: Props) {
  function handleSelectProgram(programId: string) {
    // Navigate to Home with selected program
    navigation.navigate("Home", { programId });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hunter-Gatherer</Text>
          <Text style={styles.subtitle}>Select Your Training Program</Text>
        </View>

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
                    • {req}
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
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  programList: {
    marginBottom: 24,
  },
  programCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    marginBottom: 12,
  },
  programName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  programDescription: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 16,
  },
  programDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  requirementsSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
});
