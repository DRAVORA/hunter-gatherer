// ============================================================================
// HUNTER-GATHERER APP - COMPREHENSIVE UNIT TESTS
// ============================================================================
// Run with: npx jest hunter-gatherer-tests.ts
// Or manually verify each test case
// ============================================================================

import {
  calculateReadiness,
  applyVolumeAdjustment,
  getSleepQuality,
  getConsecutivePoorNights,
  calculateProteinTarget,
  calculateSessionDuration,
  calculateCleanPercentage,
  calculateAverageReps,
  validateRestTime,
  validateSetCount,
  validateRepCount,
} from "../utils/calculations";

import {
  formatDate,
  getTodayDate,
  getYesterdayDate,
  getDateDaysAgo,
  formatTime,
  formatTimeWithSeconds,
  getCurrentTimestamp,
  formatDuration,
  formatRestTime,
  formatMinutes,
  sodiumToSalt,
  saltToSodium,
  tspToSodiumMg,
  formatSodium,
  formatSalt,
  formatSaltInTeaspoons,
  formatWeight,
  formatDistance,
  formatPercentage,
  formatDecimal,
  formatReadinessStatus,
  formatAppetiteStatus,
  formatSorenessLevel,
  formatSessionFeel,
  formatStopReason,
  formatRelativeDate,
} from "../utils/formatting";

import {
  validateSleepHours,
  validateBodyweight,
  validateExerciseName,
  validateDate,
  validateWaterIntake,
  validateSodiumIntake,
  sanitizeString,
  sanitizeNotes,
  validateEmail,
  validateForm,
  isValidUUID,
  validateNumberRange,
  validateRequired,
} from "../utils/validation";

import { ReadinessStatus } from "../types";

// ============================================================================
// TEST UTILITIES
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
const failedTests: string[] = [];

