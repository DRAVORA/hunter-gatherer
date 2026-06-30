import { Program, ProgramSession, ProgramExercise } from "../types";

export type { ProgramExercise };

const exercise = (
  sessionId: string,
  order: number,
  exerciseName: string,
  targetSets: number,
  restTimeSeconds: number,
  targets: Pick<
    ProgramExercise,
    "targetReps" | "targetDuration" | "targetDistance" | "targetDescription"
  >,
): ProgramExercise => ({
  id: `${sessionId}-${order}`,
  sessionId,
  exerciseName,
  orderInSession: order,
  targetSets,
  restTimeSeconds,
  ...targets,
});

// ============================================================================
// ATAVIA GYM PROGRAM
// ============================================================================

const GYM_DAY1_LOWER: ProgramSession = {
  id: "gym-day1",
  programId: "hunter-gatherer-gym",
  name: "Day 1: Lower Body",
  orderInProgram: 1,
  exercises: [
    exercise("gym-day1", 1, "Leg Press", 4, 180, {
      targetReps: 15,
      targetDescription: "10-15 reps",
    }),
    exercise("gym-day1", 2, "Bulgarian Split Squat", 3, 120, {
      targetReps: 12,
      targetDescription: "8-12 reps",
    }),
    exercise("gym-day1", 3, "Hamstring Curl", 3, 60, {
      targetReps: 15,
      targetDescription: "10-15 reps",
    }),
    exercise("gym-day1", 4, "Standing Calf Raise", 3, 60, {
      targetReps: 20,
      targetDescription: "12-20 reps",
    }),
    exercise("gym-day1", 5, "Hanging Leg Raise", 3, 60, {
      targetReps: 20,
      targetDescription: "10-20 reps",
    }),
  ],
};

const GYM_DAY2_PULL: ProgramSession = {
  id: "gym-day2",
  programId: "hunter-gatherer-gym",
  name: "Day 2: Pull",
  orderInProgram: 2,
  exercises: [
    exercise("gym-day2", 1, "Pull-Ups", 4, 180, {
      targetReps: 10,
      targetDescription: "6-10 reps",
    }),
    exercise("gym-day2", 2, "Chest Supported Row", 4, 120, {
      targetReps: 12,
      targetDescription: "8-12 reps",
    }),
    exercise("gym-day2", 3, "Chin-Ups", 3, 180, {
      targetReps: 10,
      targetDescription: "6-10 reps",
    }),
    exercise("gym-day2", 4, "Farmer Carry", 4, 90, {
      targetDistance: 40,
      targetDescription: "40 m",
    }),
    exercise("gym-day2", 5, "Dead Hang", 2, 90, {
      targetDuration: 60,
      targetDescription: "60 sec",
    }),
  ],
};

const GYM_DAY3_PUSH: ProgramSession = {
  id: "gym-day3",
  programId: "hunter-gatherer-gym",
  name: "Day 3: Push",
  orderInProgram: 3,
  exercises: [
    exercise("gym-day3", 1, "Incline Press", 4, 180, {
      targetReps: 10,
      targetDescription: "6-10 reps",
    }),
    exercise("gym-day3", 2, "Overhead Press", 3, 180, {
      targetReps: 12,
      targetDescription: "8-12 reps",
    }),
    exercise("gym-day3", 3, "Dips", 3, 120, {
      targetReps: 15,
      targetDescription: "8-15 reps",
    }),
    exercise("gym-day3", 4, "Lateral Raise", 4, 60, {
      targetReps: 20,
      targetDescription: "15-20 reps",
    }),
    exercise("gym-day3", 5, "Hollow Hold", 3, 60, {
      targetDuration: 60,
      targetDescription: "30-60 sec",
    }),
  ],
};

export const HUNTER_GATHERER_GYM: Program = {
  id: "hunter-gatherer-gym",
  name: "ATAVIA Gym",
  description:
    "Three-day gym program for durable strength, joint-friendly hypertrophy, grip, core control, and work capacity. Most sets stop with 1-2 reps in reserve.",
  sessions: [GYM_DAY1_LOWER, GYM_DAY2_PULL, GYM_DAY3_PUSH],
};

