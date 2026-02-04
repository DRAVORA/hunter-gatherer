// ============================================================================
// CORE ENUMS
// ============================================================================

export enum ReadinessStatus {
  READY = "READY",
  VOLUME_REDUCED = "VOLUME_REDUCED",
  NO_PROGRESSION = "NO_PROGRESSION",
  REST_DAY = "REST_DAY",
}

export enum AppetiteStatus {
  NORMAL = "NORMAL",
  REDUCED = "REDUCED",
  NONE = "NONE",
}

export enum SorenessLevel {
  NONE = "NONE",
  LIGHT = "LIGHT",
  MODERATE = "MODERATE",
  SEVERE = "SEVERE",
}

export enum SessionFeel {
  CONTROLLED = "CONTROLLED",
  PUSHED = "PUSHED",
  EASY = "EASY",
}

export enum StopReason {
  CLEAN_COMPLETION = "CLEAN_COMPLETION",
  CORE_FAILURE = "CORE_FAILURE",
  MOMENTUM = "MOMENTUM",
  COMPENSATION = "COMPENSATION",
  SHARP_PAIN = "SHARP_PAIN",
  NAUSEA = "NAUSEA",
  DIZZINESS = "DIZZINESS",
  GRIP_FAILURE = "GRIP_FAILURE",
}

// ============================================================================
// DAILY CHECK-IN
// ============================================================================

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  morningHydrationComplete: boolean;
  appetiteStatus: AppetiteStatus;
  sorenessLevel: SorenessLevel;
  hasSharpPain: boolean;
  sharpPainLocation?: string;
  readinessStatus: ReadinessStatus;
  volumeAdjustmentPercent: number; // 0-100
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ============================================================================
// TRAINING SESSION
// ============================================================================

export interface TrainingSession {
  id: string;
  date: string; // YYYY-MM-DD
  programName: string;
  sessionName: string; // e.g., "Pull Session A"
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  plannedVolume: number; // Total sets planned
  completedVolume: number; // Total sets completed
  volumeAdjustmentApplied: number; // Percentage reduction
  preTrainingChecklistComplete: boolean;
  appetiteReturnedWithin60Min?: boolean;
  sessionFeel?: SessionFeel;
  compensationNotes?: string;
  notes?: string;
  exercises: ExerciseSession[];
}

export interface ExerciseSession {
  id: string;
  sessionId: string;
  exerciseName: string;
  orderInSession: number;
  plannedSets: number;
  completedSets: number;
  sets: ExerciseSet[];
  setupViewedOnFirstSet: boolean;
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  exerciseSessionId: string;
  setNumber: number;
  targetReps?: number;
  cleanReps: number;
  feltClean: boolean;
  stopReason: StopReason;
  restTimeSeconds?: number;
  weight?: number; // kg
  duration?: number; // seconds (for holds/carries)
  distance?: number; // metres (for carries)
  notes?: string;
  timestamp: string; // ISO timestamp
}

// ============================================================================
// EXERCISE RULES (STATIC DATA)
// ============================================================================

export interface ExerciseRules {
  name: string;
  category: ExerciseCategory;
  setup: string[];
  perform?: string[];
  executionFocus: string[];
  breathing: {
    inhale: string;
    exhale: string;
  };
  stopRules: string[];
  scaling?: {
    description: string;
    options: string[];
  };
}

export enum ExerciseCategory {
  PULL = "PULL",
  PUSH = "PUSH",
  LEGS = "LEGS",
  CORE = "CORE",
  CARRY = "CARRY",
}

// ============================================================================
// PROGRAM STRUCTURE (STATIC DATA)
// ============================================================================

export interface Program {
  id: string;
  name: string;
  description: string;
  sessions: ProgramSession[];
}

export interface ProgramSession {
  id: string;
  programId: string;
  name: string; // e.g., "Pull Session A"
  orderInProgram: number;
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  id: string;
  sessionId: string;
  exerciseName: string; // References ExerciseRules.name
  orderInSession: number;
  targetSets: number;
  targetReps?: number;
  targetDuration?: number; // seconds
  targetDistance?: number; // metres
  restTimeSeconds: number;
}

// ============================================================================
// HYDRATION TRACKING
// ============================================================================

export interface HydrationLog {
  id: string;
  date: string; // YYYY-MM-DD
  morningComplete: boolean; // 750ml + 1/4 tsp salt
  preTrainingComplete: boolean; // 500-750ml
  duringTrainingComplete: boolean;
  postTrainingComplete: boolean; // 500-750ml
  extraSaltAdded: boolean; // If nausea/headache
  totalWaterLitres?: number;
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile {
  id: string;
  bodyweightKg: number;
  nauseaProneWhileFasted: boolean;
  targetProteinGrams: number; // Auto-calculated from bodyweight
  targetSodiumGrams: number; // 4-6g
  targetWaterLitres: number; // 3.5-5L
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface DailyCheckInFormData {
  sleepHours: number;
  morningHydrationComplete: boolean;
  appetiteStatus: AppetiteStatus;
  sorenessLevel: SorenessLevel;
  hasSharpPain: boolean;
  sharpPainLocation?: string;
  notes?: string;
}

export interface PostSessionFormData {
  appetiteReturnedWithin60Min: boolean;
  sessionFeel: SessionFeel;
  notes?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ReadinessCalculation {
  status: ReadinessStatus;
  volumeAdjustmentPercent: number;
  message: string;
  allowTraining: boolean;
}

export interface VolumeAdjustment {
  originalSets: number;
  adjustedSets: number;
  reductionPercent: number;
  reason: string;
}

export interface VolumeAdjustmentOutput {
  adjustedSets: number;
  reductionApplied: number;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SLEEP_THRESHOLDS = {
  MINIMUM: 6.5,
  TARGET_MIN: 7.5,
  TARGET_MAX: 9.0,
  VOLUME_REDUCTION: 6.5,
} as const;

export const VOLUME_ADJUSTMENTS = {
  POOR_SLEEP: 0.35, // 35% reduction
  CONSECUTIVE_POOR_NIGHTS: 1.0, // 100% reduction (no progression)
} as const;

export const HYDRATION_TARGETS = {
  DAILY_WATER_MIN: 3.5,
  DAILY_WATER_MAX: 5.0,
  DAILY_SODIUM_MIN: 4,
  DAILY_SODIUM_MAX: 6,
  MORNING_WATER_ML: 750,
  MORNING_SALT_TSP: 0.25,
  PRE_TRAINING_WATER_MIN_ML: 500,
  PRE_TRAINING_WATER_MAX_ML: 750,
  POST_TRAINING_WATER_MIN_ML: 500,
  POST_TRAINING_WATER_MAX_ML: 750,
} as const;

export const NUTRITION_TARGETS = {
  PROTEIN_G_PER_KG: 2.0,
  POST_TRAINING_WINDOW_HOURS: 2,
} as const;

export const SALT_CONVERSIONS = {
  SODIUM_TO_SALT: 2.5,
  SALT_TO_SODIUM: 0.4,
  TSP_TO_SALT_G: 6.0,
  QUARTER_TSP_TO_SODIUM_MG: 600,
  HALF_TSP_TO_SODIUM_MG: 1200,
  ONE_TSP_TO_SODIUM_MG: 2400,
} as const;
