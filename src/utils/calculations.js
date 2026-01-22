"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReadiness = calculateReadiness;
exports.applyVolumeAdjustment = applyVolumeAdjustment;
exports.getSleepQuality = getSleepQuality;
exports.getConsecutivePoorNights = getConsecutivePoorNights;
exports.calculateProteinTarget = calculateProteinTarget;
exports.calculateSessionDuration = calculateSessionDuration;
exports.calculateCleanPercentage = calculateCleanPercentage;
exports.calculateAverageReps = calculateAverageReps;
exports.validateRestTime = validateRestTime;
exports.validateSetCount = validateSetCount;
exports.validateRepCount = validateRepCount;
var types_1 = require("../types");
// ============================================================================
// READINESS CALCULATION
// ============================================================================
function calculateReadiness(sleepHours, hasSharpPain, consecutivePoorNights) {
    // HARD STOP: Sharp pain blocks all training
    if (hasSharpPain) {
        return {
            status: types_1.ReadinessStatus.REST_DAY,
            volumeAdjustmentPercent: 100,
            message: "Sharp pain detected. Rest day required.",
            allowTraining: false,
        };
    }
    // HARD STOP: Two consecutive poor nights = no progression
    if (consecutivePoorNights >= 2) {
        return {
            status: types_1.ReadinessStatus.NO_PROGRESSION,
            volumeAdjustmentPercent: 100,
            message: "Two consecutive poor nights. No progression allowed.",
            allowTraining: false,
        };
    }
    // Volume reduction: Sleep < 6.5 hours
    if (sleepHours < types_1.SLEEP_THRESHOLDS.VOLUME_REDUCTION) {
        return {
            status: types_1.ReadinessStatus.VOLUME_REDUCED,
            volumeAdjustmentPercent: types_1.VOLUME_ADJUSTMENTS.POOR_SLEEP * 100, // 35%
            message: "Sleep below ".concat(types_1.SLEEP_THRESHOLDS.VOLUME_REDUCTION, "h. Volume reduced by 35%."),
            allowTraining: true,
        };
    }
    // Ready to train
    return {
        status: types_1.ReadinessStatus.READY,
        volumeAdjustmentPercent: 0,
        message: "Ready to train at full volume.",
        allowTraining: true,
    };
}
// ============================================================================
// VOLUME ADJUSTMENT APPLICATION
// ============================================================================
function applyVolumeAdjustment(plannedSets, volumeAdjustmentPercent) {
    if (volumeAdjustmentPercent === 0) {
        return {
            adjustedSets: plannedSets,
            reductionApplied: 0,
            message: "No volume adjustment",
        };
    }
    var reductionDecimal = volumeAdjustmentPercent / 100;
    var setsToRemove = Math.round(plannedSets * reductionDecimal);
    var adjustedSets = Math.max(1, plannedSets - setsToRemove); // Minimum 1 set
    return {
        adjustedSets: adjustedSets,
        reductionApplied: volumeAdjustmentPercent,
        message: "Volume reduced from ".concat(plannedSets, " to ").concat(adjustedSets, " sets (").concat(volumeAdjustmentPercent, "% reduction)"),
    };
}
// ============================================================================
// SLEEP QUALITY ASSESSMENT
// ============================================================================
function getSleepQuality(sleepHours) {
    if (sleepHours < types_1.SLEEP_THRESHOLDS.MINIMUM) {
        return "POOR";
    }
    if (sleepHours >= types_1.SLEEP_THRESHOLDS.TARGET_MIN &&
        sleepHours <= types_1.SLEEP_THRESHOLDS.TARGET_MAX) {
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
function getConsecutivePoorNights(recentSleepHours) {
    if (recentSleepHours.length === 0) {
        return 0;
    }
    var consecutiveCount = 0;
    // Count from most recent backwards
    for (var _i = 0, recentSleepHours_1 = recentSleepHours; _i < recentSleepHours_1.length; _i++) {
        var hours = recentSleepHours_1[_i];
        if (hours < types_1.SLEEP_THRESHOLDS.VOLUME_REDUCTION) {
            consecutiveCount++;
        }
        else {
            break; // Stop at first good night
        }
    }
    return consecutiveCount;
}
// ============================================================================
// PROTEIN TARGET CALCULATION
// ============================================================================
function calculateProteinTarget(bodyweightKg) {
    // 2.0 g/kg as per nutrition rules
    return Math.round(bodyweightKg * 2.0);
}
// ============================================================================
// SESSION DURATION CALCULATION
// ============================================================================
function calculateSessionDuration(startTime, endTime) {
    var start = new Date(startTime).getTime();
    var end = new Date(endTime).getTime();
    var durationMs = end - start;
    return Math.max(0, Math.round(durationMs / 1000 / 60)); // Minutes
}
// ============================================================================
// CLEAN REP PERCENTAGE
// ============================================================================
function calculateCleanPercentage(cleanSets, totalSets) {
    if (totalSets === 0)
        return 0;
    return Math.round((cleanSets / totalSets) * 100);
}
// ============================================================================
// AVERAGE REPS PER SET
// ============================================================================
function calculateAverageReps(totalReps, totalSets) {
    if (totalSets === 0)
        return 0;
    return Math.round((totalReps / totalSets) * 10) / 10; // One decimal place
}
// ============================================================================
// REST TIME VALIDATION
// ============================================================================
/**
 * Ensures rest time is within reasonable bounds.
 * Min: 15 seconds, Max: 10 minutes (600 seconds)
 */
function validateRestTime(seconds) {
    var MIN_REST = 15;
    var MAX_REST = 600;
    return Math.max(MIN_REST, Math.min(MAX_REST, seconds));
}
// ============================================================================
// SET COUNT VALIDATION
// ============================================================================
/**
 * Ensures set count is reasonable.
 * Min: 1 set, Max: 20 sets per exercise
 */
function validateSetCount(sets) {
    var MIN_SETS = 1;
    var MAX_SETS = 20;
    return Math.max(MIN_SETS, Math.min(MAX_SETS, Math.round(sets)));
}
// ============================================================================
// REP COUNT VALIDATION
// ============================================================================
/**
 * Ensures rep count is reasonable.
 * Min: 0 reps (stopped early), Max: 100 reps
 */
function validateRepCount(reps) {
    var MIN_REPS = 0;
    var MAX_REPS = 100;
    return Math.max(MIN_REPS, Math.min(MAX_REPS, Math.round(reps)));
}
