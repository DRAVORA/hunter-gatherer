-- ============================================================================
-- HUNTER-GATHERER TRAINING APP - DATABASE SCHEMA
-- ============================================================================
-- SQLite3 Schema
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- USER PROFILE TABLE
-- ============================================================================

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

-- ============================================================================
-- DAILY CHECK-IN TABLE
-- ============================================================================

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

CREATE INDEX idx_daily_checkin_date ON daily_checkin(date DESC);
CREATE INDEX idx_daily_checkin_readiness ON daily_checkin(readiness_status);

-- ============================================================================
-- TRAINING SESSION TABLE
-- ============================================================================

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

CREATE INDEX idx_training_session_date ON training_session(date DESC);
CREATE INDEX idx_training_session_program ON training_session(program_name);
CREATE INDEX idx_training_session_start_time ON training_session(start_time DESC);

-- ============================================================================
-- EXERCISE SESSION TABLE
-- ============================================================================

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

CREATE INDEX idx_exercise_session_session_id ON exercise_session(session_id);
CREATE INDEX idx_exercise_session_exercise_name ON exercise_session(exercise_name);
CREATE INDEX idx_exercise_session_order ON exercise_session(session_id, order_in_session);

-- ============================================================================
-- EXERCISE SET TABLE
-- ============================================================================

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

CREATE INDEX idx_exercise_set_exercise_session_id ON exercise_set(exercise_session_id);
CREATE INDEX idx_exercise_set_timestamp ON exercise_set(timestamp DESC);
CREATE INDEX idx_exercise_set_stop_reason ON exercise_set(stop_reason);

-- ============================================================================
-- HYDRATION LOG TABLE
-- ============================================================================

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

CREATE INDEX idx_hydration_log_date ON hydration_log(date DESC);

-- ============================================================================
-- SCHEMA VERSION TABLE (FOR MIGRATIONS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version, applied_at) 
VALUES (1, datetime('now'));

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Recent check-ins with calculated fields
CREATE VIEW IF NOT EXISTS v_recent_checkins AS
SELECT 
  id,
  date,
  sleep_hours,
  morning_hydration_complete,
  appetite_status,
  soreness_level,
  has_sharp_pain,
  sharp_pain_location,
  readiness_status,
  volume_adjustment_percent,
  notes,
  created_at,
  CASE 
    WHEN sleep_hours < 6.5 THEN 'POOR'
    WHEN sleep_hours >= 7.5 AND sleep_hours <= 9.0 THEN 'OPTIMAL'
    ELSE 'ADEQUATE'
  END as sleep_quality
FROM daily_checkin
ORDER BY date DESC;

-- View: Session summary with exercise counts
CREATE VIEW IF NOT EXISTS v_session_summary AS
SELECT 
  ts.id,
  ts.date,
  ts.session_name,
  ts.start_time,
  ts.end_time,
  ts.completed_volume,
  ts.planned_volume,
  ts.session_feel,
  ts.compensation_notes,
  COUNT(DISTINCT es.id) as exercise_count,
  SUM(es.completed_sets) as total_completed_sets,
  CAST((julianday(ts.end_time) - julianday(ts.start_time)) * 24 * 60 AS INTEGER) as duration_minutes
FROM training_session ts
LEFT JOIN exercise_session es ON ts.id = es.session_id
GROUP BY ts.id
ORDER BY ts.start_time DESC;

-- View: Exercise performance history
CREATE VIEW IF NOT EXISTS v_exercise_performance AS
SELECT 
  ts.date,
  ts.session_name,
  es.exercise_name,
  es.completed_sets,
  SUM(ex.clean_reps) as total_clean_reps,
  AVG(ex.clean_reps) as avg_reps_per_set,
  SUM(CASE WHEN ex.felt_clean = 1 THEN 1 ELSE 0 END) as clean_set_count,
  CAST(SUM(CASE WHEN ex.felt_clean = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS INTEGER) as clean_percentage
FROM training_session ts
JOIN exercise_session es ON ts.id = es.session_id
JOIN exercise_set ex ON es.id = ex.exercise_session_id
GROUP BY ts.date, es.exercise_name
ORDER BY ts.date DESC, es.order_in_session;

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================================================

-- Trigger: Update completed_volume on training_session when exercise_session changes
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

-- Trigger: Auto-update user_profile.updated_at
CREATE TRIGGER IF NOT EXISTS trg_user_profile_updated_at
AFTER UPDATE ON user_profile
BEGIN
  UPDATE user_profile 
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

-- Trigger: Prevent deletion of check-in if training session exists for that date
CREATE TRIGGER IF NOT EXISTS trg_prevent_checkin_delete
BEFORE DELETE ON daily_checkin
BEGIN
  SELECT RAISE(ABORT, 'Cannot delete check-in: training session exists for this date')
  WHERE EXISTS (
    SELECT 1 FROM training_session 
    WHERE date = OLD.date
  );
END;

-- ============================================================================
-- INITIAL DATA CONSTRAINTS
-- ============================================================================

-- Ensure only one user profile exists
CREATE TRIGGER IF NOT EXISTS trg_single_user_profile
BEFORE INSERT ON user_profile
BEGIN
  SELECT RAISE(ABORT, 'Only one user profile allowed')
  WHERE (SELECT COUNT(*) FROM user_profile) >= 1;
END;