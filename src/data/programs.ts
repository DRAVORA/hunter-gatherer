import { Program, ProgramSession, ProgramExercise } from "../types";

// ============================================================================
// PROGRAM DEFINITIONS
// ============================================================================

/**
 * Sample Pull Session A
 * Focus: Vertical pulling + scapular control
 */
const PULL_SESSION_A: ProgramSession = {
  id: "pull-a",
  programId: "hunter-gatherer-basic",
  name: "Pull Session A",
  orderInProgram: 1,
  exercises: [
    {
      id: "pull-a-1",
      sessionId: "pull-a",
      exerciseName: "Scapular Pull-Up",
      orderInSession: 1,
      targetSets: 3,
      targetReps: 5,
      restTimeSeconds: 90,
    },
    {
      id: "pull-a-2",
      sessionId: "pull-a",
      exerciseName: "Pull-Up",
      orderInSession: 2,
      targetSets: 5,
      targetReps: 5,
      restTimeSeconds: 180,
    },
    {
      id: "pull-a-3",
      sessionId: "pull-a",
      exerciseName: "Barbell Row",
      orderInSession: 3,
      targetSets: 4,
      targetReps: 8,
      restTimeSeconds: 120,
    },
    {
      id: "pull-a-4",
      sessionId: "pull-a",
      exerciseName: "Dead Hang",
      orderInSession: 4,
      targetSets: 3,
      targetDuration: 20, // seconds
      restTimeSeconds: 90,
    },
  ],
};

/**
 * Sample Push Session A
 * Focus: Horizontal + vertical pressing
 */
const PUSH_SESSION_A: ProgramSession = {
  id: "push-a",
  programId: "hunter-gatherer-basic",
  name: "Push Session A",
  orderInProgram: 2,
  exercises: [
    {
      id: "push-a-1",
      sessionId: "push-a",
      exerciseName: "Push-Up",
      orderInSession: 1,
      targetSets: 5,
      targetReps: 10,
      restTimeSeconds: 120,
    },
    {
      id: "push-a-2",
      sessionId: "push-a",
      exerciseName: "Pike Push-Up",
      orderInSession: 2,
      targetSets: 4,
      targetReps: 8,
      restTimeSeconds: 120,
    },
    {
      id: "push-a-3",
      sessionId: "push-a",
      exerciseName: "Overhead Press",
      orderInSession: 3,
      targetSets: 4,
      targetReps: 8,
      restTimeSeconds: 180,
    },
  ],
};

/**
 * Sample Legs Session A
 * Focus: Squat + hinge patterns
 */
const LEGS_SESSION_A: ProgramSession = {
  id: "legs-a",
  programId: "hunter-gatherer-basic",
  name: "Legs Session A",
  orderInProgram: 3,
  exercises: [
    {
      id: "legs-a-1",
      sessionId: "legs-a",
      exerciseName: "Bodyweight Squat",
      orderInSession: 1,
      targetSets: 3,
      targetReps: 15,
      restTimeSeconds: 90,
    },
    {
      id: "legs-a-2",
      sessionId: "legs-a",
      exerciseName: "Bulgarian Split Squat",
      orderInSession: 2,
      targetSets: 4,
      targetReps: 10,
      restTimeSeconds: 120,
    },
    {
      id: "legs-a-3",
      sessionId: "legs-a",
      exerciseName: "Romanian Deadlift",
      orderInSession: 3,
      targetSets: 4,
      targetReps: 8,
      restTimeSeconds: 180,
    },
    {
      id: "legs-a-4",
      sessionId: "legs-a",
      exerciseName: "Glute Bridge",
      orderInSession: 4,
      targetSets: 3,
      targetReps: 15,
      restTimeSeconds: 90,
    },
  ],
};

/**
 * Sample Pull Session B
 * Focus: Chin-ups + horizontal rows
 */
const PULL_SESSION_B: ProgramSession = {
  id: "pull-b",
  programId: "hunter-gatherer-basic",
  name: "Pull Session B",
  orderInProgram: 4,
  exercises: [
    {
      id: "pull-b-1",
      sessionId: "pull-b",
      exerciseName: "Chin-Up",
      orderInSession: 1,
      targetSets: 5,
      targetReps: 5,
      restTimeSeconds: 180,
    },
    {
      id: "pull-b-2",
      sessionId: "pull-b",
      exerciseName: "Dumbbell Row",
      orderInSession: 2,
      targetSets: 4,
      targetReps: 10,
      restTimeSeconds: 120,
    },
    {
      id: "pull-b-3",
      sessionId: "pull-b",
      exerciseName: "High Pull-Up Hold",
      orderInSession: 3,
      targetSets: 3,
      targetDuration: 15, // seconds
      restTimeSeconds: 120,
    },
    {
      id: "pull-b-4",
      sessionId: "pull-b",
      exerciseName: "Farmer Carry",
      orderInSession: 4,
      targetSets: 3,
      targetDistance: 40, // metres
      restTimeSeconds: 120,
    },
  ],
};

/**
 * Sample Push Session B
 * Focus: Bench + dips
 */
const PUSH_SESSION_B: ProgramSession = {
  id: "push-b",
  programId: "hunter-gatherer-basic",
  name: "Push Session B",
  orderInProgram: 5,
  exercises: [
    {
      id: "push-b-1",
      sessionId: "push-b",
      exerciseName: "Bench Press",
      orderInSession: 1,
      targetSets: 5,
      targetReps: 5,
      restTimeSeconds: 180,
    },
    {
      id: "push-b-2",
      sessionId: "push-b",
      exerciseName: "Dips",
      orderInSession: 2,
      targetSets: 4,
      targetReps: 8,
      restTimeSeconds: 150,
    },
    {
      id: "push-b-3",
      sessionId: "push-b",
      exerciseName: "Push-Up (Feet Elevated)",
      orderInSession: 3,
      targetSets: 3,
      targetReps: 12,
      restTimeSeconds: 120,
    },
  ],
};

