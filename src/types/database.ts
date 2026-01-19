// ============================================================================
// DATABASE ROW TYPES (AS RETURNED FROM SQLITE)
// ============================================================================

export interface DailyCheckInRow {
  id: string;
  date: string;
  sleep_hours: number;
  morning_hydration_complete: number; // SQLite boolean (0/1)
  appetite_status: string;
  soreness_level: string;
  has_sharp_pain: number; // SQLite boolean (0/1)
  sharp_pain_location: string | null;
  readiness_status: string;
  volume_adjustment_percent: number;
  notes: string | null;
  created_at: string;
}

export interface TrainingSessionRow {
  id: string;
  date: string;
  program_name: string;
  session_name: string;
  start_time: string;
  end_time: string | null;
  planned_volume: number;
  completed_volume: number;
  volume_adjustment_applied: number;
  pre_training_checklist_complete: number; // SQLite boolean (0/1)
  appetite_returned_within_60_min: number | null; // SQLite boolean (0/1)
  session_feel: string | null;
  compensation_notes: string | null;
  notes: string | null;
}

export interface ExerciseSessionRow {
  id: string;
  session_id: string;
  exercise_name: string;
  order_in_session: number;
  planned_sets: number;
  completed_sets: number;
  setup_viewed_on_first_set: number; // SQLite boolean (0/1)
  notes: string | null;
}

export interface ExerciseSetRow {
  id: string;
  exercise_session_id: string;
  set_number: number;
  target_reps: number | null;
  clean_reps: number;
  felt_clean: number; // SQLite boolean (0/1)
  stop_reason: string;
  rest_time_seconds: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
  notes: string | null;
  timestamp: string;
}

export interface HydrationLogRow {
  id: string;
  date: string;
  morning_complete: number; // SQLite boolean (0/1)
  pre_training_complete: number; // SQLite boolean (0/1)
  during_training_complete: number; // SQLite boolean (0/1)
  post_training_complete: number; // SQLite boolean (0/1)
  extra_salt_added: number; // SQLite boolean (0/1)
  total_water_litres: number | null;
  notes: string | null;
  created_at: string;
}

export interface UserProfileRow {
  id: string;
  bodyweight_kg: number;
  nausea_prone_while_fasted: number; // SQLite boolean (0/1)
  target_protein_grams: number;
  target_sodium_grams: number;
  target_water_litres: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DATABASE INSERT TYPES (FOR PREPARED STATEMENTS)
// ============================================================================

export interface DailyCheckInInsert {
  id: string;
  date: string;
  sleep_hours: number;
  morning_hydration_complete: number;
  appetite_status: string;
  soreness_level: string;
  has_sharp_pain: number;
  sharp_pain_location: string | null;
  readiness_status: string;
  volume_adjustment_percent: number;
  notes: string | null;
  created_at: string;
}

export interface TrainingSessionInsert {
  id: string;
  date: string;
  program_name: string;
  session_name: string;
  start_time: string;
  end_time: string | null;
  planned_volume: number;
  completed_volume: number;
  volume_adjustment_applied: number;
  pre_training_checklist_complete: number;
  appetite_returned_within_60_min: number | null;
  session_feel: string | null;
  compensation_notes: string | null;
  notes: string | null;
}

export interface ExerciseSessionInsert {
  id: string;
  session_id: string;
  exercise_name: string;
  order_in_session: number;
  planned_sets: number;
  completed_sets: number;
  setup_viewed_on_first_set: number;
  notes: string | null;
}

export interface ExerciseSetInsert {
  id: string;
  exercise_session_id: string;
  set_number: number;
  target_reps: number | null;
  clean_reps: number;
  felt_clean: number;
  stop_reason: string;
  rest_time_seconds: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
  notes: string | null;
  timestamp: string;
}

export interface HydrationLogInsert {
  id: string;
  date: string;
  morning_complete: number;
  pre_training_complete: number;
  during_training_complete: number;
  post_training_complete: number;
  extra_salt_added: number;
  total_water_litres: number | null;
  notes: string | null;
  created_at: string;
}

export interface UserProfileInsert {
  id: string;
  bodyweight_kg: number;
  nausea_prone_while_fasted: number;
  target_protein_grams: number;
  target_sodium_grams: number;
  target_water_litres: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DATABASE QUERY FILTERS
// ============================================================================

export interface CheckInFilter {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface SessionFilter {
  startDate?: string;
  endDate?: string;
  programName?: string;
  limit?: number;
}

export interface HydrationFilter {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// ============================================================================
// DATABASE OPERATION RESULTS
// ============================================================================

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface MutationResult {
  success: boolean;
  rowsAffected: number;
  insertId?: string;
  error?: string;
}
