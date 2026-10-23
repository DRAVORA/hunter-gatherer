import { Program, ExerciseRules, ExerciseCategory } from "../types";

// Transcribed from Updated_Upper_Body_AB_ATFL_Rehab.pdf, 23 October 2026.
export const ATFL_RECOVERY_NOTES = [
  "Upper-body lifts: keep 1-2 reps in reserve. Use controlled repetitions and avoid jumping down from pull-up bars.",
  "Ankle rehab: gentle, controlled range only. Since pointing the foot downward still hurts, do not force that end range; substitute seated calf raises for standing if needed.",
  "Rest days: 5-10 minutes of gentle ankle pumps and comfortable mobility. Reduce load if symptoms worsen or are increased the next morning.",
  "No running, jumping, pivoting or sport-specific cutting until clinically cleared. The supplied guide notes a reported retracted ATFL tear and possible associated bone injury, and recommends review by a sports physiotherapist or doctor before impact progression.",
  "This programme is a training guide, not a substitute for individual medical assessment."
];

export const UPPER_BODY_ATFL: Program = {
  id: "upper-body-atfl",
  name: "Upper Body A/B + ATFL Rehab",
  description: "Train every second day: A / rest / B / rest / repeat. Arm work replaces neck work; rehabilitation is the only lower-body training.",
  sessions: [
    {
      id: "atfl-a", programId: "upper-body-atfl", name: "Workout A - Pull / Press / Arms + ATFL", orderInProgram: 1,
      exercises: [
        {
          "id": "atfl-a-1",
          "sessionId": "atfl-a",
          "exerciseName": "Neutral-grip pull-ups",
          "orderInSession": 1,
          "targetSets": 3,
          "restTimeSeconds": 180,
          "restDescription": "2-3 min",
          "targetDescription": "5-8 reps",
          "targetReps": 8
        },
        {
          "id": "atfl-a-2",
          "sessionId": "atfl-a",
          "exerciseName": "Incline dumbbell press",
          "orderInSession": 2,
          "targetSets": 3,
          "restTimeSeconds": 180,
          "restDescription": "2-3 min",
          "targetDescription": "6-10 reps",
          "targetReps": 10
        },
        {
          "id": "atfl-a-3",
          "sessionId": "atfl-a",
          "exerciseName": "Cable lateral raises",
          "orderInSession": 3,
          "targetSets": 3,
          "restTimeSeconds": 60,
          "restDescription": "60 sec",
          "targetDescription": "12-20 reps",
          "targetReps": 20
        },
        {
          "id": "atfl-a-4",
          "sessionId": "atfl-a",
          "exerciseName": "Cable crunches",
          "orderInSession": 4,
          "targetSets": 3,
          "restTimeSeconds": 60,
          "restDescription": "60 sec",
          "targetDescription": "8-15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-a-5",
          "sessionId": "atfl-a",
          "exerciseName": "Incline dumbbell curls",
          "orderInSession": 5,
          "targetSets": 3,
          "restTimeSeconds": 90,
          "restDescription": "60-90 sec",
          "targetDescription": "8-12 reps",
          "targetReps": 12
        },
        {
          "id": "atfl-a-6",
          "sessionId": "atfl-a",
          "exerciseName": "Rope triceps pushdowns",
          "orderInSession": 6,
          "targetSets": 3,
          "restTimeSeconds": 90,
          "restDescription": "60-90 sec",
          "targetDescription": "10-15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-a-7",
          "sessionId": "atfl-a",
          "exerciseName": "ATFL: Band eversion",
          "orderInSession": 7,
          "targetSets": 3,
          "restTimeSeconds": 45,
          "restDescription": "45 sec",
          "targetDescription": "15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-a-8",
          "sessionId": "atfl-a",
          "exerciseName": "ATFL: Band dorsiflexion",
          "orderInSession": 8,
          "targetSets": 3,
          "restTimeSeconds": 45,
          "restDescription": "45 sec",
          "targetDescription": "15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-a-9",
          "sessionId": "atfl-a",
          "exerciseName": "ATFL: Seated calf raises",
          "orderInSession": 9,
          "targetSets": 3,
          "restTimeSeconds": 60,
          "restDescription": "60 sec",
          "targetDescription": "15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-a-10",
          "sessionId": "atfl-a",
          "exerciseName": "ATFL: Supported single-leg balance",
          "orderInSession": 10,
          "targetSets": 2,
          "restTimeSeconds": 30,
          "restDescription": "30 sec",
          "targetDescription": "30 sec",
          "targetDuration": 30
        },
      ],
    },
    {
      id: "atfl-b", programId: "upper-body-atfl", name: "Workout B - Row / Press / Arms + ATFL", orderInProgram: 2,
      exercises: [
        {
          "id": "atfl-b-1",
          "sessionId": "atfl-b",
          "exerciseName": "Chest-supported T-bar rows",
          "orderInSession": 1,
          "targetSets": 3,
          "restTimeSeconds": 180,
          "restDescription": "2-3 min",
          "targetDescription": "6-10 reps",
          "targetReps": 10
        },
        {
          "id": "atfl-b-2",
          "sessionId": "atfl-b",
          "exerciseName": "Incline dumbbell press",
          "orderInSession": 2,
          "targetSets": 3,
          "restTimeSeconds": 180,
          "restDescription": "2-3 min",
          "targetDescription": "6-10 reps",
          "targetReps": 10
        },
        {
          "id": "atfl-b-3",
          "sessionId": "atfl-b",
          "exerciseName": "Cable lateral raises",
          "orderInSession": 3,
          "targetSets": 3,
          "restTimeSeconds": 60,
          "restDescription": "60 sec",
          "targetDescription": "12-20 reps",
          "targetReps": 20
        },
        {
          "id": "atfl-b-4",
          "sessionId": "atfl-b",
          "exerciseName": "Supported abdominal exercise",
          "orderInSession": 4,
          "targetSets": 3,
          "restTimeSeconds": 60,
          "restDescription": "60 sec",
          "targetDescription": "8-15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-b-5",
          "sessionId": "atfl-b",
          "exerciseName": "Preacher curls",
          "orderInSession": 5,
          "targetSets": 3,
          "restTimeSeconds": 90,
          "restDescription": "60-90 sec",
          "targetDescription": "8-12 reps",
          "targetReps": 12
        },
        {
          "id": "atfl-b-6",
          "sessionId": "atfl-b",
          "exerciseName": "Overhead cable triceps extensions",
          "orderInSession": 6,
          "targetSets": 3,
          "restTimeSeconds": 90,
          "restDescription": "60-90 sec",
          "targetDescription": "10-15 reps",
          "targetReps": 15
        },
        {
          "id": "atfl-b-7",
          "sessionId": "atfl-b",
          "exerciseName": "ATFL: Supported double-leg calf raises",
          "orderInSession": 7,
          "targetSets": 3,
          "restTimeSeconds": 90,
          "restDescription": "60-90 sec",
          "targetDescription": "12 reps",
          "targetReps": 12
        },
        {
          "id": "atfl-b-8",
          "sessionId": "atfl-b",
          "exerciseName": "ATFL: Single-leg balance",
          "orderInSession": 8,
          "targetSets": 3,
          "restTimeSeconds": 30,
          "restDescription": "30 sec",
          "targetDescription": "30 sec",
          "targetDuration": 30
        },
        {
          "id": "atfl-b-9",
          "sessionId": "atfl-b",
          "exerciseName": "ATFL: Tandem balance",
          "orderInSession": 9,
          "targetSets": 2,
          "restTimeSeconds": 30,
          "restDescription": "30 sec",
          "targetDescription": "30 sec",
          "targetDuration": 30
        },
        {
          "id": "atfl-b-10",
          "sessionId": "atfl-b",
          "exerciseName": "ATFL: Knee-to-wall mobility",
          "orderInSession": 10,
          "targetSets": 2,
          "restTimeSeconds": 30,
          "restDescription": "20-30 sec",
          "targetDescription": "10 reps",
          "targetReps": 10
        },
      ],
    },
  ],
};

