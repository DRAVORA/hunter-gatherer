"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.getTodayDate = getTodayDate;
exports.getYesterdayDate = getYesterdayDate;
exports.getDateDaysAgo = getDateDaysAgo;
exports.formatTime = formatTime;
exports.formatTimeWithSeconds = formatTimeWithSeconds;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.formatDuration = formatDuration;
exports.formatRestTime = formatRestTime;
exports.formatMinutes = formatMinutes;
exports.sodiumToSalt = sodiumToSalt;
exports.saltToSodium = saltToSodium;
exports.tspToSodiumMg = tspToSodiumMg;
exports.formatSodium = formatSodium;
exports.formatSalt = formatSalt;
exports.formatSaltInTeaspoons = formatSaltInTeaspoons;
exports.formatWeight = formatWeight;
exports.formatDistance = formatDistance;
exports.formatPercentage = formatPercentage;
exports.formatDecimal = formatDecimal;
exports.formatReadinessStatus = formatReadinessStatus;
exports.formatAppetiteStatus = formatAppetiteStatus;
exports.formatSorenessLevel = formatSorenessLevel;
exports.formatSessionFeel = formatSessionFeel;
exports.formatStopReason = formatStopReason;
exports.formatRelativeDate = formatRelativeDate;
var types_1 = require("../types");
// ============================================================================
// DATE FORMATTING
// ============================================================================
/**
 * Formats a Date object or ISO string to YYYY-MM-DD
 */
function formatDate(date) {
  var d = typeof date === "string" ? new Date(date) : date;
  var year = d.getUTCFullYear();
  var month = String(d.getUTCMonth() + 1).padStart(2, "0");
  var day = String(d.getUTCDate()).padStart(2, "0");
  return "".concat(year, "-").concat(month, "-").concat(day);
}
/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return formatDate(new Date());
}
/**
 * Gets yesterday's date in YYYY-MM-DD format
 */
function getYesterdayDate() {
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}
/**
 * Gets date N days ago in YYYY-MM-DD format
 */
function getDateDaysAgo(days) {
  var date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}
// ============================================================================
// TIME FORMATTING
// ============================================================================
/**
 * Formats a Date object or ISO string to HH:MM
 */
function formatTime(date) {
  var d = typeof date === "string" ? new Date(date) : date;
  var hours = String(d.getUTCHours()).padStart(2, "0");
  var minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return "".concat(hours, ":").concat(minutes);
}
/**
 * Formats a Date object or ISO string to HH:MM:SS
 */
function formatTimeWithSeconds(date) {
  var d = typeof date === "string" ? new Date(date) : date;
  var hours = String(d.getUTCHours()).padStart(2, "0");
  var minutes = String(d.getUTCMinutes()).padStart(2, "0");
  var seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return "".concat(hours, ":").concat(minutes, ":").concat(seconds);
}
/**
 * Gets current time in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}
// ============================================================================
// DURATION FORMATTING
// ============================================================================
/**
 * Formats seconds into HH:MM:SS
 */
function formatDuration(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var secs = seconds % 60;
  var hoursStr = String(hours).padStart(2, "0");
  var minutesStr = String(minutes).padStart(2, "0");
  var secsStr = String(secs).padStart(2, "0");
  return "".concat(hoursStr, ":").concat(minutesStr, ":").concat(secsStr);
}
/**
 * Formats seconds into MM:SS (for rest timers)
 */
function formatRestTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var secs = seconds % 60;
  var minutesStr = String(minutes).padStart(2, "0");
  var secsStr = String(secs).padStart(2, "0");
  return "".concat(minutesStr, ":").concat(secsStr);
}
/**
 * Formats minutes into human-readable string
 */
function formatMinutes(minutes) {
  if (minutes < 60) {
    return "".concat(minutes, "m");
  }
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  if (mins === 0) {
    return "".concat(hours, "h");
  }
  return "".concat(hours, "h ").concat(mins, "m");
}
// ============================================================================
// SALT / SODIUM CONVERSIONS
// ============================================================================
/**
 * Converts sodium (grams) to salt (grams)
 */
function sodiumToSalt(sodiumGrams) {
  return (
    Math.round(sodiumGrams * types_1.SALT_CONVERSIONS.SODIUM_TO_SALT * 10) / 10
  );
}
/**
 * Converts salt (grams) to sodium (grams)
 */
function saltToSodium(saltGrams) {
  return (
    Math.round(saltGrams * types_1.SALT_CONVERSIONS.SALT_TO_SODIUM * 10) / 10
  );
}
/**
 * Converts teaspoons of salt to milligrams of sodium
 */
