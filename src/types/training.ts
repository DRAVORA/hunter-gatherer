// ============================================================================
// TRAINING SESSION STATE (IN-MEMORY DURING WORKOUT)
// ============================================================================

export interface ActiveSessionState {
  session: {
    id: string;
    programName: string;
    sessionName: string;
    startTime: string;
    volumeAdjustmentApplied: number;
  };
  currentExerciseIndex: number;
  exercises: ActiveExercise[];
  preTrainingChecklistComplete: boolean;
}

export interface ActiveExercise {
  exerciseName: string;
  plannedSets: number;
  completedSets: number;
  currentSet: number;
  sets: CompletedSet[];
  setupViewed: boolean;
}

export interface CompletedSet {
  setNumber: number;
  cleanReps: number;
  feltClean: boolean;
  stopReason: string;
  restTimeSeconds?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  timestamp: string;
}

// ============================================================================
// PRE-TRAINING CHECKLIST STATE
// ============================================================================

export interface PreTrainingChecklist {
  waterConsumed500to750ml: boolean;
  notTrainingFasted: boolean; // Only required if user is nausea-prone
  noDizziness: boolean;
}

// ============================================================================
// REST TIMER STATE
// ============================================================================

export interface RestTimerState {
  isActive: boolean;
  remainingSeconds: number;
  targetSeconds: number;
  startedAt?: string;
}

// ============================================================================
// SET EXECUTION STATE
// ============================================================================

export interface SetExecutionState {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  cleanReps: number;
  isSetActive: boolean;
  setupCuesExpanded: boolean;
  restTimerActive: boolean;
}

// ============================================================================
// READINESS CALCULATION INPUT
// ============================================================================

export interface ReadinessInput {
  sleepHours: number;
  hasSharpPain: boolean;
  consecutivePoorNights: number;
}

// ============================================================================
// VOLUME ADJUSTMENT CALCULATION
// ============================================================================

export interface VolumeAdjustmentInput {
  plannedSets: number;
  readinessStatus: string;
  volumeAdjustmentPercent: number;
}

export interface VolumeAdjustmentOutput {
  adjustedSets: number;
  reductionApplied: number;
  message: string;
}

// ============================================================================
// SESSION SUMMARY (FOR HISTORY DISPLAY)
// ============================================================================

export interface SessionSummary {
  id: string;
  date: string;
  sessionName: string;
  completedSets: number;
  plannedSets: number;
  duration: string; // HH:MM:SS
  sessionFeel?: string;
  hasCompensationNotes: boolean;
}

export interface ExerciseSummary {
  exerciseName: string;
  completedSets: number;
  plannedSets: number;
  totalReps: number;
  averageReps: number;
  cleanPercentage: number;
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface StopRulesBoxProps {
  rules: string[];
}

export interface RepCounterProps {
  cleanReps: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export interface RestTimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
  onSkip: () => void;
}

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ReadinessIndicatorProps {
  status: string; // ReadinessStatus
  message: string;
}

export interface HydrationTrackerProps {
  morning: boolean;
  preTraining: boolean;
  duringTraining: boolean;
  postTraining: boolean;
  onToggle: (field: string) => void;
}

export interface ExerciseCuesProps {
  setup: string[];
  executionFocus: string[];
  breathing: {
    inhale: string;
    exhale: string;
  };
  setupExpanded: boolean;
  onToggleSetup: () => void;
}

// ============================================================================
// NAVIGATION PROPS
// ============================================================================

export interface DailyCheckInScreenProps {
  onComplete: (checkInId: string, readinessStatus: string) => void;
}

export interface SessionReadinessScreenProps {
  checkInId: string;
  readinessStatus: string;
  volumeAdjustmentPercent: number;
  onBeginSession: (sessionId: string) => void;
  onRestDay: () => void;
}

export interface ExerciseExecutionScreenProps {
  sessionId: string;
  exercises: ActiveExercise[];
  onSessionComplete: () => void;
}

export interface PostSessionScreenProps {
  sessionId: string;
  onComplete: () => void;
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// DATE RANGE TYPES
// ============================================================================

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface WeekRange extends DateRange {
  weekNumber: number;
  year: number;
}

// ============================================================================
// PROGRESSION TRACKING
// ============================================================================

export interface ProgressionData {
  exerciseName: string;
  date: string;
  totalReps: number;
  totalSets: number;
  averageRepsPerSet: number;
  cleanPercentage: number;
}

export interface ProgressionComparison {
  exerciseName: string;
  currentWeek: ProgressionData;
  previousWeek: ProgressionData;
  change: {
    reps: number;
    sets: number;
    cleanPercentage: number;
  };
}