// The PDF supplies general execution notes, not individual technique instructions.
export const ATFL_EXERCISE_RULES: Record<string, ExerciseRules> = {};
for (const session of UPPER_BODY_ATFL.sessions) {
  for (const exercise of session.exercises) {
    const rehab = exercise.exerciseName.startsWith("ATFL:");
    ATFL_EXERCISE_RULES[exercise.exerciseName] = {
      name: exercise.exerciseName,
      category: rehab ? ExerciseCategory.MOBILITY : /crunch|abdominal/.test(exercise.exerciseName) ? ExerciseCategory.CORE : /pull-ups|rows|curls/.test(exercise.exerciseName) ? ExerciseCategory.PULL : ExerciseCategory.PUSH,
      overview: "From Upper Body A/B + ATFL Rehab (23 October 2026).",
      setup: [rehab ? ATFL_RECOVERY_NOTES[1] : ATFL_RECOVERY_NOTES[0]],
      executionFocus: [rehab ? "Gentle, controlled range only; do not force painful end range." : "Controlled repetitions; keep 1-2 reps in reserve."],
      breathing: { inhale: "Breathe comfortably", exhale: "Keep breathing throughout the movement" },
      stopRules: ["Sharp pain", "Joint pain worsens during the set"],
      progression: [ATFL_RECOVERY_NOTES[2], ATFL_RECOVERY_NOTES[3]],
      regression: exercise.exerciseName === "ATFL: Supported double-leg calf raises" ? ["Substitute seated calf raises for standing if needed."] : undefined,
    };
  }
}
