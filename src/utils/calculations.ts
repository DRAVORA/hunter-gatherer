import {
  ReadinessStatus,
  ReadinessCalculation,
  VolumeAdjustmentOutput,
  SLEEP_THRESHOLDS,
  VOLUME_ADJUSTMENTS,
} from "../types";

// ============================================================================
// READINESS CALCULATION
// ============================================================================

export function calculateReadiness(
  sleepHours: number,
  hasSharpPain: boolean,
  consecutivePoorNights: number,
): ReadinessCalculation {
  // HARD STOP: Sharp pain blocks all training
  if (hasSharpPain) {
    return {
      status: ReadinessStatus.REST_DAY,
      volumeAdjustmentPercent: 100,
      message: "Sharp pain detected. Rest day required.",
      allowTraining: false,
    };
  }

  // HARD STOP: Two consecutive poor nights = no progression
  if (consecutivePoorNights >= 2) {
    return {
      status: ReadinessStatus.NO_PROGRESSION,
      volumeAdjustmentPercent: 100,
      message: "Two consecutive poor nights. No progression allowed.",
      allowTraining: false,
    };
  }

  // Volume reduction: Sleep < 6.5 hours
  if (sleepHours < SLEEP_THRESHOLDS.VOLUME_REDUCTION) {
    return {
      status: ReadinessStatus.VOLUME_REDUCED,
      volumeAdjustmentPercent: VOLUME_ADJUSTMENTS.POOR_SLEEP * 100, // 35%
      message: `Sleep below ${SLEEP_THRESHOLDS.VOLUME_REDUCTION}h. Volume reduced by 35%.`,
      allowTraining: true,
    };
  }

  // Ready to train
  return {
    status: ReadinessStatus.READY,
    volumeAdjustmentPercent: 0,
    message: "Ready to train at full volume.",
    allowTraining: true,
  };
}

// ============================================================================
// VOLUME ADJUSTMENT APPLICATION
// ============================================================================

export function applyVolumeAdjustment(
  plannedSets: number,
  volumeAdjustmentPercent: number,
): VolumeAdjustmentOutput {
  if (volumeAdjustmentPercent === 0) {
    return {
      adjustedSets: plannedSets,
      reductionApplied: 0,
      message: "No volume adjustment",
    };
  }

  const reductionDecimal = volumeAdjustmentPercent / 100;
  const setsToRemove = Math.round(plannedSets * reductionDecimal);
  const adjustedSets = Math.max(1, plannedSets - setsToRemove); // Minimum 1 set

  return {
    adjustedSets,
    reductionApplied: volumeAdjustmentPercent,
    message: `Volume reduced from ${plannedSets} to ${adjustedSets} sets (${volumeAdjustmentPercent}% reduction)`,
  };
}

// ============================================================================
// SLEEP QUALITY ASSESSMENT
// ============================================================================

export function getSleepQuality(
  sleepHours: number,
): "POOR" | "ADEQUATE" | "OPTIMAL" {
  if (sleepHours < SLEEP_THRESHOLDS.MINIMUM) {
    return "POOR";
  }
  if (
    sleepHours >= SLEEP_THRESHOLDS.TARGET_MIN &&
    sleepHours <= SLEEP_THRESHOLDS.TARGET_MAX
  ) {
    return "OPTIMAL";
  }
  return "ADEQUATE";
}

// ============================================================================
// CONSECUTIVE POOR NIGHTS TRACKING
// ============================================================================

/**
 * Checks the last N check-ins to count consecutive poor sleep nights.
 * A "poor night" is defined as < 6.5 hours of sleep.
 */
export function getConsecutivePoorNights(recentSleepHours: number[]): number {
  if (recentSleepHours.length === 0) {
    return 0;
  }

  let consecutiveCount = 0;

  // Count from most recent backwards
  for (const hours of recentSleepHours) {
    if (hours < SLEEP_THRESHOLDS.VOLUME_REDUCTION) {
      consecutiveCount++;
    } else {
      break; // Stop at first good night
    }
  }

  return consecutiveCount;
}

// ============================================================================
// PROTEIN TARGET CALCULATION
// ============================================================================

export function calculateProteinTarget(bodyweightKg: number): number {
  // 2.0 g/kg as per nutrition rules
  return Math.round(bodyweightKg * 2.0);
}

// ============================================================================
// SESSION DURATION CALCULATION
// ============================================================================

export function calculateSessionDuration(
  startTime: string,
  endTime: string,
): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  return Math.max(0, Math.round(durationMs / 1000 / 60)); // Minutes
}

// ============================================================================
// CLEAN REP PERCENTAGE
// ============================================================================

export function calculateCleanPercentage(
  cleanSets: number,
  totalSets: number,
): number {
  if (totalSets === 0) return 0;
  return Math.round((cleanSets / totalSets) * 100);
}

// ============================================================================
// AVERAGE REPS PER SET
// ============================================================================

export function calculateAverageReps(
  totalReps: number,
  totalSets: number,
): number {
  if (totalSets === 0) return 0;
  return Math.round((totalReps / totalSets) * 10) / 10; // One decimal place
}

// ============================================================================
// REST TIME VALIDATION
// ============================================================================

/**
 * Ensures rest time is within reasonable bounds.
 * Min: 15 seconds, Max: 10 minutes (600 seconds)
 */
export function validateRestTime(seconds: number): number {
  const MIN_REST = 15;
  const MAX_REST = 600;
  return Math.max(MIN_REST, Math.min(MAX_REST, seconds));
}

// ============================================================================
// SET COUNT VALIDATION
// ============================================================================

/**
 * Ensures set count is reasonable.
 * Min: 1 set, Max: 20 sets per exercise
 */
export function validateSetCount(sets: number): number {
  const MIN_SETS = 1;
  const MAX_SETS = 20;
  return Math.max(MIN_SETS, Math.min(MAX_SETS, Math.round(sets)));
}

// ============================================================================
// REP COUNT VALIDATION
// ============================================================================

/**
 * Ensures rep count is reasonable.
 * Min: 0 reps (stopped early), Max: 100 reps
 */
export function validateRepCount(reps: number): number {
  const MIN_REPS = 0;
  const MAX_REPS = 100;
  return Math.max(MIN_REPS, Math.min(MAX_REPS, Math.round(reps)));
}
