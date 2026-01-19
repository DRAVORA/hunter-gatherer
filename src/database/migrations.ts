import * as SQLite from "expo-sqlite";

// ============================================================================
// MIGRATION TYPES
// ============================================================================

interface Migration {
  version: number;
  name: string;
  up: string;
  down: string;
}

// ============================================================================
// MIGRATION REGISTRY
// ============================================================================

const MIGRATIONS: Migration[] = [
  // Version 1: Initial schema (handled by init.ts)
  // Future migrations will be added here
  // Example future migration:
  // {
  //   version: 2,
  //   name: 'add_exercise_notes_column',
  //   up: 'ALTER TABLE exercise_session ADD COLUMN detailed_notes TEXT;',
  //   down: 'ALTER TABLE exercise_session DROP COLUMN detailed_notes;'
  // }
];

// ============================================================================
// GET CURRENT VERSION
// ============================================================================

async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      "SELECT MAX(version) as version FROM schema_version",
    );
    return result?.version || 0;
  } catch (error) {
    console.error("[Migration] Failed to get current version:", error);
    return 0;
  }
}

// ============================================================================
// RUN MIGRATIONS
// ============================================================================

export async function runMigrations(
  db: SQLite.SQLiteDatabase,
): Promise<{ success: boolean; migrationsApplied: number; error?: string }> {
  try {
    const currentVersion = await getCurrentVersion(db);
    console.log(`[Migration] Current schema version: ${currentVersion}`);

    // Get pending migrations
    const pendingMigrations = MIGRATIONS.filter(
      (m) => m.version > currentVersion,
    ).sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      console.log("[Migration] No pending migrations");
      return { success: true, migrationsApplied: 0 };
    }

    console.log(
      `[Migration] Found ${pendingMigrations.length} pending migration(s)`,
    );

    // Run each migration in a transaction
    for (const migration of pendingMigrations) {
      console.log(
        `[Migration] Applying migration ${migration.version}: ${migration.name}`,
      );

      try {
        await db.withTransactionAsync(async () => {
          // Execute migration
          await db.execAsync(migration.up);

          // Record migration
          await db.runAsync(
            'INSERT INTO schema_version (version, applied_at) VALUES (?, datetime("now"))',
            [migration.version],
          );
        });

        console.log(`[Migration] Successfully applied: ${migration.name}`);
      } catch (error) {
        console.error(
          `[Migration] Failed to apply migration ${migration.version}:`,
          error,
        );
        throw new Error(
          `Migration ${migration.version} (${migration.name}) failed: ${error}`,
        );
      }
    }

    console.log(
      `[Migration] Successfully applied ${pendingMigrations.length} migration(s)`,
    );

    return {
      success: true,
      migrationsApplied: pendingMigrations.length,
    };
  } catch (error) {
    console.error("[Migration] Migration process failed:", error);
    return {
      success: false,
      migrationsApplied: 0,
      error: String(error),
    };
  }
}

// ============================================================================
// ROLLBACK MIGRATION (DEVELOPMENT ONLY)
// ============================================================================

export async function rollbackMigration(
  db: SQLite.SQLiteDatabase,
  targetVersion?: number,
): Promise<{ success: boolean; migrationsRolledBack: number; error?: string }> {
  if (!__DEV__) {
    throw new Error("Rollback is only available in development mode");
  }

  try {
    const currentVersion = await getCurrentVersion(db);
    const rollbackTo = targetVersion ?? currentVersion - 1;

    if (rollbackTo >= currentVersion) {
      console.log("[Migration] Nothing to rollback");
      return { success: true, migrationsRolledBack: 0 };
    }

    console.log(
      `[Migration] Rolling back from v${currentVersion} to v${rollbackTo}`,
    );

    // Get migrations to rollback (in reverse order)
    const migrationsToRollback = MIGRATIONS.filter(
      (m) => m.version > rollbackTo && m.version <= currentVersion,
    ).sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      console.log(
        `[Migration] Rolling back migration ${migration.version}: ${migration.name}`,
      );

      try {
        await db.withTransactionAsync(async () => {
          // Execute rollback
          await db.execAsync(migration.down);

          // Remove migration record
          await db.runAsync("DELETE FROM schema_version WHERE version = ?", [
            migration.version,
          ]);
        });

        console.log(`[Migration] Successfully rolled back: ${migration.name}`);
      } catch (error) {
        console.error(
          `[Migration] Failed to rollback migration ${migration.version}:`,
          error,
        );
        throw new Error(
          `Rollback of migration ${migration.version} (${migration.name}) failed: ${error}`,
        );
      }
    }

    console.log(
      `[Migration] Successfully rolled back ${migrationsToRollback.length} migration(s)`,
    );

    return {
      success: true,
      migrationsRolledBack: migrationsToRollback.length,
    };
  } catch (error) {
    console.error("[Migration] Rollback process failed:", error);
    return {
      success: false,
      migrationsRolledBack: 0,
      error: String(error),
    };
  }
}

// ============================================================================
// GET MIGRATION STATUS
// ============================================================================

export async function getMigrationStatus(db: SQLite.SQLiteDatabase): Promise<{
  currentVersion: number;
  latestVersion: number;
  pendingMigrations: number;
  appliedMigrations: Migration[];
  pendingMigrationsList: Migration[];
}> {
  try {
    const currentVersion = await getCurrentVersion(db);
    const latestVersion =
      MIGRATIONS.length > 0 ? Math.max(...MIGRATIONS.map((m) => m.version)) : 1;

    const appliedMigrations = MIGRATIONS.filter(
      (m) => m.version <= currentVersion,
    );

    const pendingMigrationsList = MIGRATIONS.filter(
      (m) => m.version > currentVersion,
    ).sort((a, b) => a.version - b.version);

    return {
      currentVersion,
      latestVersion,
      pendingMigrations: pendingMigrationsList.length,
      appliedMigrations,
      pendingMigrationsList,
    };
  } catch (error) {
    console.error("[Migration] Failed to get migration status:", error);
    throw error;
  }
}

// ============================================================================
// VALIDATE MIGRATIONS
// ============================================================================

export function validateMigrations(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate versions
  const versions = MIGRATIONS.map((m) => m.version);
  const uniqueVersions = new Set(versions);
  if (versions.length !== uniqueVersions.size) {
    errors.push("Duplicate migration versions detected");
  }

  // Check for gaps in version numbers
  const sortedVersions = [...versions].sort((a, b) => a - b);
  for (let i = 1; i < sortedVersions.length; i++) {
    if (sortedVersions[i] !== sortedVersions[i - 1] + 1) {
      errors.push(
        `Gap in migration versions: ${sortedVersions[i - 1]} to ${sortedVersions[i]}`,
      );
    }
  }

  // Check that all migrations have required fields
  for (const migration of MIGRATIONS) {
    if (!migration.name) {
      errors.push(`Migration ${migration.version} is missing a name`);
    }
    if (!migration.up) {
      errors.push(`Migration ${migration.version} is missing 'up' SQL`);
    }
    if (!migration.down) {
      errors.push(`Migration ${migration.version} is missing 'down' SQL`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// EXPORT MIGRATION UTILITIES
// ============================================================================

export const migrationUtils = {
  getCurrentVersion,
  runMigrations,
  rollbackMigration,
  getMigrationStatus,
  validateMigrations,
};