/**
 * Sample Legs Session B
 * Focus: Unilateral + glute emphasis
 */
const LEGS_SESSION_B: ProgramSession = {
  id: "legs-b",
  programId: "hunter-gatherer-basic",
  name: "Legs Session B",
  orderInProgram: 6,
  exercises: [
    {
      id: "legs-b-1",
      sessionId: "legs-b",
      exerciseName: "Barbell Back Squat",
      orderInSession: 1,
      targetSets: 5,
      targetReps: 5,
      restTimeSeconds: 210,
    },
    {
      id: "legs-b-2",
      sessionId: "legs-b",
      exerciseName: "Lunges",
      orderInSession: 2,
      targetSets: 3,
      targetReps: 12,
      restTimeSeconds: 120,
    },
    {
      id: "legs-b-3",
      sessionId: "legs-b",
      exerciseName: "Hip Thrust",
      orderInSession: 3,
      targetSets: 4,
      targetReps: 10,
      restTimeSeconds: 120,
    },
  ],
};

/**
 * Core Session (Optional add-on)
 * Focus: Anti-extension + anti-rotation
 */
const CORE_SESSION: ProgramSession = {
  id: "core-a",
  programId: "hunter-gatherer-basic",
  name: "Core Session",
  orderInProgram: 7,
  exercises: [
    {
      id: "core-a-1",
      sessionId: "core-a",
      exerciseName: "Hollow Body Hold",
      orderInSession: 1,
      targetSets: 3,
      targetDuration: 20, // seconds
      restTimeSeconds: 60,
    },
    {
      id: "core-a-2",
      sessionId: "core-a",
      exerciseName: "Dead Bug",
      orderInSession: 2,
      targetSets: 3,
      targetReps: 10,
      restTimeSeconds: 60,
    },
    {
      id: "core-a-3",
      sessionId: "core-a",
      exerciseName: "Side Plank",
      orderInSession: 3,
      targetSets: 3,
      targetDuration: 20, // seconds per side
      restTimeSeconds: 60,
    },
    {
      id: "core-a-4",
      sessionId: "core-a",
      exerciseName: "Hanging Leg Raise",
      orderInSession: 4,
      targetSets: 3,
      targetReps: 8,
      restTimeSeconds: 90,
    },
  ],
};

// ============================================================================
// PROGRAM: HUNTER-GATHERER BASIC
// ============================================================================

export const HUNTER_GATHERER_BASIC: Program = {
  id: "hunter-gatherer-basic",
  name: "Hunter-Gatherer Basic",
  description:
    "Foundational strength program emphasizing execution quality, injury prevention, and controlled fatigue management. Suitable for returning lifters rebuilding capacity.",
  sessions: [
    PULL_SESSION_A,
    PUSH_SESSION_A,
    LEGS_SESSION_A,
    PULL_SESSION_B,
    PUSH_SESSION_B,
    LEGS_SESSION_B,
    CORE_SESSION,
  ],
};

// ============================================================================
// ALL PROGRAMS
// ============================================================================

export const PROGRAMS: Program[] = [HUNTER_GATHERER_BASIC];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get program by ID
 */
export function getProgramById(programId: string): Program | null {
  return PROGRAMS.find((p) => p.id === programId) || null;
}

/**
 * Get session by ID
 */
export function getSessionById(sessionId: string): ProgramSession | null {
  for (const program of PROGRAMS) {
    const session = program.sessions.find((s) => s.id === sessionId);
    if (session) return session;
  }
  return null;
}

/**
 * Get all sessions for a program
 */
export function getSessionsForProgram(programId: string): ProgramSession[] {
  const program = getProgramById(programId);
  return program?.sessions || [];
}

/**
 * Get exercises for a session
 */
export function getExercisesForSession(sessionId: string): ProgramExercise[] {
  const session = getSessionById(sessionId);
  return session?.exercises || [];
}

/**
 * Get total volume (sets) for a session
 */
export function getTotalVolumeForSession(sessionId: string): number {
  const exercises = getExercisesForSession(sessionId);
  return exercises.reduce((total, ex) => total + ex.targetSets, 0);
}

/**
 * Get estimated session duration (minutes)
 * Rough estimate: 45s per set + rest time
 */
export function getEstimatedSessionDuration(sessionId: string): number {
  const exercises = getExercisesForSession(sessionId);

  let totalSeconds = 0;

  exercises.forEach((ex) => {
    const setDuration = 45; // Average seconds per set
    const totalSetTime = setDuration * ex.targetSets;
    const totalRestTime = ex.restTimeSeconds * (ex.targetSets - 1); // No rest after last set
    totalSeconds += totalSetTime + totalRestTime;
  });

  // Add 5 minutes for transitions between exercises
  totalSeconds += exercises.length * 60;

  return Math.round(totalSeconds / 60); // Convert to minutes
}

/**
 * Get program summary
 */
export function getProgramSummary(programId: string): {
  name: string;
  totalSessions: number;
  avgSessionDuration: number;
  totalExercises: number;
} | null {
  const program = getProgramById(programId);
  if (!program) return null;

  const sessions = program.sessions;
  const totalSessions = sessions.length;

  const durations = sessions.map((s) => getEstimatedSessionDuration(s.id));
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / totalSessions;

  const totalExercises = sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0,
  );

  return {
    name: program.name,
    totalSessions,
    avgSessionDuration: Math.round(avgDuration),
    totalExercises,
  };
}
