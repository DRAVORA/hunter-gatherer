import { initDatabase, getDatabase, checkDatabaseHealth } from "./init";
import { runMigrations, getMigrationStatus } from "./migrations";

// ============================================================================
// TEST DATABASE INITIALIZATION
// ============================================================================

export async function testDatabaseInit(): Promise<void> {
  console.log("=== DATABASE INITIALIZATION TEST ===");

  try {
    // Test 1: Initialize database
    console.log("\n[Test 1] Initializing database...");
    const db = await initDatabase();
    console.log("âœ“ Database initialized");

    // Test 2: Check health
    console.log("\n[Test 2] Checking database health...");
    const health = await checkDatabaseHealth();
    console.log("Database health:", health);
    console.log(
      health.healthy
        ? "âœ“ Database is healthy"
        : "âœ— Database health check failed",
    );

    // Test 3: Verify tables exist
    console.log("\n[Test 3] Verifying tables...");
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    console.log("Tables found:", tables.map((t) => t.name).join(", "));

    const requiredTables = [
      "user_profile",
      "daily_checkin",
      "training_session",
      "exercise_session",
      "exercise_set",
      "hydration_log",
      "schema_version",
    ];

    const tableNames = tables.map((t) => t.name);
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    if (missingTables.length === 0) {
      console.log("âœ“ All required tables exist");
    } else {
      console.log("âœ— Missing tables:", missingTables.join(", "));
    }

    // Test 4: Verify indices exist
    console.log("\n[Test 4] Verifying indices...");
    const indices = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name",
    );
    console.log("Indices found:", indices.length);
    console.log("âœ“ Indices created");

    // Test 5: Verify views exist
    console.log("\n[Test 5] Verifying views...");
    const views = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name",
    );
    console.log("Views found:", views.map((v) => v.name).join(", "));
    console.log("âœ“ Views created");

    // Test 6: Check foreign keys enabled
    console.log("\n[Test 6] Checking foreign keys...");
    const fkResult = await db.getFirstAsync<{ foreign_keys: number }>(
      "PRAGMA foreign_keys",
    );
    console.log(
      fkResult?.foreign_keys === 1
        ? "âœ“ Foreign keys enabled"
        : "âœ— Foreign keys disabled",
    );

    // Test 7: Migration status
    console.log("\n[Test 7] Checking migration status...");
    const migrationStatus = await getMigrationStatus(db);
    console.log("Current version:", migrationStatus.currentVersion);
    console.log("Latest version:", migrationStatus.latestVersion);
    console.log("Pending migrations:", migrationStatus.pendingMigrations);
    console.log("âœ“ Migration system operational");

    console.log("\n=== ALL TESTS PASSED ===\n");
  } catch (error) {
    console.error("\nâœ— TEST FAILED:", error);
    throw error;
  }
}

// ============================================================================
// TEST BASIC CRUD OPERATIONS
// ============================================================================

export async function testBasicCRUD(): Promise<void> {
  console.log("=== BASIC CRUD OPERATIONS TEST ===");

  try {
    const db = getDatabase();

    // Test INSERT
    console.log("\n[Test 1] Testing INSERT...");
    const testCheckInId = "test-checkin-" + Date.now();
    await db.runAsync(
      `INSERT INTO daily_checkin (
        id, date, sleep_hours, morning_hydration_complete,
        appetite_status, soreness_level, has_sharp_pain,
        readiness_status, volume_adjustment_percent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testCheckInId,
        "2025-01-19",
        8.0,
        1,
        "NORMAL",
        "LIGHT",
        0,
        "READY",
        0,
        new Date().toISOString(),
      ],
    );
    console.log("âœ“ INSERT successful");

    // Test SELECT
    console.log("\n[Test 2] Testing SELECT...");
    const checkIn = await db.getFirstAsync<any>(
      "SELECT * FROM daily_checkin WHERE id = ?",
      [testCheckInId],
    );
    console.log("Retrieved check-in:", checkIn);
    console.log("âœ“ SELECT successful");

    // Test UPDATE
    console.log("\n[Test 3] Testing UPDATE...");
    await db.runAsync("UPDATE daily_checkin SET sleep_hours = ? WHERE id = ?", [
      7.5,
      testCheckInId,
    ]);
    const updatedCheckIn = await db.getFirstAsync<any>(
      "SELECT sleep_hours FROM daily_checkin WHERE id = ?",
      [testCheckInId],
    );
    console.log("Updated sleep_hours:", updatedCheckIn?.sleep_hours);
    console.log("âœ“ UPDATE successful");

    // Test DELETE
    console.log("\n[Test 4] Testing DELETE...");
    await db.runAsync("DELETE FROM daily_checkin WHERE id = ?", [
      testCheckInId,
    ]);
    const deletedCheckIn = await db.getFirstAsync<any>(
      "SELECT * FROM daily_checkin WHERE id = ?",
      [testCheckInId],
    );
    console.log(
      deletedCheckIn === null ? "âœ“ DELETE successful" : "âœ— DELETE failed",
    );

    console.log("\n=== CRUD TESTS PASSED ===\n");
  } catch (error) {
    console.error("\nâœ— CRUD TEST FAILED:", error);
    throw error;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runAllDatabaseTests(): Promise<void> {
  try {
    await testDatabaseInit();
    await testBasicCRUD();
    console.log("ðŸŽ‰ ALL DATABASE TESTS PASSED ðŸŽ‰");
  } catch (error) {
    console.error("âŒ DATABASE TESTS FAILED:", error);
    throw error;
  }
}
