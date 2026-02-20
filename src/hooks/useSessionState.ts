import { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDatabase } from "./useDatabase";
import { StopReason, ExerciseSet } from "../types";
import { ProgramExercise } from "../types";
import { getCurrentTimestamp } from "../utils/formatting";
import { applyVolumeAdjustment } from "../utils/calculations";

// ============================================================================
// USE SESSION STATE HOOK
// ============================================================================
// Manages in-memory workout state during exercise execution
// Tracks current exercise, sets, reps, and handles database saves
// ============================================================================

interface UseSessionStateProps {
  sessionId: string;
  programExercises: ProgramExercise[];
  volumeAdjustmentPercent: number;
}

interface StopSetResult {
  sessionComplete: boolean;
  movedToNextExercise?: boolean;
}

export function useSessionState({
  sessionId,
  programExercises,
  volumeAdjustmentPercent,
}: UseSessionStateProps) {
  const db = useDatabase();

  // Current position in workout
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  // Set execution state
  const [cleanReps, setCleanReps] = useState(0);
  const [isSetActive, setIsSetActive] = useState(false);
  const [setupViewed, setSetupViewed] = useState(false);

  // Exercise session IDs (created when session starts)
  const [exerciseSessionIds, setExerciseSessionIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply volume adjustment to exercises
  const adjustedExercises = useMemo(() => {
    return programExercises.map((ex) => {
      const adjustment = applyVolumeAdjustment(
        ex.targetSets,
        volumeAdjustmentPercent,
      );
      return {
        ...ex,
        targetSets: adjustment.adjustedSets,
      };
    });
  }, [programExercises, volumeAdjustmentPercent]);

  const currentExercise = adjustedExercises[currentExerciseIndex];

  // Initialize exercise sessions in database
  useEffect(() => {
    const initExerciseSessions = async () => {
      try {
        const existingExerciseSessions = await db.getExerciseSessionsBySessionId(
          sessionId,
        );

        if (existingExerciseSessions.length > 0) {
          const orderedExistingSessions = [...existingExerciseSessions].sort(
            (a, b) => a.orderInSession - b.orderInSession,
          );

          setExerciseSessionIds(orderedExistingSessions.map((item) => item.id));
          setIsInitialized(true);
          return;
        }

        const ids: string[] = [];

        for (let i = 0; i < adjustedExercises.length; i++) {
          const ex = adjustedExercises[i];
          const id = await db.saveExerciseSession({
            id: uuidv4(),
            sessionId,
            exerciseName: ex.exerciseName,
            orderInSession: i + 1,
            plannedSets: ex.targetSets,
            completedSets: 0,
            setupViewedOnFirstSet: false,
          });
          ids.push(id);
        }

        setExerciseSessionIds(ids);
        setIsInitialized(true);
      } catch (err) {
        console.error(
          "[useSessionState] Failed to init exercise sessions:",
          err,
        );
      }
    };

    if (!isInitialized && adjustedExercises.length > 0) {
      initExerciseSessions();
    }
  }, [isInitialized, adjustedExercises, sessionId, db]);

  // ==========================================================================
  // SET EXECUTION ACTIONS
  // ==========================================================================

  const startSet = () => {
    setIsSetActive(true);
    setCleanReps(0);
  };

  const incrementReps = () => {
    setCleanReps((prev) => prev + 1);
  };

  const decrementReps = () => {
    setCleanReps((prev) => Math.max(0, prev - 1));
  };

  const markSetupViewed = async () => {
    if (!setupViewed && currentSetNumber === 1) {
      setSetupViewed(true);
      const exerciseSessionId = exerciseSessionIds[currentExerciseIndex];
      await db.updateExerciseSession(exerciseSessionId, {
        setupViewedOnFirstSet: true,
      });
    }
  };

  const stopSet = async (
    feltClean: boolean,
    stopReason: StopReason,
    restTimeSeconds?: number,
    setMetrics: {
      duration?: number; // Optional duration for timed exercises (holds)
      distance?: number; // Optional distance for carries
      weight?: number; // Optional load in kg
    } = {},
  ): Promise<StopSetResult> => {
    if (!isInitialized) {
      throw new Error("Session not initialized");
    }

    const exerciseSessionId = exerciseSessionIds[currentExerciseIndex];
    const { duration, distance, weight } = setMetrics;
    const isNonRepMetric =
      duration !== undefined || distance !== undefined;

    // Save set to database
    await db.saveExerciseSet({
      id: uuidv4(),
      exerciseSessionId,
      setNumber: currentSetNumber,
      targetReps: currentExercise.targetReps,
      cleanReps: isNonRepMetric ? 0 : cleanReps, // Set cleanReps to 0 for timed or distance-based exercises
      feltClean,
      stopReason,
      restTimeSeconds,
      weight,
      duration,
      distance,
      timestamp: getCurrentTimestamp(),
    });

    // Update exercise session completed sets count
    await db.updateExerciseSession(exerciseSessionId, {
      completedSets: currentSetNumber,
    });

    // Determine next state
    if (currentSetNumber < currentExercise.targetSets) {
      // More sets in this exercise
      setCurrentSetNumber((prev) => prev + 1);
      setIsSetActive(false);
      setCleanReps(0);

      return { sessionComplete: false, movedToNextExercise: false };
    } else {
      // Exercise complete, move to next exercise or finish session
      if (currentExerciseIndex < adjustedExercises.length - 1) {
        // Move to next exercise
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetNumber(1);
        setSetupViewed(false);
        setIsSetActive(false);
        setCleanReps(0);

        return { sessionComplete: false, movedToNextExercise: true };
      } else {
        // Session complete!
        return { sessionComplete: true };
      }
    }
  };

  // ==========================================================================
  // NAVIGATION HELPERS
  // ==========================================================================

  const skipToNextExercise = async () => {
    if (currentExerciseIndex < adjustedExercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSetNumber(1);
      setSetupViewed(false);
      setIsSetActive(false);
      setCleanReps(0);
    }
  };

  const isLastExercise = currentExerciseIndex === adjustedExercises.length - 1;
  const isLastSet = currentSetNumber === currentExercise?.targetSets;

  // ==========================================================================
  // RETURN INTERFACE
  // ==========================================================================

  return {
    // Current state
    currentExercise,
    currentExerciseIndex,
    totalExercises: adjustedExercises.length,
    currentSetNumber,
    cleanReps,
    isSetActive,
    setupViewed,
    isInitialized,
    isLastExercise,
    isLastSet,
    // Actions
    startSet,
    incrementReps,
    decrementReps,
    stopSet,
    markSetupViewed,
    skipToNextExercise,
  };
}