// ============================================================================
// ATAVIA NO-GYM PROGRAM
// ============================================================================

const NO_GYM_DAY1_PULL: ProgramSession = {
  id: "no-gym-day1",
  programId: "hunter-gatherer-no-gym",
  name: "Day 1: Pull + Grip",
  orderInProgram: 1,
  exercises: [
    exercise("no-gym-day1", 1, "Pull-Ups", 5, 180, {
      targetReps: 0,
      targetDescription: "AMRAP",
    }),
    exercise("no-gym-day1", 2, "Chin-Ups", 3, 180, {
      targetReps: 0,
      targetDescription: "AMRAP",
    }),
    exercise("no-gym-day1", 3, "Dead Hang", 2, 90, {
      targetDuration: 60,
      targetDescription: "60 sec",
    }),
  ],
};

const NO_GYM_DAY2_LEGS: ProgramSession = {
  id: "no-gym-day2",
  programId: "hunter-gatherer-no-gym",
  name: "Day 2: Legs + Hinge",
  orderInProgram: 2,
  exercises: [
    exercise("no-gym-day2", 1, "Bulgarian Split Squat", 4, 120, {
      targetReps: 15,
      targetDescription: "10-15 reps",
    }),
    exercise("no-gym-day2", 2, "Single Leg Hip Thrust", 4, 120, {
      targetReps: 15,
      targetDescription: "10-15 reps",
    }),
    exercise("no-gym-day2", 3, "Hamstring Walkout", 3, 60, {
      targetReps: 10,
      targetDescription: "10 reps",
    }),
    exercise("no-gym-day2", 4, "Wall Sit", 2, 90, {
      targetDuration: 0,
      targetDescription: "Max time",
    }),
  ],
};

const NO_GYM_DAY3_PUSH: ProgramSession = {
  id: "no-gym-day3",
  programId: "hunter-gatherer-no-gym",
  name: "Day 3: Push + Shoulders",
  orderInProgram: 3,
  exercises: [
    exercise("no-gym-day3", 1, "Feet Elevated Push-Up", 4, 120, {
      targetReps: 0,
      targetDescription: "AMRAP",
    }),
    exercise("no-gym-day3", 2, "Pike Push-Up", 4, 120, {
      targetReps: 15,
      targetDescription: "10-15 reps",
    }),
    exercise("no-gym-day3", 3, "Pseudo Planche Push-Up", 3, 120, {
      targetReps: 12,
      targetDescription: "8-12 reps",
    }),
    exercise("no-gym-day3", 4, "Side Plank", 3, 60, {
      targetDuration: 60,
      targetDescription: "60 sec per side",
    }),
  ],
};

const NO_GYM_DAY4_MOVEMENT: ProgramSession = {
  id: "no-gym-day4",
  programId: "hunter-gatherer-no-gym",
  name: "Day 4: Movement",
  orderInProgram: 4,
  exercises: [
    exercise("no-gym-day4", 1, "Hike", 1, 0, {
      targetDuration: 120 * 60,
      targetDescription: "60-120 minutes",
    }),
  ],
};

export const HUNTER_GATHERER_NO_GYM: Program = {
  id: "hunter-gatherer-no-gym",
  name: "ATAVIA No-Gym",
  description:
    "Four-day bodyweight program using pull-ups, single-leg work, push-up progressions, grip, and outdoor movement to build resilient capability without a gym.",
  sessions: [
    NO_GYM_DAY1_PULL,
    NO_GYM_DAY2_LEGS,
    NO_GYM_DAY3_PUSH,
    NO_GYM_DAY4_MOVEMENT,
  ],
};

// ============================================================================
// DAILY MOBILITY ROUTINE
// ============================================================================

