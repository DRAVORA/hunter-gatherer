import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import { ReadinessIndicator } from "../components";
import { useDatabase } from "../hooks/useDatabase";
import { HUNTER_GATHERER_BASIC } from "../data/programs";
import { ReadinessStatus } from "../types";
import { getTodayDate, getCurrentTimestamp } from "../utils/formatting";

// ============================================================================
// SESSION READINESS SCREEN
// ============================================================================
// Shows readiness status and pre-training checklist
// Creates training session and navigates to exercise execution
// ============================================================================

interface SessionReadinessScreenProps {
  route: any;
  navigation: any;
}

export default function SessionReadinessScreen({
  route,
  navigation,
}: SessionReadinessScreenProps) {
  const {
    checkInId,
    readinessStatus,
    volumeAdjustment,
    message,
    allowTraining,
  } = route.params;

  const db = useDatabase();

  // Pre-training checklist state
  const [waterConsumed, setWaterConsumed] = useState(false);
  const [notFasted, setNotFasted] = useState(false);
  const [noDizziness, setNoDizziness] = useState(false);

  // User profile check (for nausea-prone check)
  const [nauseaProneWhileFasted, setNauseaProneWhileFasted] = useState(false);

  // Load user profile on mount
  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await db.getUserProfile();
      if (profile) {
        setNauseaProneWhileFasted(profile.nauseaProneWhileFasted);
      }
    };
    loadProfile();
  }, []);

  // Checklist complete check
  const checklistComplete =
    waterConsumed && noDizziness && (nauseaProneWhileFasted ? notFasted : true); // Only require notFasted if nausea-prone

  const handleBeginSession = async () => {
    if (!checklistComplete) {
      Alert.alert(
        "Checklist Incomplete",
        "Please complete all pre-training checks before starting.",
      );
      return;
    }

    try {
      // For now, we'll use the first session from the program
      // In a real app, you'd select which session to do
      const program = HUNTER_GATHERER_BASIC;
      const sessionToRun = program.sessions[0]; // Pull Session A

      // Calculate planned volume (total sets)
      const plannedVolume = sessionToRun.exercises.reduce(
        (sum, ex) => sum + ex.targetSets,
        0,
      );

      // Create training session in database
      const sessionId = await db.saveTrainingSession({
        id: uuidv4(),
        date: getTodayDate(),
        programName: program.name,
        sessionName: sessionToRun.name,
        startTime: getCurrentTimestamp(),
        plannedVolume,
        completedVolume: 0,
        volumeAdjustmentApplied: volumeAdjustment,
        preTrainingChecklistComplete: true,
      });

      // Navigate to exercise execution
      navigation.navigate("ExerciseExecution", {
        sessionId,
        programExercises: sessionToRun.exercises,
        volumeAdjustment,
      });
    } catch (err) {
      console.error("[SessionReadiness] Failed to create session:", err);
      Alert.alert("Error", "Failed to start session. Please try again.");
    }
  };

  const handleRestDay = () => {
    Alert.alert("Rest Day", "Good choice. Recovery is training.", [
      {
        text: "View History",
        onPress: () => navigation.navigate("SessionHistory"),
      },
      {
        text: "OK",
        style: "cancel",
      },
    ]);
  };

  // If not allowed to train, show rest day message
  if (!allowTraining) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <ReadinessIndicator status={readinessStatus} message={message} />

          <View style={styles.section}>
            <Text style={styles.messageText}>
              Training is not recommended today. Take a rest day and let your
              body recover.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.restDayButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("SessionHistory")}
          >
            <Text style={styles.buttonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Show pre-training checklist
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ReadinessIndicator status={readinessStatus} message={message} />

        {/* Volume adjustment notice */}
        {volumeAdjustment > 0 && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>Volume Adjustment Applied</Text>
            <Text style={styles.noticeText}>
              Set count will be reduced by {volumeAdjustment}% to match your
              current readiness.
            </Text>
          </View>
        )}

        {/* Pre-training checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-Training Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Complete all items before starting
          </Text>

          <ChecklistItem
            label="Water consumed (500-750ml)"
            checked={waterConsumed}
            onToggle={() => setWaterConsumed(!waterConsumed)}
          />

          {nauseaProneWhileFasted && (
            <ChecklistItem
              label="Not training fasted"
              checked={notFasted}
              onToggle={() => setNotFasted(!notFasted)}
            />
          )}

          <ChecklistItem
            label="No dizziness or lightheadedness"
            checked={noDizziness}
            onToggle={() => setNoDizziness(!noDizziness)}
          />
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.beginButton,
            !checklistComplete && styles.buttonDisabled,
          ]}
          onPress={handleBeginSession}
          disabled={!checklistComplete}
        >
          <Text style={styles.buttonText}>Begin Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.restDayButton]}
          onPress={handleRestDay}
        >
          <Text style={styles.buttonText}>Rest Day</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// CHECKLIST ITEM COMPONENT
// ============================================================================

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function ChecklistItem({ label, checked, onToggle }: ChecklistItemProps) {
  return (
    <TouchableOpacity style={styles.checklistItem} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checklistLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    padding: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  noticeBox: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  noticeText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginTop: 16,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: "#CCC",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  checklistLabel: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  button: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  beginButton: {
    backgroundColor: "#4CAF50",
  },
  restDayButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "#757575",
  },
  buttonDisabled: {
    backgroundColor: "#CCC",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
