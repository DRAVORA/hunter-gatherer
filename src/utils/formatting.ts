import { SALT_CONVERSIONS } from "../types";

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats a Date object or ISO string to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}

/**
 * Gets yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Gets date N days ago in YYYY-MM-DD format
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Formats a Date object or ISO string to HH:MM
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Formats a Date object or ISO string to HH:MM:SS
 */
export function formatTimeWithSeconds(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Gets current time in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// DURATION FORMATTING
// ============================================================================

/**
 * Formats seconds into HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secsStr}`;
}

/**
 * Formats seconds into MM:SS (for rest timers)
 */
export function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const minutesStr = String(minutes).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");

  return `${minutesStr}:${secsStr}`;
}

/**
 * Formats minutes into human-readable string
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

// ============================================================================
// SALT / SODIUM CONVERSIONS
// ============================================================================

/**
 * Converts sodium (grams) to salt (grams)
 */
export function sodiumToSalt(sodiumGrams: number): number {
  return Math.round(sodiumGrams * SALT_CONVERSIONS.SODIUM_TO_SALT * 10) / 10;
}

/**
 * Converts salt (grams) to sodium (grams)
 */
export function saltToSodium(saltGrams: number): number {
  return Math.round(saltGrams * SALT_CONVERSIONS.SALT_TO_SODIUM * 10) / 10;
}

/**
 * Converts teaspoons of salt to milligrams of sodium
 */
export function tspToSodiumMg(teaspoons: number): number {
  return Math.round(teaspoons * SALT_CONVERSIONS.ONE_TSP_TO_SODIUM_MG);
}

/**
 * Formats sodium amount with unit
 */
export function formatSodium(sodiumGrams: number): string {
  if (sodiumGrams >= 1) {
    return `${sodiumGrams.toFixed(1)}g sodium`;
  }
  return `${Math.round(sodiumGrams * 1000)}mg sodium`;
}

/**
 * Formats salt amount with unit
 */
export function formatSalt(saltGrams: number): string {
  if (saltGrams >= 1) {
    return `${saltGrams.toFixed(1)}g salt`;
  }
  return `${Math.round(saltGrams * 1000)}mg salt`;
}

/**
 * Formats salt amount in teaspoons (for practical use)
 */
export function formatSaltInTeaspoons(saltGrams: number): string {
  const teaspoons = saltGrams / SALT_CONVERSIONS.TSP_TO_SALT_G;

  if (teaspoons < 0.25) {
    return "pinch of salt";
  }
  if (teaspoons < 0.5) {
    return "\u00BC tsp salt"; // Unicode for ¼
  }
  if (teaspoons < 0.75) {
    return "\u00BD tsp salt"; // Unicode for ½
  }
  if (teaspoons < 1) {
    return "\u00BE tsp salt"; // Unicode for ¾
  }
  if (teaspoons === 1) {
    return "1 tsp salt";
  }

  return `${teaspoons.toFixed(1)} tsp salt`;
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats weight in kg
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)}kg`;
}

/**
 * Formats distance in metres
 */
export function formatDistance(metres: number): string {
  return `${metres}m`;
}

/**
 * Formats percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Formats decimal to 1 decimal place
 */
export function formatDecimal(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

// ============================================================================
// DISPLAY TEXT FORMATTING
// ============================================================================

/**
 * Formats readiness status for display
 */
export function formatReadinessStatus(status: string): string {
  const statusMap: Record<string, string> = {
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
export function formatAppetiteStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NORMAL: "Normal",
    REDUCED: "Reduced",
    NONE: "None",
  };

  return statusMap[status] || status;
}

/**
 * Formats soreness level for display
 */
export function formatSorenessLevel(level: string): string {
  const levelMap: Record<string, string> = {
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
export function formatSessionFeel(feel: string): string {
  const feelMap: Record<string, string> = {
    CONTROLLED: "Controlled",
    PUSHED: "Pushed",
    EASY: "Easy",
  };

  return feelMap[feel] || feel;
}

/**
 * Formats stop reason for display
 */
export function formatStopReason(reason: string): string {
  const reasonMap: Record<string, string> = {
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
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = formatDate(d);
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  const diffTime = today.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  }

  return formatDate(d);
}
