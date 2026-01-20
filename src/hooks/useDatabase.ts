import { useState, useEffect } from "react";
import { getDatabase } from "../database/init";
import { v4 as uuidv4 } from "uuid";
import {
  DailyCheckIn,
  TrainingSession,
  ExerciseSession,
  ExerciseSet,
  HydrationLog,
  UserProfile,
  ReadinessStatus,
  AppetiteStatus,
  SorenessLevel,
  SessionFeel,
  StopReason,
} from "../types";
import {
  DailyCheckInRow,
  TrainingSessionRow,
  ExerciseSessionRow,
  ExerciseSetRow,
  HydrationLogRow,
  UserProfileRow,
} from "../types/database";
import { getCurrentTimestamp } from "../utils/formatting";

// ============================================================================
// USE DATABASE HOOK
// ============================================================================
// Provides all database operations needed by the app
// Handles conversion between database rows and TypeScript types
// ============================================================================

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      getDatabase();
      setIsReady(true);
    } catch (err) {
      console.error("[useDatabase] Initialization error:", err);
      setError(String(err));
    }
  }, []);

  // ==========================================================================
  // DAILY CHECK-IN OPERATIONS
  // ==========================================================================

  const saveDailyCheckIn = async (
    checkIn: Omit<DailyCheckIn, "id" | "createdAt">,
  ): Promise<string> => {
    const db = getDatabase();
    const id = uuidv4();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO daily_checkin (
        id, date, sleep_hours, morning_hydration_complete,
        appetite_status, soreness_level, has_sharp_pain,
        sharp_pain_location, readiness_status,
        volume_adjustment_percent, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        checkIn.date,
        checkIn.sleepHours,
        checkIn.morningHydrationComplete ? 1 : 0,
        checkIn.appetiteStatus,
        checkIn.sorenessLevel,
        checkIn.hasSharpPain ? 1 : 0,
        checkIn.sharpPainLocation || null,
        checkIn.readinessStatus,
        checkIn.volumeAdjustmentPercent,
        checkIn.notes || null,
        now,
      ],
    );

    return id;
  };

  const getCheckInByDate = async (
    date: string,
  ): Promise<DailyCheckIn | null> => {
    const db = getDatabase();

    const row = await db.getFirstAsync<DailyCheckInRow>(
      "SELECT * FROM daily_checkin WHERE date = ?",
      [date],
    );

    if (!row) return null;

    return {
      id: row.id,
      date: row.date,
      sleepHours: row.sleep_hours,
      morningHydrationComplete: row.morning_hydration_complete === 1,
      appetiteStatus: row.appetite_status as AppetiteStatus,
      sorenessLevel: row.soreness_level as SorenessLevel,
      hasSharpPain: row.has_sharp_pain === 1,
      sharpPainLocation: row.sharp_pain_location || undefined,
      readinessStatus: row.readiness_status as ReadinessStatus,
      volumeAdjustmentPercent: row.volume_adjustment_percent,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  };

  const getRecentCheckIns = async (days: number): Promise<DailyCheckIn[]> => {
    const db = getDatabase();

    const rows = await db.getAllAsync<DailyCheckInRow>(
      "SELECT * FROM daily_checkin ORDER BY date DESC LIMIT ?",
      [days],
    );

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      sleepHours: row.sleep_hours,
      morningHydrationComplete: row.morning_hydration_complete === 1,
      appetiteStatus: row.appetite_status as AppetiteStatus,
      sorenessLevel: row.soreness_level as SorenessLevel,
      hasSharpPain: row.has_sharp_pain === 1,
      sharpPainLocation: row.sharp_pain_location || undefined,
      readinessStatus: row.readiness_status as ReadinessStatus,
      volumeAdjustmentPercent: row.volume_adjustment_percent,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    }));
  };

  const getRecentSleepHours = async (nights: number): Promise<number[]> => {
    const db = getDatabase();

    const rows = await db.getAllAsync<{ sleep_hours: number }>(
      "SELECT sleep_hours FROM daily_checkin ORDER BY date DESC LIMIT ?",
      [nights],
    );

    return rows.map((r) => r.sleep_hours);
  };

  // ==========================================================================
  // TRAINING SESSION OPERATIONS
  // ==========================================================================

  const saveTrainingSession = async (
    session: Omit<TrainingSession, "exercises">,
  ): Promise<string> => {
    const db = getDatabase();
    const id = session.id || uuidv4();

    await db.runAsync(
      `INSERT INTO training_session (
        id, date, program_name, session_name, start_time, end_time,
        planned_volume, completed_volume, volume_adjustment_applied,
        pre_training_checklist_complete, appetite_returned_within_60_min,
        session_feel, compensation_notes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        session.date,
        session.programName,
        session.sessionName,
        session.startTime,
        session.endTime || null,
        session.plannedVolume,
        session.completedVolume,
        session.volumeAdjustmentApplied,
        session.preTrainingChecklistComplete ? 1 : 0,
        session.appetiteReturnedWithin60Min !== undefined
          ? session.appetiteReturnedWithin60Min
            ? 1
            : 0
          : null,
        session.sessionFeel || null,
        session.compensationNotes || null,
        session.notes || null,
      ],
    );

    return id;
  };

  const updateTrainingSession = async (
    sessionId: string,
    updates: Partial<TrainingSession>,
  ): Promise<void> => {
    const db = getDatabase();

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.endTime !== undefined) {
      setClauses.push("end_time = ?");
      values.push(updates.endTime);
    }

    if (updates.completedVolume !== undefined) {
      setClauses.push("completed_volume = ?");
      values.push(updates.completedVolume);
    }

    if (updates.appetiteReturnedWithin60Min !== undefined) {
      setClauses.push("appetite_returned_within_60_min = ?");
      values.push(updates.appetiteReturnedWithin60Min ? 1 : 0);
    }

    if (updates.sessionFeel !== undefined) {
      setClauses.push("session_feel = ?");
      values.push(updates.sessionFeel);
    }

    if (updates.compensationNotes !== undefined) {
      setClauses.push("compensation_notes = ?");
      values.push(updates.compensationNotes);
    }

    if (updates.notes !== undefined) {
      setClauses.push("notes = ?");
      values.push(updates.notes);
    }

    if (setClauses.length === 0) return;

    values.push(sessionId);

    await db.runAsync(
      `UPDATE training_session SET ${setClauses.join(", ")} WHERE id = ?`,
      values,
    );
  };

  const getSessionById = async (
    sessionId: string,
  ): Promise<TrainingSession | null> => {
    const db = getDatabase();

    const sessionRow = await db.getFirstAsync<TrainingSessionRow>(
      "SELECT * FROM training_session WHERE id = ?",
      [sessionId],
    );

    if (!sessionRow) return null;

    const exerciseRows = await db.getAllAsync<ExerciseSessionRow>(
      "SELECT * FROM exercise_session WHERE session_id = ? ORDER BY order_in_session",
      [sessionId],
    );

    const exercises: ExerciseSession[] = [];

    for (const exRow of exerciseRows) {
      const setRows = await db.getAllAsync<ExerciseSetRow>(
        "SELECT * FROM exercise_set WHERE exercise_session_id = ? ORDER BY set_number",
        [exRow.id],
      );

      exercises.push({
        id: exRow.id,
        sessionId: exRow.session_id,
        exerciseName: exRow.exercise_name,
        orderInSession: exRow.order_in_session,
        plannedSets: exRow.planned_sets,
        completedSets: exRow.completed_sets,
        setupViewedOnFirstSet: exRow.setup_viewed_on_first_set === 1,
        notes: exRow.notes || undefined,
        sets: setRows.map((setRow) => ({
          id: setRow.id,
          exerciseSessionId: setRow.exercise_session_id,
          setNumber: setRow.set_number,
          targetReps: setRow.target_reps || undefined,
          cleanReps: setRow.clean_reps,
          feltClean: setRow.felt_clean === 1,
          stopReason: setRow.stop_reason as StopReason,
          restTimeSeconds: setRow.rest_time_seconds || undefined,
          weight: setRow.weight || undefined,
          duration: setRow.duration || undefined,
          distance: setRow.distance || undefined,
          notes: setRow.notes || undefined,
          timestamp: setRow.timestamp,
        })),
      });
    }

    return {
      id: sessionRow.id,
      date: sessionRow.date,
      programName: sessionRow.program_name,
      sessionName: sessionRow.session_name,
      startTime: sessionRow.start_time,
      endTime: sessionRow.end_time || undefined,
      plannedVolume: sessionRow.planned_volume,
      completedVolume: sessionRow.completed_volume,
      volumeAdjustmentApplied: sessionRow.volume_adjustment_applied,
      preTrainingChecklistComplete:
        sessionRow.pre_training_checklist_complete === 1,
      appetiteReturnedWithin60Min:
        sessionRow.appetite_returned_within_60_min === 1
          ? true
          : sessionRow.appetite_returned_within_60_min === 0
            ? false
            : undefined,
      sessionFeel: (sessionRow.session_feel as SessionFeel) || undefined,
      compensationNotes: sessionRow.compensation_notes || undefined,
      notes: sessionRow.notes || undefined,
      exercises,
    };
  };

  const getSessionHistory = async (
    limit: number,
  ): Promise<TrainingSession[]> => {
    const db = getDatabase();

    const sessionRows = await db.getAllAsync<TrainingSessionRow>(
      "SELECT * FROM training_session ORDER BY start_time DESC LIMIT ?",
      [limit],
    );

    const sessions: TrainingSession[] = [];

    for (const row of sessionRows) {
      const session = await getSessionById(row.id);
      if (session) sessions.push(session);
    }

    return sessions;
  };

  // ==========================================================================
  // EXERCISE SESSION OPERATIONS
  // ==========================================================================

  const saveExerciseSession = async (
    exercise: Omit<ExerciseSession, "sets">,
  ): Promise<string> => {
    const db = getDatabase();
    const id = exercise.id || uuidv4();

    await db.runAsync(
      `INSERT INTO exercise_session (
        id, session_id, exercise_name, order_in_session,
        planned_sets, completed_sets, setup_viewed_on_first_set, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise.sessionId,
        exercise.exerciseName,
        exercise.orderInSession,
        exercise.plannedSets,
        exercise.completedSets,
        exercise.setupViewedOnFirstSet ? 1 : 0,
        exercise.notes || null,
      ],
    );

    return id;
  };

  const updateExerciseSession = async (
    exerciseSessionId: string,
    updates: Partial<ExerciseSession>,
  ): Promise<void> => {
    const db = getDatabase();

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.completedSets !== undefined) {
      setClauses.push("completed_sets = ?");
      values.push(updates.completedSets);
    }

    if (updates.setupViewedOnFirstSet !== undefined) {
      setClauses.push("setup_viewed_on_first_set = ?");
      values.push(updates.setupViewedOnFirstSet ? 1 : 0);
    }

    if (updates.notes !== undefined) {
      setClauses.push("notes = ?");
      values.push(updates.notes);
    }

    if (setClauses.length === 0) return;

    values.push(exerciseSessionId);

    await db.runAsync(
      `UPDATE exercise_session SET ${setClauses.join(", ")} WHERE id = ?`,
      values,
    );
  };

  // ==========================================================================
  // EXERCISE SET OPERATIONS
  // ==========================================================================

  const saveExerciseSet = async (set: ExerciseSet): Promise<string> => {
    const db = getDatabase();
    const id = set.id || uuidv4();

    await db.runAsync(
      `INSERT INTO exercise_set (
        id, exercise_session_id, set_number, target_reps,
        clean_reps, felt_clean, stop_reason, rest_time_seconds,
        weight, duration, distance, notes, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        set.exerciseSessionId,
        set.setNumber,
        set.targetReps || null,
        set.cleanReps,
        set.feltClean ? 1 : 0,
        set.stopReason,
        set.restTimeSeconds || null,
        set.weight || null,
        set.duration || null,
        set.distance || null,
        set.notes || null,
        set.timestamp,
      ],
    );

    return id;
  };

  // ==========================================================================
  // HYDRATION LOG OPERATIONS
  // ==========================================================================

  const saveHydrationLog = async (
    log: Omit<HydrationLog, "id" | "createdAt">,
  ): Promise<string> => {
    const db = getDatabase();
    const id = uuidv4();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO hydration_log (
        id, date, morning_complete, pre_training_complete,
        during_training_complete, post_training_complete,
        extra_salt_added, total_water_litres, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        log.date,
        log.morningComplete ? 1 : 0,
        log.preTrainingComplete ? 1 : 0,
        log.duringTrainingComplete ? 1 : 0,
        log.postTrainingComplete ? 1 : 0,
        log.extraSaltAdded ? 1 : 0,
        log.totalWaterLitres || null,
        log.notes || null,
        now,
      ],
    );

    return id;
  };

  const getHydrationLogByDate = async (
    date: string,
  ): Promise<HydrationLog | null> => {
    const db = getDatabase();

    const row = await db.getFirstAsync<HydrationLogRow>(
      "SELECT * FROM hydration_log WHERE date = ?",
      [date],
    );

    if (!row) return null;

    return {
      id: row.id,
      date: row.date,
      morningComplete: row.morning_complete === 1,
      preTrainingComplete: row.pre_training_complete === 1,
      duringTrainingComplete: row.during_training_complete === 1,
      postTrainingComplete: row.post_training_complete === 1,
      extraSaltAdded: row.extra_salt_added === 1,
      totalWaterLitres: row.total_water_litres || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  };

  // ==========================================================================
  // USER PROFILE OPERATIONS
  // ==========================================================================

  const saveUserProfile = async (
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    const db = getDatabase();
    const id = uuidv4();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO user_profile (
        id, bodyweight_kg, nausea_prone_while_fasted,
        target_protein_grams, target_sodium_grams,
        target_water_litres, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        profile.bodyweightKg,
        profile.nauseaProneWhileFasted ? 1 : 0,
        profile.targetProteinGrams,
        profile.targetSodiumGrams,
        profile.targetWaterLitres,
        now,
        now,
      ],
    );

    return id;
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    const db = getDatabase();

    const row = await db.getFirstAsync<UserProfileRow>(
      "SELECT * FROM user_profile LIMIT 1",
    );

    if (!row) return null;

    return {
      id: row.id,
      bodyweightKg: row.bodyweight_kg,
      nauseaProneWhileFasted: row.nausea_prone_while_fasted === 1,
      targetProteinGrams: row.target_protein_grams,
      targetSodiumGrams: row.target_sodium_grams,
      targetWaterLitres: row.target_water_litres,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  };

  // ==========================================================================
  // RETURN HOOK INTERFACE
  // ==========================================================================

  return {
    isReady,
    error,
    // Check-in operations
    saveDailyCheckIn,
    getCheckInByDate,
    getRecentCheckIns,
    getRecentSleepHours,
    // Session operations
    saveTrainingSession,
    updateTrainingSession,
    getSessionById,
    getSessionHistory,
    // Exercise operations
    saveExerciseSession,
    updateExerciseSession,
    saveExerciseSet,
    // Hydration operations
    saveHydrationLog,
    getHydrationLogByDate,
    // User profile operations
    saveUserProfile,
    getUserProfile,
  };
}