function assert(condition: boolean, testName: string): void {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${testName}`);
  } else {
    testsFailed++;
    failedTests.push(testName);
    console.error(`✗ ${testName}`);
  }
}

function assertEquals(actual: any, expected: any, testName: string): void {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  if (passed) {
    testsPassed++;
    console.log(`✓ ${testName}`);
  } else {
    testsFailed++;
    failedTests.push(testName);
    console.error(`✗ ${testName}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// READINESS CALCULATION TESTS
// ============================================================================

function testReadinessCalculation(): void {
  console.log("\n=== READINESS CALCULATION TESTS ===\n");

  // Test 1: Sharp pain = REST_DAY
  const result1 = calculateReadiness(8.0, true, 0);
  assertEquals(
    result1.status,
    ReadinessStatus.REST_DAY,
    "Sharp pain triggers REST_DAY",
  );
  assertEquals(
    result1.volumeAdjustmentPercent,
    100,
    "Sharp pain = 100% volume reduction",
  );
  assertEquals(result1.allowTraining, false, "Sharp pain blocks training");

  // Test 2: Two consecutive poor nights = NO_PROGRESSION
  const result2 = calculateReadiness(7.0, false, 2);
  assertEquals(
    result2.status,
    ReadinessStatus.NO_PROGRESSION,
    "Two poor nights = NO_PROGRESSION",
  );
  assertEquals(
    result2.volumeAdjustmentPercent,
    100,
    "Two poor nights = 100% volume reduction",
  );
  assertEquals(result2.allowTraining, false, "Two poor nights blocks training");

  // Test 3: Sleep < 6.5 hours = VOLUME_REDUCED
  const result3 = calculateReadiness(6.0, false, 0);
  assertEquals(
    result3.status,
    ReadinessStatus.VOLUME_REDUCED,
    "Sleep < 6.5h = VOLUME_REDUCED",
  );
  assertEquals(
    result3.volumeAdjustmentPercent,
    35,
    "Sleep < 6.5h = 35% volume reduction",
  );
  assertEquals(
    result3.allowTraining,
    true,
    "Low sleep allows reduced training",
  );

  // Test 4: Sleep >= 6.5 hours = READY
  const result4 = calculateReadiness(8.0, false, 0);
  assertEquals(result4.status, ReadinessStatus.READY, "Good sleep = READY");
  assertEquals(result4.volumeAdjustmentPercent, 0, "Good sleep = 0% reduction");
  assertEquals(result4.allowTraining, true, "Good sleep allows full training");

  // Test 5: Boundary test - exactly 6.5 hours
  const result5 = calculateReadiness(6.5, false, 0);
  assertEquals(
    result5.status,
    ReadinessStatus.READY,
    "Exactly 6.5h = READY (boundary)",
  );

  // Test 6: One poor night (not two)
  const result6 = calculateReadiness(6.0, false, 1);
  assertEquals(
    result6.status,
    ReadinessStatus.VOLUME_REDUCED,
    "One poor night = VOLUME_REDUCED only",
  );
}

// ============================================================================
// VOLUME ADJUSTMENT TESTS
// ============================================================================

function testVolumeAdjustment(): void {
  console.log("\n=== VOLUME ADJUSTMENT TESTS ===\n");

  // Test 1: No adjustment
  const result1 = applyVolumeAdjustment(5, 0);
  assertEquals(result1.adjustedSets, 5, "0% adjustment = same sets");
  assertEquals(result1.reductionApplied, 0, "0% reduction applied");

  // Test 2: 35% reduction (poor sleep)
  const result2 = applyVolumeAdjustment(5, 35);
  assertEquals(result2.adjustedSets, 3, "5 sets - 35% = 3 sets");
  assertEquals(result2.reductionApplied, 35, "35% reduction applied");

  // Test 3: 100% reduction (minimum 1 set)
  const result3 = applyVolumeAdjustment(5, 100);
  assertEquals(result3.adjustedSets, 1, "100% reduction = minimum 1 set");

  // Test 4: Large set count with reduction
  const result4 = applyVolumeAdjustment(10, 35);
  assertEquals(result4.adjustedSets, 6, "10 sets - 35% = 6 sets");

  // Test 5: Rounding behavior
  const result5 = applyVolumeAdjustment(7, 35);
  assertEquals(result5.adjustedSets, 5, "7 sets - 35% = 5 sets (rounded)");
}

// ============================================================================
// SLEEP QUALITY TESTS
// ============================================================================

function testSleepQuality(): void {
  console.log("\n=== SLEEP QUALITY TESTS ===\n");

  assertEquals(getSleepQuality(5.0), "POOR", "5h = POOR");
  assertEquals(getSleepQuality(6.4), "POOR", "6.4h = POOR");
  assertEquals(getSleepQuality(6.5), "ADEQUATE", "6.5h = ADEQUATE");
  assertEquals(getSleepQuality(7.0), "ADEQUATE", "7.0h = ADEQUATE");
  assertEquals(getSleepQuality(7.5), "OPTIMAL", "7.5h = OPTIMAL");
  assertEquals(getSleepQuality(8.0), "OPTIMAL", "8.0h = OPTIMAL");
  assertEquals(getSleepQuality(9.0), "OPTIMAL", "9.0h = OPTIMAL");
  assertEquals(getSleepQuality(9.5), "ADEQUATE", "9.5h = ADEQUATE");
  assertEquals(getSleepQuality(10.0), "ADEQUATE", "10.0h = ADEQUATE");
}

// ============================================================================
// CONSECUTIVE POOR NIGHTS TESTS
// ============================================================================

function testConsecutivePoorNights(): void {
  console.log("\n=== CONSECUTIVE POOR NIGHTS TESTS ===\n");

  // Test 1: No poor nights
  assertEquals(
    getConsecutivePoorNights([8.0, 7.5, 8.0]),
    0,
    "All good sleep = 0 poor nights",
  );

  // Test 2: One poor night
  assertEquals(
    getConsecutivePoorNights([6.0, 8.0, 7.5]),
    1,
    "One recent poor night = 1",
  );

  // Test 3: Two consecutive poor nights
  assertEquals(
    getConsecutivePoorNights([6.0, 6.0, 8.0]),
    2,
    "Two consecutive poor nights = 2",
  );

  // Test 4: Three consecutive poor nights
  assertEquals(
    getConsecutivePoorNights([6.0, 6.0, 6.0]),
    3,
    "Three consecutive poor nights = 3",
  );

  // Test 5: Poor night interrupted by good night
  assertEquals(
    getConsecutivePoorNights([6.0, 8.0, 6.0]),
    1,
    "Poor nights not consecutive = 1",
  );

  // Test 6: Empty array
  assertEquals(getConsecutivePoorNights([]), 0, "Empty array = 0");
}

// ============================================================================
// PROTEIN TARGET TESTS
// ============================================================================

function testProteinTarget(): void {
  console.log("\n=== PROTEIN TARGET TESTS ===\n");

  assertEquals(calculateProteinTarget(70), 140, "70kg × 2.0 = 140g protein");
  assertEquals(calculateProteinTarget(80), 160, "80kg × 2.0 = 160g protein");
  assertEquals(calculateProteinTarget(90), 180, "90kg × 2.0 = 180g protein");
  assertEquals(
    calculateProteinTarget(75.5),
    151,
    "75.5kg × 2.0 = 151g protein (rounded)",
  );
}

// ============================================================================
// SESSION DURATION TESTS
// ============================================================================

function testSessionDuration(): void {
  console.log("\n=== SESSION DURATION TESTS ===\n");

  const start1 = "2025-01-19T10:00:00Z";
  const end1 = "2025-01-19T11:00:00Z";
  assertEquals(
    calculateSessionDuration(start1, end1),
    60,
    "1 hour = 60 minutes",
  );

  const start2 = "2025-01-19T10:00:00Z";
  const end2 = "2025-01-19T10:45:00Z";
  assertEquals(
    calculateSessionDuration(start2, end2),
    45,
    "45 minutes = 45 minutes",
  );

  const start3 = "2025-01-19T10:00:00Z";
  const end3 = "2025-01-19T11:30:00Z";
  assertEquals(
    calculateSessionDuration(start3, end3),
    90,
    "1.5 hours = 90 minutes",
  );
}

// ============================================================================
// CLEAN PERCENTAGE TESTS
// ============================================================================

function testCleanPercentage(): void {
  console.log("\n=== CLEAN PERCENTAGE TESTS ===\n");

  assertEquals(calculateCleanPercentage(5, 5), 100, "5/5 clean = 100%");
  assertEquals(calculateCleanPercentage(3, 5), 60, "3/5 clean = 60%");
  assertEquals(calculateCleanPercentage(0, 5), 0, "0/5 clean = 0%");
  assertEquals(calculateCleanPercentage(0, 0), 0, "0/0 clean = 0% (no sets)");
  assertEquals(calculateCleanPercentage(4, 5), 80, "4/5 clean = 80%");
}

// ============================================================================
// AVERAGE REPS TESTS
// ============================================================================

function testAverageReps(): void {
  console.log("\n=== AVERAGE REPS TESTS ===\n");

  assertEquals(calculateAverageReps(50, 5), 10.0, "50 reps / 5 sets = 10.0");
  assertEquals(calculateAverageReps(25, 5), 5.0, "25 reps / 5 sets = 5.0");
  assertEquals(calculateAverageReps(27, 5), 5.4, "27 reps / 5 sets = 5.4");
  assertEquals(calculateAverageReps(0, 0), 0, "0 reps / 0 sets = 0");
}

// ============================================================================
// VALIDATION TESTS
// ============================================================================

function testValidation(): void {
  console.log("\n=== VALIDATION TESTS ===\n");

  // Rest time validation
  assertEquals(validateRestTime(90), 90, "90s rest = valid");
  assertEquals(validateRestTime(10), 15, "10s rest = minimum 15s");
  assertEquals(validateRestTime(700), 600, "700s rest = maximum 600s");

  // Set count validation
  assertEquals(validateSetCount(5), 5, "5 sets = valid");
  assertEquals(validateSetCount(0), 1, "0 sets = minimum 1");
  assertEquals(validateSetCount(25), 20, "25 sets = maximum 20");

  // Rep count validation
  assertEquals(validateRepCount(10), 10, "10 reps = valid");
  assertEquals(validateRepCount(-5), 0, "-5 reps = minimum 0");
  assertEquals(validateRepCount(150), 100, "150 reps = maximum 100");

  // Sleep hours validation
  assertEquals(
    validateSleepHours(8.0),
    null,
    "8 hours sleep = valid (returns null)",
  );
  assert(
    validateSleepHours(25) !== null,
    "25 hours sleep = invalid (returns error)",
  );
  assert(
    validateSleepHours(-1) !== null,
    "-1 hours sleep = invalid (returns error)",
  );

  // Bodyweight validation
  assertEquals(
    validateBodyweight(80),
    null,
    "80kg bodyweight = valid (returns null)",
  );
  assert(
    validateBodyweight(20) !== null,
    "20kg bodyweight = invalid (returns error)",
  );
  assert(
    validateBodyweight(400) !== null,
    "400kg bodyweight = invalid (returns error)",
  );

  // Date validation
  assertEquals(
    validateDate("2025-01-19"),
    null,
    "Valid date format (returns null)",
  );
  assert(
    validateDate("2025-13-01") !== null,
    "Invalid month = invalid (returns error)",
  );
  assert(
    validateDate("19-01-2025") !== null,
    "Wrong format = invalid (returns error)",
  );

  // Water intake validation
  assertEquals(
    validateWaterIntake(4.0),
    null,
    "4L water = valid (returns null)",
  );
  assert(
    validateWaterIntake(20) !== null,
    "20L water = invalid (returns error)",
  );

  // Sodium intake validation
  assertEquals(
    validateSodiumIntake(5.0),
    null,
    "5g sodium = valid (returns null)",
  );
  assert(
    validateSodiumIntake(30) !== null,
    "30g sodium = invalid (returns error)",
  );

  // String sanitization
  assertEquals(
    sanitizeString("Normal text"),
    "Normal text",
    "Normal text unchanged",
  );
  assertEquals(
    sanitizeString("<script>alert('xss')</script>"),
    "scriptalert('xss')/script",
    "Script tags removed",
  );
  assertEquals(
    sanitizeString("Text with javascript:void(0)"),
    "Text with void(0)",
    "JavaScript protocol removed",
  );

  // UUID validation
  assert(
    isValidUUID("550e8400-e29b-41d4-a716-446655440000"),
    "Valid UUID format",
  );
  assert(!isValidUUID("not-a-uuid"), "Invalid UUID format");
  assert(!isValidUUID(""), "Empty string is not UUID");
}

// ============================================================================
// FORMATTING TESTS
// ============================================================================

function testFormatting(): void {
  console.log("\n=== FORMATTING TESTS ===\n");

  // Date formatting
  const testDate = new Date("2025-01-19T10:30:00Z");
  assertEquals(formatDate(testDate), "2025-01-19", "Date formatting");
  assertEquals(formatTime(testDate), "10:30", "Time formatting (HH:MM)");
  assertEquals(
    formatTimeWithSeconds(testDate),
    "10:30:00",
    "Time formatting (HH:MM:SS)",
  );

  // Duration formatting
  assertEquals(formatDuration(3661), "01:01:01", "Duration: 1h 1m 1s");
  assertEquals(formatDuration(90), "00:01:30", "Duration: 90 seconds");
  assertEquals(formatRestTime(90), "01:30", "Rest time: 90 seconds");
  assertEquals(formatRestTime(120), "02:00", "Rest time: 2 minutes");

  // Minutes formatting
  assertEquals(formatMinutes(45), "45m", "45 minutes");
  assertEquals(formatMinutes(60), "1h", "60 minutes");
  assertEquals(formatMinutes(90), "1h 30m", "90 minutes");
  assertEquals(formatMinutes(120), "2h", "120 minutes");

  // Salt/sodium conversions
  assertEquals(sodiumToSalt(4), 10.0, "4g sodium = 10g salt");
  assertEquals(saltToSodium(10), 4.0, "10g salt = 4g sodium");
  assertEquals(tspToSodiumMg(1), 2400, "1 tsp salt = 2400mg sodium");
  assertEquals(tspToSodiumMg(0.25), 600, "¼ tsp salt = 600mg sodium");

  // Sodium/salt display formatting
  assertEquals(formatSodium(4.5), "4.5g sodium", "Sodium display");
  assertEquals(formatSodium(0.6), "600mg sodium", "Sodium display (mg)");
  assertEquals(formatSalt(10.0), "10.0g salt", "Salt display");
  assertEquals(formatSaltInTeaspoons(1.5), "¼ tsp salt", "Salt in teaspoons");
  assertEquals(formatSaltInTeaspoons(3.0), "½ tsp salt", "Salt in teaspoons");
  assertEquals(formatSaltInTeaspoons(6.0), "1 tsp salt", "Salt in teaspoons");

  // Weight, distance, percentage
  assertEquals(formatWeight(80.5), "80.5kg", "Weight formatting");
  assertEquals(formatDistance(40), "40m", "Distance formatting");
  assertEquals(formatPercentage(85.7), "86%", "Percentage formatting");
  assertEquals(formatDecimal(5.678, 1), "5.7", "Decimal formatting (1 place)");
  assertEquals(
    formatDecimal(5.678, 2),
    "5.68",
    "Decimal formatting (2 places)",
  );

  // Status formatting
  assertEquals(
    formatReadinessStatus("READY"),
    "Ready",
    "Readiness status formatting",
  );
  assertEquals(
    formatReadinessStatus("VOLUME_REDUCED"),
    "Volume Reduced",
    "Readiness status formatting",
  );
  assertEquals(
    formatAppetiteStatus("NORMAL"),
    "Normal",
    "Appetite status formatting",
  );
  assertEquals(
    formatSorenessLevel("LIGHT"),
    "Light",
    "Soreness level formatting",
  );
  assertEquals(
    formatSessionFeel("CONTROLLED"),
    "Controlled",
    "Session feel formatting",
  );
  assertEquals(
    formatStopReason("CORE_FAILURE"),
    "Core failure",
    "Stop reason formatting",
  );
}

// ============================================================================
// EXERCISE RULES VALIDATION TESTS
// ============================================================================

function testExerciseRulesValidation(): void {
  console.log("\n=== EXERCISE RULES VALIDATION TESTS ===\n");

  const validExercises = [
    "Pull-Up",
    "Chin-Up",
    "Push-Up",
    "Bulgarian Split Squat",
  ];

  assertEquals(
    validateExerciseName("Pull-Up", validExercises),
    null,
    "Valid exercise name",
  );
  assert(
    validateExerciseName("Bench Press", validExercises) !== null,
    "Invalid exercise name returns error",
  );
  assert(
    validateExerciseName("", validExercises) !== null,
    "Empty exercise name returns error",
  );
}

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

function testEdgeCases(): void {
  console.log("\n=== EDGE CASE TESTS ===\n");

  // Readiness with boundary values
  const result1 = calculateReadiness(6.5, false, 0);
  assertEquals(
    result1.status,
    ReadinessStatus.READY,
    "Boundary: exactly 6.5h = READY",
  );

  const result2 = calculateReadiness(6.49, false, 0);
  assertEquals(
    result2.status,
    ReadinessStatus.VOLUME_REDUCED,
    "Boundary: 6.49h = VOLUME_REDUCED",
  );

  // Volume adjustment with 1 set
  const result3 = applyVolumeAdjustment(1, 35);
  assertEquals(result3.adjustedSets, 1, "Minimum 1 set even with reduction");

  // Clean percentage with no sets
  assertEquals(calculateCleanPercentage(0, 0), 0, "0/0 sets = 0%");

  // Average reps with no sets
  assertEquals(calculateAverageReps(0, 0), 0, "0 reps / 0 sets = 0");

  // Consecutive poor nights with single entry
  assertEquals(getConsecutivePoorNights([6.0]), 1, "Single poor night = 1");
  assertEquals(getConsecutivePoorNights([8.0]), 0, "Single good night = 0");

  // Sanitization edge cases
  assertEquals(sanitizeString(""), "", "Empty string sanitization");
  assertEquals(sanitizeString("   "), "", "Whitespace-only sanitization");

  // Date formatting with various inputs
  const date1 = new Date("2025-12-31T23:59:59Z");
  assertEquals(formatDate(date1), "2025-12-31", "Date formatting: year end");

  const date2 = new Date("2025-01-01T00:00:00Z");
  assertEquals(formatDate(date2), "2025-01-01", "Date formatting: year start");
}

// ============================================================================
// INTEGRATION TESTS (COMBINING MULTIPLE FUNCTIONS)
// ============================================================================

function testIntegration(): void {
  console.log("\n=== INTEGRATION TESTS ===\n");

  // Scenario 1: User with poor sleep trains with reduced volume
  const sleepHours = 6.0;
  const hasSharpPain = false;
  const consecutivePoorNights = 0;

  const readiness = calculateReadiness(
    sleepHours,
    hasSharpPain,
    consecutivePoorNights,
  );
  const volumeAdjustment = applyVolumeAdjustment(
    5,
    readiness.volumeAdjustmentPercent,
  );
  const sleepQuality = getSleepQuality(sleepHours);

  assertEquals(
    readiness.status,
    ReadinessStatus.VOLUME_REDUCED,
    "Integration: Poor sleep = VOLUME_REDUCED",
  );
  assertEquals(
    volumeAdjustment.adjustedSets,
    3,
    "Integration: 5 sets reduced to 3",
  );
  assertEquals(sleepQuality, "POOR", "Integration: Sleep quality = POOR");

  // Scenario 2: User with two consecutive poor nights
  const recentSleep = [6.0, 6.0, 8.0, 7.5];
  const consecutivePoor = getConsecutivePoorNights(recentSleep);
  const readiness2 = calculateReadiness(6.0, false, consecutivePoor);

  assertEquals(
    consecutivePoor,
    2,
    "Integration: Two consecutive poor nights detected",
  );
  assertEquals(
    readiness2.status,
    ReadinessStatus.NO_PROGRESSION,
    "Integration: Two poor nights = NO_PROGRESSION",
  );
  assertEquals(
    readiness2.allowTraining,
    false,
    "Integration: Training blocked",
  );

  // Scenario 3: Calculating session metrics
  const totalReps = 50;
  const totalSets = 5;
  const cleanSets = 4;

  const avgReps = calculateAverageReps(totalReps, totalSets);
  const cleanPct = calculateCleanPercentage(cleanSets, totalSets);

  assertEquals(avgReps, 10.0, "Integration: Average 10 reps per set");
  assertEquals(cleanPct, 80, "Integration: 80% clean sets");
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests(): void {
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  HUNTER-GATHERER APP - COMPREHENSIVE UNIT TEST SUITE         ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );

  testReadinessCalculation();
  testVolumeAdjustment();
  testSleepQuality();
  testConsecutivePoorNights();
  testProteinTarget();
  testSessionDuration();
  testCleanPercentage();
  testAverageReps();
  testValidation();
  testFormatting();
  testExerciseRulesValidation();
  testEdgeCases();
  testIntegration();

  console.log(
    "\n╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  TEST RESULTS                                                 ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );
  console.log(`\nTotal Tests: ${testsPassed + testsFailed}`);
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);

  if (testsFailed > 0) {
    console.log("\n❌ FAILED TESTS:");
    failedTests.forEach((test) => console.log(`  - ${test}`));
    console.log("\n⚠️  SOME TESTS FAILED - REVIEW IMPLEMENTATION\n");
  } else {
    console.log("\n🎉 ALL TESTS PASSED! 🎉\n");
  }
}

// ============================================================================
// EXECUTE TESTS
// ============================================================================

runAllTests();

// ============================================================================
// EXPORT FOR JEST (IF USING TEST RUNNER)
// ============================================================================

export {
  testReadinessCalculation,
  testVolumeAdjustment,
  testSleepQuality,
  testConsecutivePoorNights,
  testProteinTarget,
  testSessionDuration,
  testCleanPercentage,
  testAverageReps,
  testValidation,
  testFormatting,
  testExerciseRulesValidation,
  testEdgeCases,
  testIntegration,
};
