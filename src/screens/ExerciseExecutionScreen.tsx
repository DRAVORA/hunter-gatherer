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

import { StopRulesBox, RepCounter, RestTimer } from "../components";
import { getDatabase } from "../database/init";

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
// EXERCISE EXECUTION SCREEN (PLACEHOLDER)
// ============================================================================
// This is a minimal demonstration of the execution flow
// Full implementation will be in Phase 4
// ============================================================================

export default function ExerciseExecutionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [cleanReps, setCleanReps] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Demo exercises (simplified)
  const demoExercises = [
    { name: "Scapular Pull-Up", sets: 3, reps: 5, rest: 90 },
    { name: "Pull-Up", sets: 5, reps: 5, rest: 180 },
  ];

  const currentExercise = demoExercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === demoExercises.length - 1;
  const isLastSet = currentSet === currentExercise.sets;

  const demoStopRules = [
    "Any elbow bend",
    "Back arches",
    "Hip shaking or swinging",
    "Shoulders elevate instead of depress",
  ];

  function handleStopSet() {
    Alert.alert(
      "Set Complete",
      `${cleanReps} clean reps recorded. Did this set feel clean?`,
      [
        {
          text: "Yes",
          onPress: () => handleSetComplete(true),
        },
        {
          text: "No",
          onPress: () => handleSetComplete(false),
        },
      ],
    );
  }

  function handleSetComplete(feltClean: boolean) {
    console.log(
      `[Exercise] Set ${currentSet} complete: ${cleanReps} reps, felt clean: ${feltClean}`,
    );

    // Reset rep counter
    setCleanReps(0);

    // Check if this was the last set of the last exercise
    if (isLastExercise && isLastSet) {
      handleSessionComplete();
      return;
    }

    // Check if more sets remain for this exercise
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setShowRestTimer(true);
    } else {
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setShowRestTimer(false);
    }
  }

  function handleRestComplete(actualSeconds: number) {
    console.log(`[Exercise] Rest complete: ${actualSeconds}s`);
    setShowRestTimer(false);
  }

  function handleSkipRest() {
    console.log("[Exercise] Rest skipped");
    setShowRestTimer(false);
  }

  async function handleSessionComplete() {
    try {
      const db = getDatabase();

      // Update session end time
      await db.runAsync(
        "UPDATE training_session SET end_time = ? WHERE id = ?",
        [new Date().toISOString(), sessionId],
      );

      console.log("[Exercise] Session complete:", sessionId);

      // Navigate to post-session screen
      navigation.navigate("PostSession", { sessionId });
    } catch (error) {
      console.error("[Exercise] Failed to complete session:", error);
      Alert.alert("Error", "Failed to complete session. Please try again.");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Exercise Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setInfo}>
            Set {currentSet} of {currentExercise.sets}
          </Text>
        </View>

        {/* Stop Rules */}
        <View style={styles.section}>
          <StopRulesBox rules={demoStopRules} />
        </View>

        {/* Rep Counter (only if not resting) */}
        {!showRestTimer && (
          <>
            <View style={styles.section}>
              <RepCounter
                cleanReps={cleanReps}
                onIncrement={() => setCleanReps(cleanReps + 1)}
                onDecrement={() =>
                  setCleanReps(Math.max(0, cleanReps - 1))
                }
              />
            </View>

            {/* Stop Set Button */}
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopSet}
            >
              <Text style={styles.stopButtonText}>Stop Set</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rest Timer (between sets) */}
        {showRestTimer && (
          <View style={styles.section}>
            <RestTimer
              targetSeconds={currentExercise.rest}
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
  header: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  setInfo: {
    fontSize: 18,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  stopButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
