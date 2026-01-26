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
import { theme } from "../styles/theme";

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
  const { sessionId, checkInId, readinessStatus, volumeAdjustmentPercent } =
    route.params;

  const [waterConsumed, setWaterConsumed] = useState(false);
  const [notTrainingFasted, setNotTrainingFasted] = useState(false);
  const [noDizziness, setNoDizziness] = useState(false);

  const canBeginSession =
    waterConsumed &&
    notTrainingFasted &&
    noDizziness &&
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
          onPress: () => navigation.goBack(),
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
                {waterConsumed && (
                  <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>
                )}
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
                {notTrainingFasted && (
                  <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>
                )}
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
                {noDizziness && (
                  <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>
                )}
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
  section: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[4],
    marginTop: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[4],
    color: theme.colors.text.emphasis,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
  },
  checkboxBox: {
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
  checkboxBoxChecked: {
    backgroundColor: theme.colors.state.success,
    borderColor: theme.colors.state.success,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  buttonContainer: {
    marginTop: theme.spacing[6],
  },
  beginButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  beginButtonDisabled: {
    backgroundColor: theme.colors.surface.base,
    borderColor: theme.colors.border.subtle,
  },
  beginButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  restButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
  },
  restButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});
