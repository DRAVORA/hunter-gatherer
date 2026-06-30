import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { v4 as uuidv4 } from "uuid";

import { StopRulesBox, RepCounter, RestTimer, DurationTimer } from "../components";
import { getDatabase } from "../database/init";
import { getSessionByProgramAndName, ProgramExercise } from "../data/programs";
import { AppProgramId, getProgramOption, getProgramOptionByName } from "../data/programOptions";
import { getExerciseRules } from "../data/exercises";
import { useSessionState } from "../hooks/useSessionState";
import { StopReason } from "../types";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";
import { formatWeight } from "../utils/formatting";

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

interface LastSessionSetRow {
  clean_reps: number | null;
  weight: number | null;
}

interface LastSessionBest {
  weightLabel: string;
  reps: number | null;
}

interface LastSessionSetSummary {
  setNumber: number;
  cleanReps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
}

type SessionCategory = AppProgramId | null;

function getExerciseHistoryNames(exerciseName: string): string[] {
  const aliases: Record<string, string[]> = {
    "Pull-Ups": ["Pull-Ups", "Pull-Up"],
    "Chin-Ups": ["Chin-Ups", "Chin-Up"],
    "Feet Elevated Push-Up": ["Feet Elevated Push-Up", "Push-Up (Feet Elevated)"],
    "Pseudo Planche Push-Up": ["Pseudo Planche Push-Up", "Pseudo-Planche Push-Up"],
    "Single Leg Hip Thrust": ["Single Leg Hip Thrust", "Single-Leg Hip Thrust"],
    "Hamstring Walkout": ["Hamstring Walkout", "Hamstring Walkouts"],
    "Hollow Hold": ["Hollow Hold", "Hollow Body Hold"],
    Hike: ["Hike", "Long Fast Walk", "Loaded Backpack Walk"],
  };

  return aliases[exerciseName] ?? [exerciseName];
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
  const [weightInput, setWeightInput] = useState("");
  const [distanceInput, setDistanceInput] = useState("");
  const [lastSessionBest, setLastSessionBest] = useState<LastSessionBest | null>(null);
  const [lastSessionSets, setLastSessionSets] = useState<LastSessionSetSummary[]>([]);
  const [sessionCategory, setSessionCategory] = useState<SessionCategory>(null);
  const [sessionProgramName, setSessionProgramName] = useState<string | null>(null);
  const isMobilityCircuit = sessionCategory === "mobility";

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

      const sessionName = sessionRow.session_name || "";
      const programName = sessionRow.program_name || "";

      const programSession = getSessionByProgramAndName(programName, sessionName);
      const programOption = getProgramOptionByName(programName);

      setSessionCategory(programOption?.id ?? null);
      setSessionProgramName(programName || null);
      
      if (!programSession) {
        Alert.alert("Error", `Program session not found: ${programName} / ${sessionName}`);
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
    isCircuit: isMobilityCircuit,
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
  const isDistanceExercise = currentExercise?.targetDistance !== undefined;
  const isTimedExercise = currentExercise?.targetDuration !== undefined;

  useEffect(() => {
    if (!currentExercise) return;
    setWeightInput("");
    setDistanceInput(
      currentExercise.targetDistance !== undefined
        ? String(currentExercise.targetDistance)
        : "",
    );
  }, [currentExerciseIndex, currentExercise]);

  useEffect(() => {
    if (!currentExercise?.exerciseName) {
      setLastSessionBest(null);
      setLastSessionSets([]);
      return;
    }

    loadLastSessionBest(currentExercise.exerciseName);
  }, [currentExercise?.exerciseName, sessionCategory, sessionProgramName]);

  async function loadLastSessionBest(exerciseName: string) {
    try {
      const db = getDatabase();
      const exerciseNames = getExerciseHistoryNames(exerciseName);
      const exerciseNamePlaceholders = exerciseNames.map(() => "?").join(", ");
      const programNameFilter = sessionCategory
        ? getProgramOption(sessionCategory).databaseName
        : sessionProgramName;
      const latestSession = await db.getFirstAsync<{ id: string }>(
        `
          SELECT ts.id
          FROM training_session ts
          JOIN exercise_session es ON ts.id = es.session_id
          WHERE ts.end_time IS NOT NULL
            AND es.exercise_name IN (${exerciseNamePlaceholders})
            AND ts.id != ?
            AND (? IS NULL OR ts.program_name = ?)
          ORDER BY ts.date DESC, ts.start_time DESC
          LIMIT 1
        `,
        [...exerciseNames, sessionId, programNameFilter, programNameFilter],
      );

      if (!latestSession) {
        setLastSessionBest(null);
        setLastSessionSets([]);
        return;
      }

      const latestSetRows = await db.getAllAsync<LastSessionSetSummary>(
        `
          SELECT ex.set_number as setNumber, ex.clean_reps as cleanReps, ex.weight, ex.duration, ex.distance
          FROM exercise_set ex
          JOIN exercise_session es ON ex.exercise_session_id = es.id
          WHERE es.session_id = ?
            AND es.exercise_name IN (${exerciseNamePlaceholders})
          ORDER BY ex.set_number ASC
        `,
        [latestSession.id, ...exerciseNames],
      );
      setLastSessionSets(latestSetRows);

      const setRows = await db.getAllAsync<LastSessionSetRow>(
        `
          SELECT ex.clean_reps, ex.weight
          FROM exercise_set ex
          JOIN exercise_session es ON ex.exercise_session_id = es.id
          WHERE es.session_id = ?
            AND es.exercise_name IN (${exerciseNamePlaceholders})
            AND ex.felt_clean = 1
        `,
        [latestSession.id, ...exerciseNames],
      );

      if (setRows.length === 0) {
        setLastSessionBest(null);
        return;
      }

      const maxLoad = setRows.reduce((max, row) => {
        const weightValue = row.weight ?? 0;
        return weightValue > max ? weightValue : max;
      }, 0);

      if (maxLoad > 0) {
        const repsAtMaxLoad = setRows
          .filter((row) => (row.weight ?? 0) === maxLoad)
          .reduce((maxReps, row) => {
            const repsValue = row.clean_reps ?? 0;
            return repsValue > maxReps ? repsValue : maxReps;
          }, 0);

        setLastSessionBest({
          weightLabel: formatWeight(maxLoad),
          reps: repsAtMaxLoad > 0 ? repsAtMaxLoad : null,
        });
        return;
      }

      const maxBodyweightReps = setRows.reduce((maxReps, row) => {
        const repsValue = row.clean_reps ?? 0;
        return repsValue > maxReps ? repsValue : maxReps;
      }, 0);

      setLastSessionBest({
        weightLabel: "Bodyweight",
        reps: maxBodyweightReps > 0 ? maxBodyweightReps : null,
      });
    } catch (error) {
      console.error("[ExerciseExecution] Failed to load last session best:", error);
      setLastSessionBest(null);
      setLastSessionSets([]);
    }
  }

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

  function parseInputValue(value: string): number | undefined {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  function getWeightValue(): number | undefined {
    return parseInputValue(weightInput);
  }

  function getDistanceValue(): number | undefined {
    return parseInputValue(distanceInput);
  }

  async function completeSet(feltClean: boolean, stopReason: StopReason) {
    await finishSetAndRoute({ feltClean, stopReason, weight: getWeightValue() });
  }

  async function completeSetWithDuration(
    durationSeconds: number,
    feltClean: boolean,
    stopReason: StopReason,
  ) {
    await finishSetAndRoute({
      feltClean,
      stopReason,
      duration: durationSeconds,
      weight: getWeightValue(),
    });
  }

  async function finishSetAndRoute(params: {
    feltClean: boolean;
    stopReason: StopReason;
    duration?: number;
    distance?: number;
    weight?: number;
  }) {
    try {
      const result = await stopSet(
        params.feltClean,
        params.stopReason,
        currentExercise?.restTimeSeconds,
        {
          duration: params.duration,
          distance: params.distance,
          weight: params.weight,
        },
      );

      if (result.sessionComplete) {
        await handleSessionComplete();
      } else if (result.movedToNextExercise) {
        setShowSetupCues(true);
        setShowRestTimer(false);
      } else if (isMobilityCircuit || currentExercise?.restTimeSeconds === 0) {
        setShowRestTimer(false);
      } else {
        setShowRestTimer(true);
      }
    } catch (error) {
      console.error("[ExerciseExecution] Failed to complete set:", error);
      Alert.alert("Error", "Couldn't save this set. Please try again.");
    }
  }

  function handleRestComplete() {
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

  const performCues = exerciseRules.perform ?? exerciseRules.executionFocus;
  const readinessWarning =
    volumeAdjustment > 0
      ? `Recovery adjustment active: volume reduced by ${volumeAdjustment}%. Keep 1-2 reps in reserve and do not force progression today.`
      : null;
  const progressionNotes =
    volumeAdjustment > 0
      ? [
          "Recovery is limited today, so treat clean execution as the win.",
          "Resume load progression after readiness returns to full volume.",
          ...(exerciseRules.progression ?? []),
        ]
      : exerciseRules.progression;

  // Determine target display
  const targetDisplay = currentExercise.targetDescription
    ? currentExercise.targetDescription
    : currentExercise.targetReps !== undefined
    ? currentExercise.targetReps === 0
      ? "AMRAP"
      : `${currentExercise.targetReps} reps`
    : currentExercise.targetDuration !== undefined
      ? currentExercise.targetDuration === 0
        ? "Max time hold"
        : `${currentExercise.targetDuration}s hold`
      : currentExercise.targetDistance !== undefined
        ? currentExercise.targetDistance === 0
          ? "Max distance carry"
          : `${currentExercise.targetDistance}m carry`
        : "AMRAP"; // Default to AMRAP if neither is specified

  function renderCoachingSection(
    title: string,
    items?: string[],
  ) {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.focusSection}>
        <Text style={styles.focusTitle}>{title}</Text>
        {items.map((cue, index) => (
          <Text key={`${title}-${index}`} style={styles.cueText}>
            {UNICODE.BULLET} {cue}
          </Text>
        ))}
      </View>
    );
  }

  function handleDistanceStop() {
    const distanceValue = getDistanceValue();
    if (distanceValue === undefined) {
      Alert.alert("Distance required", "Enter distance in meters to save the carry.");
      return;
    }

    Alert.alert(
      "Carry Complete",
      `Recorded ${distanceValue}m. Did this carry feel clean?`,
      [
        {
          text: "Yes - Clean",
          onPress: () =>
            completeSetWithDistance(distanceValue, true, StopReason.CLEAN_COMPLETION),
        },
        {
          text: "No - Form Break",
          onPress: () => completeSetWithDistance(distanceValue, false, StopReason.CORE_FAILURE),
          style: "destructive",
        },
      ],
    );
  }

  async function completeSetWithDistance(
    distanceMeters: number,
    feltClean: boolean,
    stopReason: StopReason,
  ) {
    await finishSetAndRoute({
      feltClean,
      stopReason,
      distance: distanceMeters,
      weight: getWeightValue(),
    });
  }

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
            {isMobilityCircuit ? "Round" : "Set"} {currentSetNumber} of{" "}
            {currentExercise.targetSets}
          </Text>
          <Text style={styles.targetInfo}>Target: {targetDisplay}</Text>
          <Text style={styles.lastSessionInfo}>
            Last session max: {lastSessionBest?.weightLabel ?? UNICODE.EM_DASH}
            {lastSessionBest?.reps !== null && lastSessionBest?.reps !== undefined
              ? ` × ${lastSessionBest.reps} reps`
              : ""}
          </Text>
          <Text style={styles.lastSessionSetsTitle}>Last session sets:</Text>
          {lastSessionSets.length > 0 ? (
            lastSessionSets.map((setRow) => (
              <Text key={`${setRow.setNumber}-${setRow.weight ?? "bw"}`} style={styles.lastSessionSetRow}>
                Set {setRow.setNumber}: {setRow.weight && setRow.weight > 0 ? formatWeight(setRow.weight) : "Bodyweight"}
                {setRow.cleanReps && setRow.cleanReps > 0 ? ` × ${setRow.cleanReps} reps` : ""}
                {setRow.duration && setRow.duration > 0 ? ` · ${setRow.duration}s` : ""}
                {setRow.distance && setRow.distance > 0 ? ` · ${setRow.distance}m` : ""}
              </Text>
            ))
          ) : (
            <Text style={styles.lastSessionSetRow}>No prior set details</Text>
          )}
          <Text style={styles.intensityRule}>Stop 1 rep before failure</Text>
          {readinessWarning && (
            <Text style={styles.readinessWarning}>{readinessWarning}</Text>
          )}
        </View>

        {/* Setup Cues (First Set Only) */}
        {showSetupCues && (
          <View style={styles.setupSection}>
            {(exerciseRules.overview || exerciseRules.why) && (
              <View style={styles.exerciseInfoSection}>
                {exerciseRules.overview && (
                  <>
                    <Text style={styles.exerciseInfoTitle}>PURPOSE</Text>
                    <Text style={styles.exerciseInfoText}>
                      {exerciseRules.overview}
                    </Text>
                  </>
                )}
                {exerciseRules.why && (
                  <>
                    <Text style={styles.exerciseInfoTitle}>HUNTER-GATHERER BENEFIT</Text>
                    <Text style={styles.exerciseInfoText}>
                      {exerciseRules.hunterGathererBenefit ?? exerciseRules.why}
                    </Text>
                  </>
                )}
              </View>
            )}
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
            <View style={styles.performSection}>
              <Text style={styles.performTitle}>PERFORM</Text>
              {performCues.map((cue, index) => (
                <Text key={index} style={styles.cueText}>
                  {UNICODE.BULLET} {cue}
                </Text>
              ))}
            </View>

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

            {exerciseRules.selfCheck && (
              <View style={styles.selfCheckSection}>
                <Text style={styles.selfCheckTitle}>SELF-CHECK</Text>
                {exerciseRules.selfCheck.map((cue, index) => (
                  <Text key={index} style={styles.cueText}>
                    {UNICODE.BULLET} {cue}
                  </Text>
                ))}
              </View>
            )}

            {exerciseRules.commonMistakes && (
              <View style={styles.commonMistakesSection}>
                <Text style={styles.commonMistakesTitle}>COMMON MISTAKES</Text>
                {exerciseRules.commonMistakes.map((cue, index) => (
                  <Text key={index} style={styles.cueText}>
                    {UNICODE.BULLET} {cue}
                  </Text>
                ))}
              </View>
            )}

            {/* Stop Rules Box */}
            <View style={styles.stopRulesSection}>
              <StopRulesBox rules={exerciseRules.stopRules} />
            </View>

            {renderCoachingSection("PROGRESSION", progressionNotes)}
            {renderCoachingSection("REGRESSION", exerciseRules.regression)}
            {renderCoachingSection("TARGET MUSCLES", exerciseRules.targetMuscles)}

            {exerciseRules.hunterGathererBenefit && !showSetupCues && (
              <View style={styles.focusSection}>
                <Text style={styles.focusTitle}>HUNTER-GATHERER BENEFIT</Text>
                <Text style={styles.cueText}>
                  {UNICODE.BULLET} {exerciseRules.hunterGathererBenefit}
                </Text>
              </View>
            )}

            {/* Exercise Tracking - Duration Timer, Distance Input, or Rep Counter */}
            {!isSetActive && (
              <TouchableOpacity
                style={styles.startSetButton}
                onPress={handleStartSet}
              >
                <Text style={styles.startSetButtonText}>Start Set</Text>
              </TouchableOpacity>
            )}

            {!showRestTimer && (
              <View style={styles.metricInputs}>
                <View style={styles.metricInputBlock}>
                  <Text style={styles.metricLabel}>Load (kg)</Text>
                  <TextInput
                    style={styles.metricInput}
                    keyboardType="decimal-pad"
                    placeholder="Optional"
                    placeholderTextColor={theme.colors.text.disabled}
                    value={weightInput}
                    onChangeText={setWeightInput}
                  />
                </View>
                {isDistanceExercise && (
                  <View style={styles.metricInputBlock}>
                    <Text style={styles.metricLabel}>Distance (m)</Text>
                    <TextInput
                      style={styles.metricInput}
                      keyboardType="decimal-pad"
                      placeholder="Enter meters"
                      placeholderTextColor={theme.colors.text.disabled}
                      value={distanceInput}
                      onChangeText={setDistanceInput}
                    />
                  </View>
                )}
              </View>
            )}

            {isSetActive && (
              <>
                {/* Show Duration Timer for timed exercises (holds) */}
                {isTimedExercise ? (
                  <View style={styles.durationTimerSection}>
                    <DurationTimer
                      targetSeconds={currentExercise?.targetDuration ?? 0}
                      onStop={handleDurationStop}
                    />
                  </View>
                ) : isDistanceExercise ? (
                  <View style={styles.distanceSection}>
                    <Text style={styles.distancePrompt}>
                      Carry the prescribed distance, then finish the set.
                    </Text>
                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={handleDistanceStop}
                    >
                      <Text style={styles.stopButtonText}>Finish Carry</Text>
                    </TouchableOpacity>
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
                {!isTimedExercise && !isDistanceExercise && (
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
  lastSessionInfo: {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  lastSessionSetsTitle: {
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  lastSessionSetRow: {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  intensityRule: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.state.warning,
    fontStyle: "italic",
    marginTop: theme.spacing[1],
  },
  readinessWarning: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.state.warning,
    marginTop: theme.spacing[2],
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
  setupSection: {
    backgroundColor: theme.colors.execution.setup,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.tertiary,
  },
  exerciseInfoSection: {
    marginBottom: theme.spacing[4],
  },
  exerciseInfoTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[2],
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  exerciseInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
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
  performSection: {
    backgroundColor: theme.colors.surface.base,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[4],
  },
  performTitle: {
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
  selfCheckSection: {
    backgroundColor: theme.colors.surface.base,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[4],
  },
  selfCheckTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[3],
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  commonMistakesSection: {
    backgroundColor: theme.colors.surface.base,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[4],
  },
  commonMistakesTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.emphasis,
    marginBottom: theme.spacing[3],
    letterSpacing: theme.typography.letterSpacing.wider,
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
  metricInputs: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    gap: theme.spacing[3],
  },
  metricInputBlock: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing[2],
  },
  metricInput: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surface.elevated,
  },
  distanceSection: {
    marginTop: theme.spacing[3],
    alignItems: "center",
  },
  distancePrompt: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
});
