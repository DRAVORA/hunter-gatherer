import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

import { ReadinessIndicator } from "../components";
import { ReadinessStatus } from "../types";
import { getDatabase } from "../database/init";
import { UNICODE } from "../constants/unicode";

type SessionReadinessNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SessionReadiness"
>;

type SessionReadinessRouteProp = RouteProp<
  RootStackParamList,
  "SessionReadiness"
>;

interface Props {
  navigation: SessionReadinessNavigationProp;
  route: SessionReadinessRouteProp;
}

// ============================================================================
// SESSION READINESS SCREEN
// ============================================================================

export default function SessionReadinessScreen({ navigation, route }: Props) {
  const { sessionId, checkInId, readinessStatus, volumeAdjustmentPercent } = route.params;

  const [waterConsumed, setWaterConsumed] = useState(false);
  const [notTrainingFasted, setNotTrainingFasted] = useState(false);
  const [noDizziness, setNoDizziness] = useState(false);

  const canBeginSession =
    waterConsumed && notTrainingFasted && noDizziness &&
    (readinessStatus === ReadinessStatus.READY ||
      readinessStatus === ReadinessStatus.VOLUME_REDUCED);

  function getReadinessMessage(): string {
    switch (readinessStatus) {
      case ReadinessStatus.READY:
        return "Ready to train at full volume.";
      case ReadinessStatus.VOLUME_REDUCED:
        return `Volume reduced by ${volumeAdjustmentPercent}% due to recovery status.`;
      case ReadinessStatus.NO_PROGRESSION:
        return "Two consecutive poor nights. No progression allowed today.";
      case ReadinessStatus.REST_DAY:
        return "Sharp pain detected. Rest day required.";
      default:
        return "Unknown readiness status.";
    }
  }

  async function handleBeginSession() {
    try {
      const db = getDatabase();

      // Update session to mark checklist complete
      await db.runAsync(
        "UPDATE training_session SET pre_training_checklist_complete = 1 WHERE id = ?",
        [sessionId],
      );

      console.log("[SessionReadiness] Checklist complete, starting session");

      // Get session details for navigation
      const session = await db.getFirstAsync<any>(
        "SELECT program_name, session_name FROM training_session WHERE id = ?",
        [sessionId],
      );

      if (!session) {
        Alert.alert("Error", "Session not found");
        return;
      }

      // Navigate to exercise execution
      navigation.navigate("ExerciseExecution", {
        sessionId,
        programName: session.program_name,
        sessionName: session.session_name,
      });
    } catch (error) {
      console.error("[SessionReadiness] Failed to start session:", error);
      Alert.alert("Error", "Failed to start session. Please try again.");
    }
  }

  function handleRestDay() {
    Alert.alert(
      "Rest Day",
      "You've chosen to take a rest day. Return to home.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ReadinessIndicator
          status={readinessStatus as ReadinessStatus}
          message={getReadinessMessage()}
        />

        {/* Pre-training checklist (only if training allowed) */}
        {(readinessStatus === ReadinessStatus.READY ||
          readinessStatus === ReadinessStatus.VOLUME_REDUCED) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pre-Training Checklist</Text>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setWaterConsumed(!waterConsumed)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  waterConsumed && styles.checkboxBoxChecked,
                ]}
              >
                {waterConsumed && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Water consumed (500-750ml)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setNotTrainingFasted(!notTrainingFasted)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  notTrainingFasted && styles.checkboxBoxChecked,
                ]}
              >
                {notTrainingFasted && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Not training fasted</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setNoDizziness(!noDizziness)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  noDizziness && styles.checkboxBoxChecked,
                ]}
              >
                {noDizziness && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
              </View>
              <Text style={styles.checkboxLabel}>No dizziness</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {(readinessStatus === ReadinessStatus.READY ||
            readinessStatus === ReadinessStatus.VOLUME_REDUCED) && (
            <TouchableOpacity
              style={[
                styles.beginButton,
                !canBeginSession && styles.beginButtonDisabled,
              ]}
              onPress={handleBeginSession}
              disabled={!canBeginSession}
            >
              <Text style={styles.beginButtonText}>Begin Session</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.restButton} onPress={handleRestDay}>
            <Text style={styles.restButtonText}>Rest Day</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 4,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxBox: {
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
  checkboxBoxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
  },
  beginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
  },
  beginButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  beginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  restButton: {
    backgroundColor: "#757575",
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  restButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
