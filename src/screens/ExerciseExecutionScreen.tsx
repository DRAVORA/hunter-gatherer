import React, { useState, useEffect } from "react";
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
import { v4 as uuidv4 } from "uuid";

import { StopRulesBox, RepCounter, RestTimer, DurationTimer } from "../components";
import { getDatabase } from "../database/init";
import { getSessionById, ProgramExercise } from "../data/programs";
import { getExerciseRules } from "../data/exercises";
import { useSessionState } from "../hooks/useSessionState";
import { StopReason } from "../types";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

type ExerciseExecutionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ExerciseExecution"
>;

type ExerciseExecutionRouteProp = RouteProp<
  RootStackParamList,
  "ExerciseExecution"
>;

interface Props {
  navigation: ExerciseExecutionNavigationProp;
  route: ExerciseExecutionRouteProp;
}

// ============================================================================
// EXERCISE EXECUTION SCREEN
// ============================================================================

export default function ExerciseExecutionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  
  const [programExercises, setProgramExercises] = useState<ProgramExercise[]>([]);
  const [volumeAdjustment, setVolumeAdjustment] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupCues, setShowSetupCues] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);

  // Load session data
  useEffect(() => {
    loadSessionData();
  }, []);

  async function loadSessionData() {
    try {
      const db = getDatabase();
      
      // Get session details
      const sessionRow = await db.getFirstAsync<any>(
        "SELECT * FROM training_session WHERE id = ?",
        [sessionId],
      );

      if (!sessionRow) {
        Alert.alert("Error", "Session not found");
        navigation.goBack();
        return;
      }

      // Get program session from static data
      // Determine session ID based on session_name
      let sessionIdToLoad: string;
      
      const sessionName = sessionRow.session_name || "";
      
      // Check for gym program sessions (must match exact names from programs.ts)
      if (sessionName.includes("Day 1: Lower Body")) {
        sessionIdToLoad = "gym-day1";
      } else if (sessionName.includes("Day 2: Upper Pull")) {
        sessionIdToLoad = "gym-day2";
      } else if (sessionName.includes("Day 3: Upper Push")) {
        sessionIdToLoad = "gym-day3";
      }
      // Check for no-gym program sessions
      else if (sessionName.includes("Day 1: Pull")) {
        sessionIdToLoad = "no-gym-day1";
      } else if (sessionName.includes("Day 2: Legs")) {
        sessionIdToLoad = "no-gym-day2";
      } else if (sessionName.includes("Day 3: Push")) {
        sessionIdToLoad = "no-gym-day3";
      } else if (sessionName.includes("Day 4:")) {
        sessionIdToLoad = "no-gym-day4";
      } else {
        // Fallback - shouldn't happen
        console.error(`[ExerciseExecution] Unknown session: ${sessionName}`);
        Alert.alert("Error", `Unknown session type: ${sessionName}`);
        navigation.goBack();
        return;
      }

      console.log(`[ExerciseExecution] Loading session ID: ${sessionIdToLoad} for: ${sessionName}`);
      
      const programSession = getSessionById(sessionIdToLoad);

      if (!programSession) {
        Alert.alert("Error", "Program not found");
        navigation.goBack();
        return;
      }

      setProgramExercises(programSession.exercises);
      setVolumeAdjustment(sessionRow.volume_adjustment_applied || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("[ExerciseExecution] Failed to load:", error);
      Alert.alert("Error", "Failed to load session");
      navigation.goBack();
    }
  }

  const sessionState = useSessionState({
    sessionId,
    programExercises,
    volumeAdjustmentPercent: volumeAdjustment,
  });

  const {
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    currentSetNumber,
    cleanReps,
    isSetActive,
    setupViewed,
    isInitialized,
    isLastExercise,
    isLastSet,
    startSet,
    incrementReps,
    decrementReps,
    stopSet,
    markSetupViewed,
  } = sessionState;

  // Get exercise rules
  const exerciseRules = currentExercise ? getExerciseRules(currentExercise.exerciseName) : null;

  // Show setup cues on first set
  useEffect(() => {
    if (currentSetNumber === 1 && !setupViewed) {
      setShowSetupCues(true);
    } else {
      setShowSetupCues(false);
    }
  }, [currentSetNumber, setupViewed]);

  function handleStartSet() {
    if (showSetupCues && !setupViewed) {
      markSetupViewed();
      setShowSetupCues(false);
    }
    startSet();
  }

  function handleDurationStop(seconds: number) {
    setHoldDuration(seconds);
    
    // Ask if the hold felt clean
    Alert.alert(
      "Hold Complete",
      `Held for ${seconds} seconds. Did this hold feel clean?`,
      [
        {
          text: "Yes - Clean",
          onPress: () => completeSetWithDuration(seconds, true, StopReason.CLEAN_COMPLETION),
        },
        {
          text: "No - Form Break",
          onPress: () => completeSetWithDuration(seconds, false, StopReason.CORE_FAILURE),
          style: "destructive",
        },
      ],
    );
  }

  async function handleStopSet() {
    Alert.alert(
      "Set Complete",
      `${cleanReps} clean reps recorded. Did this set feel clean?`,
      [
        {
          text: "Yes - Clean",
          onPress: () => completeSet(true, StopReason.CLEAN_COMPLETION),
        },
        {
          text: "No - Form Break",
          onPress: () => completeSet(false, StopReason.CORE_FAILURE),
          style: "destructive",
        },
      ],
    );
  }

  async function completeSet(feltClean: boolean, stopReason: StopReason) {
    const result = await stopSet(
      feltClean,
      stopReason,
      currentExercise?.restTimeSeconds,
    );

    if (result.sessionComplete) {
      // Session finished!
      handleSessionComplete();
    } else if (result.movedToNextExercise) {
      // New exercise - show setup cues
      setShowSetupCues(true);
      setShowRestTimer(false);
    } else {
      // Rest between sets
      setShowRestTimer(true);
    }
  }

  async function completeSetWithDuration(
    durationSeconds: number,
    feltClean: boolean,
    stopReason: StopReason,
  ) {
    const result = await stopSet(
      feltClean,
      stopReason,
      currentExercise?.restTimeSeconds,
      durationSeconds, // Pass duration for timed exercises
    );

    if (result.sessionComplete) {
      // Session finished!
      handleSessionComplete();
    } else if (result.movedToNextExercise) {
      // New exercise - show setup cues
      setShowSetupCues(true);
      setShowRestTimer(false);
      setHoldDuration(0); // Reset duration for next exercise
    } else {
      // Rest between sets
      setShowRestTimer(true);
      setHoldDuration(0); // Reset duration for next set
    }
  }

  function handleRestComplete() {
    setShowRestTimer(false);
  }

  function handleSkipRest() {
    setShowRestTimer(false);
  }

  async function handleSessionComplete() {
    try {
      const db = getDatabase();
      await db.runAsync(
        "UPDATE training_session SET end_time = ? WHERE id = ?",
        [new Date().toISOString(), sessionId],
      );

      navigation.navigate("PostSession", { sessionId });
    } catch (error) {
      console.error("[ExerciseExecution] Failed to complete:", error);
      Alert.alert("Error", "Failed to complete session");
    }
  }

  if (isLoading || !isInitialized || !currentExercise || !exerciseRules) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Determine target display
  const targetDisplay = currentExercise.targetReps !== undefined
    ? currentExercise.targetReps === 0 
      ? "AMRAP" 
      : `${currentExercise.targetReps} reps`
    : currentExercise.targetDuration !== undefined
      ? currentExercise.targetDuration === 0
        ? "Max time"
        : `${currentExercise.targetDuration}s hold`
      : "AMRAP"; // Default to AMRAP if neither is specified

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Exercise Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.exerciseNumber}>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
          <Text style={styles.setInfo}>
            Set {currentSetNumber} of {currentExercise.targetSets}
          </Text>
          <Text style={styles.targetInfo}>Target: {targetDisplay}</Text>
          <Text style={styles.intensityRule}>Stop 1 rep before failure</Text>
        </View>

        {/* Setup Cues (First Set Only) */}
        {showSetupCues && (
          <View style={styles.setupSection}>
            <Text style={styles.setupTitle}>SETUP</Text>
            {exerciseRules.setup.map((cue, index) => (
              <Text key={index} style={styles.cueText}>
                {UNICODE.BULLET} {cue}
              </Text>
            ))}
            <TouchableOpacity
              style={styles.setupReadyButton}
              onPress={handleStartSet}
            >
              <Text style={styles.setupReadyButtonText}>Ready - Start Set</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Execution Focus (Always Visible) */}
        {!showSetupCues && !showRestTimer && (
          <>
            <View style={styles.focusSection}>
              <Text style={styles.focusTitle}>FOCUS ON</Text>
              {exerciseRules.executionFocus.map((cue, index) => (
                <Text key={index} style={styles.cueText}>
                  {UNICODE.BULLET} {cue}
                </Text>
              ))}
            </View>

            {/* Breathing */}
            <View style={styles.breathingSection}>
              <Text style={styles.breathingTitle}>BREATHING</Text>
              <Text style={styles.breathingText}>
                Inhale: {exerciseRules.breathing.inhale}
              </Text>
              <Text style={styles.breathingText}>
                Exhale: {exerciseRules.breathing.exhale}
              </Text>
            </View>

            {/* Stop Rules Box */}
            <View style={styles.stopRulesSection}>
              <StopRulesBox rules={exerciseRules.stopRules} />
            </View>

            {/* Exercise Tracking - Duration Timer or Rep Counter */}
            {!isSetActive && (
              <TouchableOpacity
                style={styles.startSetButton}
                onPress={handleStartSet}
              >
                <Text style={styles.startSetButtonText}>Start Set</Text>
              </TouchableOpacity>
            )}

            {isSetActive && (
              <>
                {/* Show Duration Timer for timed exercises (holds) */}
                {currentExercise.targetDuration !== undefined ? (
                  <View style={styles.durationTimerSection}>
                    <DurationTimer
                      targetSeconds={currentExercise.targetDuration}
                      onStop={handleDurationStop}
                    />
                  </View>
                ) : (
                  /* Show Rep Counter for rep-based exercises */
                  <View style={styles.repCounterSection}>
                    <RepCounter
                      cleanReps={cleanReps}
                      onIncrement={incrementReps}
                      onDecrement={decrementReps}
                    />
                  </View>
                )}

                {/* Stop Set Button - Only show for rep-based exercises */}
                {currentExercise.targetDuration === undefined && (
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopSet}
                  >
                    <Text style={styles.stopButtonText}>Stop Set</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}

        {/* Rest Timer */}
        {showRestTimer && (
          <View style={styles.restSection}>
            <RestTimer
              targetSeconds={currentExercise.restTimeSeconds}
              onComplete={handleRestComplete}
              onSkip={handleSkipRest}
            />
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  progressHeader: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
  },
  exerciseNumber: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  exerciseName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  setInfo: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  targetInfo: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.accent.secondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  intensityRule: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.state.warning,
    fontStyle: "italic",
    marginTop: theme.spacing[1],
  },
  setupSection: {
    backgroundColor: theme.colors.execution.setup,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.tertiary,
  },
  setupTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent.tertiary,
    marginBottom: theme.spacing[3],
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  cueText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    paddingLeft: theme.spacing[2],
  },
  setupReadyButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
    marginTop: theme.spacing[4],
  },
  setupReadyButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  focusSection: {
    backgroundColor: theme.colors.surface.base,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[4],
  },
  focusTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[3],
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  breathingSection: {
    backgroundColor: theme.colors.execution.breathing,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
  },
  breathingTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  breathingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  stopRulesSection: {
    marginBottom: theme.spacing[4],
  },
  startSetButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[5],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  startSetButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  repCounterSection: {
    marginBottom: theme.spacing[4],
  },
  durationTimerSection: {
    marginBottom: theme.spacing[4],
  },
  stopButton: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: theme.spacing[5],
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  stopButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  restSection: {
    marginTop: theme.spacing[4],
  },
});
