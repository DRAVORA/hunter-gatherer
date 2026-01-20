import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useSessionState } from "../hooks/useSessionState";
import {
  StopRulesBox,
  RepCounter,
  RestTimer,
  ConfirmationDialog,
} from "../components";
import { getExerciseRules } from "../data/exercises";
import { StopReason } from "../types";

// ============================================================================
// EXERCISE EXECUTION SCREEN
// ============================================================================
// The main workout screen
// Shows exercise details, tracks sets/reps, manages rest periods
// This is the most complex screen in the app
// ============================================================================

interface ExerciseExecutionScreenProps {
  route: any;
  navigation: any;
}

export default function ExerciseExecutionScreen({
  route,
  navigation,
}: ExerciseExecutionScreenProps) {
  const { sessionId, programExercises, volumeAdjustment } = route.params;

  // Session state management
  const session = useSessionState({
    sessionId,
    programExercises,
    volumeAdjustmentPercent: volumeAdjustment,
  });

  // UI state
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [feltClean, setFeltClean] = useState(true);
  const [showSetupCues, setShowSetupCues] = useState(true);
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);

  // Get exercise rules
  const exerciseRules = session.currentExercise
    ? getExerciseRules(session.currentExercise.exerciseName)
    : null;

  // Handle setup viewed (mark it in database on first set)
  React.useEffect(() => {
    if (session.currentSetNumber === 1 && !session.setupViewed) {
      session.markSetupViewed();
    }
  }, [session.currentSetNumber]);

  // Auto-open setup cues on first set
  React.useEffect(() => {
    if (session.currentSetNumber === 1) {
      setShowSetupCues(true);
    } else {
      setShowSetupCues(false);
    }
  }, [session.currentSetNumber, session.currentExerciseIndex]);

  const handleStartSet = () => {
    session.startSet();
  };

  const handleStopSet = async () => {
    try {
      const result = await session.stopSet(
        feltClean,
        StopReason.CLEAN_COMPLETION,
        undefined, // Will be filled by rest timer
      );

      if (result.sessionComplete) {
        // Navigate to post-session screen
        navigation.navigate("PostSession", { sessionId });
      } else if (result.movedToNextExercise) {
        // Reset state for new exercise
        setFeltClean(true);
        setShowSetupCues(true);
      } else {
        // Show rest timer for next set
        setShowRestTimer(true);
      }
    } catch (err) {
      console.error("[ExerciseExecution] Failed to stop set:", err);
      Alert.alert("Error", "Failed to save set. Please try again.");
    }
  };

  const handleRestComplete = (actualSeconds: number) => {
    setShowRestTimer(false);
    setFeltClean(true); // Reset for next set
  };

  const handleSkipRest = () => {
    setShowRestTimer(false);
    setFeltClean(true);
  };

  const handleEndSession = () => {
    setShowStopConfirmation(true);
  };

  const confirmEndSession = () => {
    setShowStopConfirmation(false);
    navigation.navigate("PostSession", { sessionId });
  };

  // Loading state
  if (!session.isInitialized || !exerciseRules) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading exercise...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Exercise Header */}
          <View style={styles.header}>
            <Text style={styles.exerciseName}>
              {session.currentExercise.exerciseName}
            </Text>
            <Text style={styles.setCounter}>
              Set {session.currentSetNumber} of{" "}
              {session.currentExercise.targetSets}
            </Text>
            <Text style={styles.progressText}>
              Exercise {session.currentExerciseIndex + 1} of{" "}
              {session.totalExercises}
            </Text>
          </View>

          {/* Setup Cues (Collapsible, first set only) */}
          {session.currentSetNumber === 1 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowSetupCues(!showSetupCues)}
              >
                <Text style={styles.sectionTitle}>
                  {showSetupCues ? "▼" : "▶"} Setup
                </Text>
              </TouchableOpacity>

              {showSetupCues && (
                <View style={styles.cueList}>
                  {exerciseRules.setup.map((cue, index) => (
                    <View key={index} style={styles.cueItem}>
                      <Text style={styles.cueBullet}>•</Text>
                      <Text style={styles.cueText}>{cue}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Execution Focus (Always visible) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Focus</Text>
            <View style={styles.cueList}>
              {exerciseRules.executionFocus.map((cue, index) => (
                <View key={index} style={styles.cueItem}>
                  <Text style={styles.cueBullet}>•</Text>
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Breathing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breathing</Text>
            <View style={styles.breathingRow}>
              <View style={styles.breathingItem}>
                <Text style={styles.breathingLabel}>Inhale:</Text>
                <Text style={styles.breathingText}>
                  {exerciseRules.breathing.inhale}
                </Text>
              </View>
              <View style={styles.breathingDivider} />
              <View style={styles.breathingItem}>
                <Text style={styles.breathingLabel}>Exhale:</Text>
                <Text style={styles.breathingText}>
                  {exerciseRules.breathing.exhale}
                </Text>
              </View>
            </View>
          </View>

          {/* Stop Rules (ALWAYS VISIBLE) */}
          <StopRulesBox rules={exerciseRules.stopRules} />

          {/* Rep Counter (when set is active) */}
          {session.isSetActive && (
            <View style={styles.section}>
              <RepCounter
                cleanReps={session.cleanReps}
                onIncrement={session.incrementReps}
                onDecrement={session.decrementReps}
              />
            </View>
          )}

          {/* Set Actions */}
          {!showRestTimer && (
            <View style={styles.actionButtons}>
              {!session.isSetActive ? (
                <TouchableOpacity
                  style={[styles.button, styles.startButton]}
                  onPress={handleStartSet}
                >
                  <Text style={styles.buttonText}>Start Set</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.stopButton]}
                  onPress={handleStopSet}
                >
                  <Text style={styles.buttonText}>STOP SET</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.endButton]}
                onPress={handleEndSession}
              >
                <Text style={styles.buttonText}>End Session Early</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rest Timer Between Sets */}
          {showRestTimer && (
            <View style={styles.restSection}>
              <View style={styles.feltCleanContainer}>
                <Text style={styles.feltCleanLabel}>
                  Did that set feel clean?
                </Text>
                <View style={styles.feltCleanButtons}>
                  <TouchableOpacity
                    style={[
                      styles.feltCleanButton,
                      feltClean && styles.feltCleanButtonYes,
                    ]}
                    onPress={() => setFeltClean(true)}
                  >
                    <Text
                      style={[
                        styles.feltCleanButtonText,
                        feltClean && styles.feltCleanButtonTextYes,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.feltCleanButton,
                      !feltClean && styles.feltCleanButtonNo,
                    ]}
                    onPress={() => setFeltClean(false)}
                  >
                    <Text
                      style={[
                        styles.feltCleanButtonText,
                        !feltClean && styles.feltCleanButtonTextNo,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!feltClean && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Form breakdown detected. Consider ending session.
                  </Text>
                </View>
              )}

              <RestTimer
                targetSeconds={session.currentExercise.restTimeSeconds || 120}
                onComplete={handleRestComplete}
                onSkip={handleSkipRest}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showStopConfirmation}
        title="End Session Early?"
        message="Are you sure you want to end the session now? This will save your current progress."
        confirmText="End Session"
        cancelText="Continue Training"
        onConfirm={confirmEndSession}
        onCancel={() => setShowStopConfirmation(false)}
      />
    </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#EEE",
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  setCounter: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  collapsibleHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  cueList: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 4,
  },
  cueItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  cueBullet: {
    fontSize: 16,
    marginRight: 8,
    color: "#000",
  },
  cueText: {
    fontSize: 16,
    flex: 1,
    color: "#333",
    lineHeight: 22,
  },
  breathingRow: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 4,
  },
  breathingItem: {
    flex: 1,
  },
  breathingDivider: {
    width: 1,
    backgroundColor: "#DDD",
    marginHorizontal: 16,
  },
  breathingLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#666",
  },
  breathingText: {
    fontSize: 16,
    color: "#000",
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    padding: 18,
    borderRadius: 4,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#D32F2F",
  },
  endButton: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  restSection: {
    marginTop: 24,
  },
  feltCleanContainer: {
    marginBottom: 20,
  },
  feltCleanLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  feltCleanButtons: {
    flexDirection: "row",
    gap: 12,
  },
  feltCleanButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
  },
  feltCleanButtonYes: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  feltCleanButtonNo: {
    backgroundColor: "#FFA500",
    borderColor: "#FFA500",
  },
  feltCleanButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  feltCleanButtonTextYes: {
    color: "#FFF",
  },
  feltCleanButtonTextNo: {
    color: "#FFF",
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  warningText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
});