const DAILY_MOBILITY_SESSION: ProgramSession = {
  id: "daily-mobility",
  programId: "atavia-daily-mobility",
  name: "Daily Mobility Routine",
  orderInProgram: 1,
  exercises: [
    exercise("daily-mobility", 1, "Deep Squat Hold", 2, 0, {
      targetDuration: 60,
      targetDescription: "30-60 sec",
    }),
    exercise("daily-mobility", 2, "Couch Stretch", 1, 0, {
      targetDuration: 60,
      targetDescription: "1 min each side",
    }),
    exercise("daily-mobility", 3, "90/90 Hip Rotations", 2, 0, {
      targetReps: 10,
      targetDescription: "10 each side",
    }),
    exercise("daily-mobility", 4, "Hamstring Stretch", 1, 0, {
      targetDuration: 60,
      targetDescription: "1 min each side",
    }),
    exercise("daily-mobility", 5, "Child's Pose With Side Reach", 1, 0, {
      targetDuration: 60,
      targetDescription: "1 min each side",
    }),
    exercise("daily-mobility", 6, "Thoracic Rotations", 2, 0, {
      targetReps: 10,
      targetDescription: "10 each side",
    }),
    exercise("daily-mobility", 7, "Dead Bug", 2, 0, {
      targetReps: 10,
      targetDescription: "10 each side",
    }),
    exercise("daily-mobility", 8, "Passive Hang", 2, 0, {
      targetDuration: 60,
      targetDescription: "30-60 sec",
    }),
  ],
};

export const ATAVIA_DAILY_MOBILITY: Program = {
  id: "atavia-daily-mobility",
  name: "ATAVIA Daily Mobility",
  description:
    "Daily mobility work for hips, hamstrings, thoracic rotation, trunk control, and overhead shoulder tolerance.",
  sessions: [DAILY_MOBILITY_SESSION],
};

// Keep this export for older code paths that import the original starter program.
export const HUNTER_GATHERER_BASIC = HUNTER_GATHERER_GYM;

export const PROGRAMS: Program[] = [
  HUNTER_GATHERER_NO_GYM,
  HUNTER_GATHERER_GYM,
  ATAVIA_DAILY_MOBILITY,
];

export function getProgramById(programId: string): Program | null {
  return PROGRAMS.find((p) => p.id === programId) || null;
}

export function getSessionById(sessionId: string): ProgramSession | null {
  for (const program of PROGRAMS) {
    const session = program.sessions.find((s) => s.id === sessionId);
    if (session) return session;
  }
  return null;
}

export function getSessionByProgramAndName(
  programName: string,
  sessionName: string,
): ProgramSession | null {
  const normalizedProgramName = programName.trim().toLowerCase();
  const normalizedSessionName = sessionName.trim().toLowerCase();

  for (const program of PROGRAMS) {
    if (program.name.trim().toLowerCase() !== normalizedProgramName) {
      continue;
    }

    const session = program.sessions.find(
      (item) => item.name.trim().toLowerCase() === normalizedSessionName,
    );

    if (session) return session;
  }

  return null;
}

export function getSessionsForProgram(programId: string): ProgramSession[] {
  const program = getProgramById(programId);
  return program?.sessions || [];
}

export function getExercisesForSession(sessionId: string): ProgramExercise[] {
  const session = getSessionById(sessionId);
  return session?.exercises || [];
}

export function getTotalVolumeForSession(sessionId: string): number {
  const exercises = getExercisesForSession(sessionId);
  return exercises.reduce((total, ex) => total + ex.targetSets, 0);
}

export function getEstimatedSessionDuration(sessionId: string): number {
  const exercises = getExercisesForSession(sessionId);
  let totalSeconds = 5 * 60;

  exercises.forEach((ex) => {
    const setDuration = ex.targetDuration && ex.targetDuration > 0
      ? Math.min(ex.targetDuration, 90)
      : 45;
    totalSeconds += setDuration * ex.targetSets;
    totalSeconds += ex.restTimeSeconds * Math.max(0, ex.targetSets - 1);
    totalSeconds += 60;
  });

  return Math.round(totalSeconds / 60);
}

export function getProgramSummary(programId: string): {
  name: string;
  totalSessions: number;
  avgSessionDuration: number;
  totalExercises: number;
} | null {
  const program = getProgramById(programId);
  if (!program) return null;

  const durations = program.sessions.map((s) => getEstimatedSessionDuration(s.id));
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);

  return {
    name: program.name,
    totalSessions: program.sessions.length,
    avgSessionDuration: Math.round(totalDuration / program.sessions.length),
    totalExercises: program.sessions.reduce(
      (sum, session) => sum + session.exercises.length,
      0,
    ),
  };
}
