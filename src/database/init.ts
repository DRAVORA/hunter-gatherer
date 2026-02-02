import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DB_NAME = "hunter_gatherer.db";
const DB_VERSION = 1;

let dbInstance: SQLite.SQLiteDatabase | null = null;

// ============================================================================
// INITIALIZE DATABASE
// ============================================================================

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    console.log("[DB] Initializing database...");

    // Open database connection
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable foreign keys
    await dbInstance.execAsync("PRAGMA foreign_keys = ON;");

    // Execute schema
    const schema = await loadSchema();
    await dbInstance.execAsync(schema);

    console.log("[DB] Database initialized successfully");
    console.log("[DB] Foreign keys enabled");

    // Verify schema version
    const version = await getCurrentSchemaVersion(dbInstance);
    console.log(`[DB] Schema version: ${version}`);

    return dbInstance;
  } catch (error) {
    console.error("[DB] Failed to initialize database:", error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

// ============================================================================
// GET DATABASE INSTANCE
// ============================================================================

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

// ============================================================================
// LOAD SCHEMA FROM FILE
// ============================================================================

async function loadSchema(): Promise<string> {
  try {
    // In production, schema should be bundled with the app
    // For now, we'll use the schema inline
    return getInlineSchema();
  } catch (error) {
    console.error("[DB] Failed to load schema:", error);
    throw error;
  }
}

// ============================================================================
// INLINE SCHEMA (FALLBACK)
// ============================================================================

function getInlineSchema(): string {
  // This is a copy of schema.sql as a string
  // In production, you'd use require() or import the .sql file
  return `
    -- APP SETTINGS TABLE (includes disclaimer acceptance)
    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY DEFAULT 'app_settings',
      disclaimer_accepted INTEGER NOT NULL DEFAULT 0,
      disclaimer_accepted_at TEXT,
      disclaimer_version TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Insert default app settings row if not exists
    INSERT OR IGNORE INTO app_settings (id, disclaimer_accepted, created_at, updated_at)
    VALUES ('app_settings', 0, datetime('now'), datetime('now'));

    -- Trigger to update app_settings updated_at
    CREATE TRIGGER IF NOT EXISTS trg_app_settings_updated_at
    AFTER UPDATE ON app_settings
    BEGIN
      UPDATE app_settings
      SET updated_at = datetime('now')
      WHERE id = NEW.id;
    END;

    -- USER PROFILE TABLE
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      bodyweight_kg REAL NOT NULL,
      nausea_prone_while_fasted INTEGER NOT NULL DEFAULT 0,
      target_protein_grams REAL NOT NULL,
      target_sodium_grams REAL NOT NULL,
      target_water_litres REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- DAILY CHECK-IN TABLE
    CREATE TABLE IF NOT EXISTS daily_checkin (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      sleep_hours REAL NOT NULL,
      morning_hydration_complete INTEGER NOT NULL DEFAULT 0,
      appetite_status TEXT NOT NULL,
      soreness_level TEXT NOT NULL,
      has_sharp_pain INTEGER NOT NULL DEFAULT 0,
      sharp_pain_location TEXT,
      readiness_status TEXT NOT NULL,
      volume_adjustment_percent REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_daily_checkin_date ON daily_checkin(date DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_checkin_readiness ON daily_checkin(readiness_status);

    -- TRAINING SESSION TABLE
    CREATE TABLE IF NOT EXISTS training_session (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      program_name TEXT NOT NULL,
      session_name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      planned_volume INTEGER NOT NULL,
      completed_volume INTEGER NOT NULL DEFAULT 0,
      volume_adjustment_applied REAL NOT NULL DEFAULT 0,
      pre_training_checklist_complete INTEGER NOT NULL DEFAULT 0,
      appetite_returned_within_60_min INTEGER,
      session_feel TEXT,
      compensation_notes TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_training_session_date ON training_session(date DESC);
    CREATE INDEX IF NOT EXISTS idx_training_session_program ON training_session(program_name);
    CREATE INDEX IF NOT EXISTS idx_training_session_start_time ON training_session(start_time DESC);

    -- EXERCISE SESSION TABLE
    CREATE TABLE IF NOT EXISTS exercise_session (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      order_in_session INTEGER NOT NULL,
      planned_sets INTEGER NOT NULL,
      completed_sets INTEGER NOT NULL DEFAULT 0,
      setup_viewed_on_first_set INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (session_id) REFERENCES training_session(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercise_session_session_id ON exercise_session(session_id);
    CREATE INDEX IF NOT EXISTS idx_exercise_session_exercise_name ON exercise_session(exercise_name);
    CREATE INDEX IF NOT EXISTS idx_exercise_session_order ON exercise_session(session_id, order_in_session);

    -- EXERCISE SET TABLE
    CREATE TABLE IF NOT EXISTS exercise_set (
      id TEXT PRIMARY KEY,
      exercise_session_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      target_reps INTEGER,
      clean_reps INTEGER NOT NULL,
      felt_clean INTEGER NOT NULL DEFAULT 0,
      stop_reason TEXT NOT NULL,
      rest_time_seconds INTEGER,
      weight REAL,
      duration INTEGER,
      distance REAL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (exercise_session_id) REFERENCES exercise_session(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercise_set_exercise_session_id ON exercise_set(exercise_session_id);
    CREATE INDEX IF NOT EXISTS idx_exercise_set_timestamp ON exercise_set(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_exercise_set_stop_reason ON exercise_set(stop_reason);

    -- HYDRATION LOG TABLE
    CREATE TABLE IF NOT EXISTS hydration_log (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      morning_complete INTEGER NOT NULL DEFAULT 0,
      pre_training_complete INTEGER NOT NULL DEFAULT 0,
      during_training_complete INTEGER NOT NULL DEFAULT 0,
      post_training_complete INTEGER NOT NULL DEFAULT 0,
      extra_salt_added INTEGER NOT NULL DEFAULT 0,
      total_water_litres REAL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hydration_log_date ON hydration_log(date DESC);

    -- SCHEMA VERSION TABLE
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    INSERT OR IGNORE INTO schema_version (version, applied_at) 
    VALUES (1, datetime('now'));

    -- VIEWS
    CREATE VIEW IF NOT EXISTS v_recent_checkins AS
    SELECT 
      id, date, sleep_hours, morning_hydration_complete,
      appetite_status, soreness_level, has_sharp_pain,
      sharp_pain_location, readiness_status,
      volume_adjustment_percent, notes, created_at,
      CASE 
        WHEN sleep_hours < 6.5 THEN 'POOR'
        WHEN sleep_hours >= 7.5 AND sleep_hours <= 9.0 THEN 'OPTIMAL'
        ELSE 'ADEQUATE'
      END as sleep_quality
    FROM daily_checkin
    ORDER BY date DESC;

    CREATE VIEW IF NOT EXISTS v_session_summary AS
    SELECT 
      ts.id, ts.date, ts.session_name, ts.start_time, ts.end_time,
      ts.completed_volume, ts.planned_volume, ts.session_feel,
      ts.compensation_notes,
      COUNT(DISTINCT es.id) as exercise_count,
      SUM(es.completed_sets) as total_completed_sets,
      CAST((julianday(ts.end_time) - julianday(ts.start_time)) * 24 * 60 AS INTEGER) as duration_minutes
    FROM training_session ts
    LEFT JOIN exercise_session es ON ts.id = es.session_id
    GROUP BY ts.id
    ORDER BY ts.start_time DESC;

    CREATE VIEW IF NOT EXISTS v_exercise_performance AS
    SELECT 
      ts.date, ts.session_name, es.exercise_name, es.completed_sets,
      SUM(ex.clean_reps) as total_clean_reps,
      AVG(ex.clean_reps) as avg_reps_per_set,
      SUM(CASE WHEN ex.felt_clean = 1 THEN 1 ELSE 0 END) as clean_set_count,
      CAST(SUM(CASE WHEN ex.felt_clean = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS INTEGER) as clean_percentage
    FROM training_session ts
    JOIN exercise_session es ON ts.id = es.session_id
    JOIN exercise_set ex ON es.id = ex.exercise_session_id
    GROUP BY ts.date, es.exercise_name
    ORDER BY ts.date DESC, es.order_in_session;

    -- TRIGGERS
    CREATE TRIGGER IF NOT EXISTS trg_update_completed_volume
    AFTER UPDATE OF completed_sets ON exercise_session
    BEGIN
      UPDATE training_session 
      SET completed_volume = (
        SELECT SUM(completed_sets) 
        FROM exercise_session 
        WHERE session_id = NEW.session_id
      )
      WHERE id = NEW.session_id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_user_profile_updated_at
    AFTER UPDATE ON user_profile
    BEGIN
      UPDATE user_profile 
      SET updated_at = datetime('now')
      WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_prevent_checkin_delete
    BEFORE DELETE ON daily_checkin
    BEGIN
      SELECT RAISE(ABORT, 'Cannot delete check-in: training session exists for this date')
      WHERE EXISTS (
        SELECT 1 FROM training_session 
        WHERE date = OLD.date
      );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_single_user_profile
    BEFORE INSERT ON user_profile
    BEGIN
      SELECT RAISE(ABORT, 'Only one user profile allowed')
      WHERE (SELECT COUNT(*) FROM user_profile) >= 1;
    END;
  `;
}

// ============================================================================
// GET CURRENT SCHEMA VERSION
// ============================================================================

async function getCurrentSchemaVersion(
  db: SQLite.SQLiteDatabase,
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      "SELECT MAX(version) as version FROM schema_version",
    );
    return result?.version || 0;
  } catch (error) {
    console.warn("[DB] Could not read schema version:", error);
    return 0;
  }
}

