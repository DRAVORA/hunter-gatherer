"use strict";
// ============================================================================
// CORE ENUMS
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SALT_CONVERSIONS = exports.NUTRITION_TARGETS = exports.HYDRATION_TARGETS = exports.VOLUME_ADJUSTMENTS = exports.SLEEP_THRESHOLDS = exports.ExerciseCategory = exports.StopReason = exports.SessionFeel = exports.SorenessLevel = exports.AppetiteStatus = exports.ReadinessStatus = void 0;
var ReadinessStatus;
(function (ReadinessStatus) {
    ReadinessStatus["READY"] = "READY";
    ReadinessStatus["VOLUME_REDUCED"] = "VOLUME_REDUCED";
    ReadinessStatus["NO_PROGRESSION"] = "NO_PROGRESSION";
    ReadinessStatus["REST_DAY"] = "REST_DAY";
})(ReadinessStatus || (exports.ReadinessStatus = ReadinessStatus = {}));
var AppetiteStatus;
(function (AppetiteStatus) {
    AppetiteStatus["NORMAL"] = "NORMAL";
    AppetiteStatus["REDUCED"] = "REDUCED";
    AppetiteStatus["NONE"] = "NONE";
})(AppetiteStatus || (exports.AppetiteStatus = AppetiteStatus = {}));
var SorenessLevel;
(function (SorenessLevel) {
    SorenessLevel["NONE"] = "NONE";
    SorenessLevel["LIGHT"] = "LIGHT";
    SorenessLevel["MODERATE"] = "MODERATE";
    SorenessLevel["SEVERE"] = "SEVERE";
})(SorenessLevel || (exports.SorenessLevel = SorenessLevel = {}));
var SessionFeel;
(function (SessionFeel) {
    SessionFeel["CONTROLLED"] = "CONTROLLED";
    SessionFeel["PUSHED"] = "PUSHED";
    SessionFeel["EASY"] = "EASY";
})(SessionFeel || (exports.SessionFeel = SessionFeel = {}));
var StopReason;
(function (StopReason) {
    StopReason["CLEAN_COMPLETION"] = "CLEAN_COMPLETION";
    StopReason["CORE_FAILURE"] = "CORE_FAILURE";
    StopReason["MOMENTUM"] = "MOMENTUM";
    StopReason["COMPENSATION"] = "COMPENSATION";
    StopReason["SHARP_PAIN"] = "SHARP_PAIN";
    StopReason["NAUSEA"] = "NAUSEA";
    StopReason["DIZZINESS"] = "DIZZINESS";
    StopReason["GRIP_FAILURE"] = "GRIP_FAILURE";
})(StopReason || (exports.StopReason = StopReason = {}));
var ExerciseCategory;
(function (ExerciseCategory) {
    ExerciseCategory["PULL"] = "PULL";
    ExerciseCategory["PUSH"] = "PUSH";
    ExerciseCategory["LEGS"] = "LEGS";
    ExerciseCategory["CORE"] = "CORE";
    ExerciseCategory["CARRY"] = "CARRY";
})(ExerciseCategory || (exports.ExerciseCategory = ExerciseCategory = {}));
// ============================================================================
// CONSTANTS
// ============================================================================
exports.SLEEP_THRESHOLDS = {
    MINIMUM: 6.5,
    TARGET_MIN: 7.5,
    TARGET_MAX: 9.0,
    VOLUME_REDUCTION: 6.5,
};
exports.VOLUME_ADJUSTMENTS = {
    POOR_SLEEP: 0.35, // 35% reduction
    CONSECUTIVE_POOR_NIGHTS: 1.0, // 100% reduction (no progression)
};
exports.HYDRATION_TARGETS = {
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
};
exports.NUTRITION_TARGETS = {
    PROTEIN_G_PER_KG: 2.0,
    POST_TRAINING_WINDOW_HOURS: 2,
};
exports.SALT_CONVERSIONS = {
    SODIUM_TO_SALT: 2.5,
    SALT_TO_SODIUM: 0.4,
    TSP_TO_SALT_G: 6.0,
    QUARTER_TSP_TO_SODIUM_MG: 600,
    HALF_TSP_TO_SODIUM_MG: 1200,
    ONE_TSP_TO_SODIUM_MG: 2400,
};