function tspToSodiumMg(teaspoons) {
  return Math.round(teaspoons * types_1.SALT_CONVERSIONS.ONE_TSP_TO_SODIUM_MG);
}
/**
 * Formats sodium amount with unit
 */
function formatSodium(sodiumGrams) {
  if (sodiumGrams >= 1) {
    return "".concat(sodiumGrams.toFixed(1), "g sodium");
  }
  return "".concat(Math.round(sodiumGrams * 1000), "mg sodium");
}
/**
 * Formats salt amount with unit
 */
function formatSalt(saltGrams) {
  if (saltGrams >= 1) {
    return "".concat(saltGrams.toFixed(1), "g salt");
  }
  return "".concat(Math.round(saltGrams * 1000), "mg salt");
}
/**
 * Formats salt amount in teaspoons (for practical use)
 */
function formatSaltInTeaspoons(saltGrams) {
  var teaspoons = saltGrams / types_1.SALT_CONVERSIONS.TSP_TO_SALT_G;
  if (teaspoons < 0.25) {
    return "pinch of salt";
  }
  if (teaspoons < 0.5) {
    return "\u00BC tsp salt";
  }
  if (teaspoons < 0.75) {
    return "\u00BD tsp salt";
  }
  if (teaspoons < 1) {
    return "\u00BE tsp salt";
  }
  if (teaspoons === 1) {
    return "1 tsp salt";
  }
  return "".concat(teaspoons.toFixed(1), " tsp salt");
}
// ============================================================================
// NUMBER FORMATTING
// ============================================================================
/**
 * Formats weight in kg
 */
function formatWeight(kg) {
  return "".concat(kg.toFixed(1), "kg");
}
/**
 * Formats distance in metres
 */
function formatDistance(metres) {
  return "".concat(metres, "m");
}
/**
 * Formats percentage
 */
function formatPercentage(value) {
  return "".concat(Math.round(value), "%");
}
/**
 * Formats decimal to 1 decimal place
 */
function formatDecimal(value, decimals) {
  if (decimals === void 0) {
    decimals = 1;
  }
  return value.toFixed(decimals);
}
// ============================================================================
// DISPLAY TEXT FORMATTING
// ============================================================================
/**
 * Formats readiness status for display
 */
function formatReadinessStatus(status) {
  var statusMap = {
    READY: "Ready",
    VOLUME_REDUCED: "Volume Reduced",
    NO_PROGRESSION: "No Progression",
    REST_DAY: "Rest Day",
  };
  return statusMap[status] || status;
}
/**
 * Formats appetite status for display
 */
function formatAppetiteStatus(status) {
  var statusMap = {
    NORMAL: "Normal",
    REDUCED: "Reduced",
    NONE: "None",
  };
  return statusMap[status] || status;
}
/**
 * Formats soreness level for display
 */
function formatSorenessLevel(level) {
  var levelMap = {
    NONE: "None",
    LIGHT: "Light",
    MODERATE: "Moderate",
    SEVERE: "Severe",
  };
  return levelMap[level] || level;
}
/**
 * Formats session feel for display
 */
function formatSessionFeel(feel) {
  var feelMap = {
    CONTROLLED: "Controlled",
    PUSHED: "Pushed",
    EASY: "Easy",
  };
  return feelMap[feel] || feel;
}
/**
 * Formats stop reason for display
 */
function formatStopReason(reason) {
  var reasonMap = {
    CLEAN_COMPLETION: "Clean completion",
    CORE_FAILURE: "Core failure",
    MOMENTUM: "Momentum",
    COMPENSATION: "Compensation",
    SHARP_PAIN: "Sharp pain",
    NAUSEA: "Nausea",
    DIZZINESS: "Dizziness",
    GRIP_FAILURE: "Grip failure",
  };
  return reasonMap[reason] || reason;
}
// ============================================================================
// RELATIVE TIME FORMATTING
// ============================================================================
/**
 * Formats date as relative time (e.g., "Today", "Yesterday", "3 days ago")
 */
function formatRelativeDate(date) {
  var d = typeof date === "string" ? new Date(date) : date;
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  var dateStr = formatDate(d);
  var todayStr = formatDate(today);
  var yesterdayStr = formatDate(yesterday);
  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  var diffTime = today.getTime() - d.getTime();
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return "".concat(diffDays, " days ago");
  }
  var diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return ""
      .concat(diffWeeks, " week")
      .concat(diffWeeks > 1 ? "s" : "", " ago");
  }
  return formatDate(d);
}