// ============================================================================
// CLOSE DATABASE
// ============================================================================

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
      dbInstance = null;
      console.log("[DB] Database closed");
    } catch (error) {
      console.error("[DB] Failed to close database:", error);
    }
  }
}

// ============================================================================
// DATABASE HEALTH CHECK
// ============================================================================

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  version: number;
  tableCount: number;
}> {
  try {
    const db = getDatabase();

    // Check schema version
    const version = await getCurrentSchemaVersion(db);

    // Count tables
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'",
    );
    const tableCount = result?.count || 0;

    const healthy = version === DB_VERSION && tableCount >= 5;

    return { healthy, version, tableCount };
  } catch (error) {
    console.error("[DB] Health check failed:", error);
    return { healthy: false, version: 0, tableCount: 0 };
  }
}

// ============================================================================
// RESET DATABASE (DEVELOPMENT ONLY)
// ============================================================================

export async function resetDatabase(): Promise<void> {
  if (__DEV__) {
    try {
      console.warn("[DB] Resetting database...");

      if (dbInstance) {
        await dbInstance.closeAsync();
        dbInstance = null;
      }

      // Delete database file
      // @ts-ignore - expo-file-system v19 type definition issue
      if (!FileSystem.documentDirectory) {
        throw new Error("FileSystem.documentDirectory is not available");
      }

      // @ts-ignore - expo-file-system v19 type definition issue
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(dbPath);
        console.log("[DB] Database file deleted");
      }

      // Reinitialize
      await initDatabase();
      console.log("[DB] Database reset complete");
    } catch (error) {
      console.error("[DB] Failed to reset database:", error);
      throw error;
    }
  } else {
    throw new Error("resetDatabase() is only available in development mode");
  }
}
