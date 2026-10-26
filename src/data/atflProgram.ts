import { Program } from "../types";

// Source: Atavia_Upper_Body_AB_ATFL_Rehab_Updated.pdf.
export const ATFL_RECOVERY_NOTES = [
  "Train every second day: A / rest / B / rest / repeat. No conventional leg, abdominal or neck exercises.",
  "Upper body: use controlled repetitions with about 1-2 reps in reserve. When all sets reach the top of the rep range with clean form, increase load by the smallest practical amount. Avoid jumping down and unstable foot positioning.",
  "Ankle rehab: start light and prioritise movement quality. Aim for no more than mild discomfort (ideally 0-2/10), with no increase in pain, swelling or limping the following morning. If symptoms flare, reduce resistance, range or sets. Do not push through sharp pain or ankle giving way.",
  "Rest days: 5-10 minutes of comfortable ankle pumps and gentle mobility. Walking is acceptable if you can do it without a limp and symptoms remain stable. Elevate or use comfortable compression if swelling develops.",
  "The supplied guide records an ATFL tear on 27 September 2026, ongoing soreness when pointing the foot downward, and prior reports of ligament retraction and possible associated bone injury. Have a sports physiotherapist or sports doctor review the full MRI and examine the ankle before progressing to heavy loading, running, hopping or cutting. This plan is not a substitute for individual medical clearance."
];

export const ATFL_SUPERSET_NOTE = "Arm superset: alternate the curl and triceps exercise for 3 rounds. Allow 0-15 seconds to change stations, then rest 90 seconds after the triceps exercise.";

export const UPPER_BODY_ATFL: Program = {
  id: "upper-body-atfl",
  name: "Upper Body A/B + ATFL Rehab",
  description: "Every-second-day A/B rotation with upper-body lifts, a three-round arm superset and ATFL rehabilitation. No conventional leg, abdominal or neck exercises.",
  sessions: [
    {
      id: "atfl-a",
      programId: "upper-body-atfl",
      name: "Workout A - Pull / Press / Arms + ATFL",
      orderInProgram: 1,
      exercises: [
        {
          id: "atfl-a-1",
          sessionId: "atfl-a",
          exerciseName: "Neutral-grip pull-ups",
          orderInSession: 1,
          targetSets: 3,
          restTimeSeconds: 180,
          restDescription: "2-3 min",
          targetDescription: "5-8 reps",
          targetReps: 8
        },
        {
          id: "atfl-a-2",
          sessionId: "atfl-a",
          exerciseName: "Incline dumbbell press",
          orderInSession: 2,
          targetSets: 3,
          restTimeSeconds: 180,
          restDescription: "2-3 min",
          targetDescription: "6-10 reps",
          targetReps: 10
        },
        {
          id: "atfl-a-3",
          sessionId: "atfl-a",
          exerciseName: "Cable lateral raises",
          orderInSession: 3,
          targetSets: 3,
          restTimeSeconds: 60,
          restDescription: "60 sec",
          targetDescription: "12-20 reps",
          targetReps: 20
        },
        {
          id: "atfl-a-5",
          sessionId: "atfl-a",
          exerciseName: "Incline dumbbell curls",
          orderInSession: 4,
          targetSets: 3,
          restTimeSeconds: 15,
          restDescription: "0-15 sec to change stations",
          targetDescription: "8-12 reps",
          targetReps: 12,
          supersetId: "atfl-a-arms",
          supersetLabel: "A1"
        },
        {
          id: "atfl-a-6",
          sessionId: "atfl-a",
          exerciseName: "Rope triceps pushdowns",
          orderInSession: 5,
          targetSets: 3,
          restTimeSeconds: 90,
          restDescription: "90 sec after the pair",
          targetDescription: "10-15 reps",
          targetReps: 15,
          supersetId: "atfl-a-arms",
          supersetLabel: "A2"
        },
        {
          id: "atfl-a-7",
          sessionId: "atfl-a",
          exerciseName: "ATFL: Band eversion",
          orderInSession: 6,
          targetSets: 3,
          restTimeSeconds: 45,
          restDescription: "45 sec",
          targetDescription: "15 reps",
          targetReps: 15
        },
        {
          id: "atfl-a-8",
          sessionId: "atfl-a",
          exerciseName: "ATFL: Band dorsiflexion",
          orderInSession: 7,
          targetSets: 3,
          restTimeSeconds: 45,
          restDescription: "45 sec",
          targetDescription: "15 reps",
          targetReps: 15
        },
        {
          id: "atfl-a-9",
          sessionId: "atfl-a",
          exerciseName: "ATFL: Seated calf raises",
          orderInSession: 8,
          targetSets: 3,
          restTimeSeconds: 60,
          restDescription: "60 sec",
          targetDescription: "15 reps",
          targetReps: 15
        },
        {
          id: "atfl-a-10",
          sessionId: "atfl-a",
          exerciseName: "ATFL: Supported single-leg balance",
          orderInSession: 9,
          targetSets: 2,
          restTimeSeconds: 30,
          restDescription: "30 sec",
          targetDescription: "30 sec",
          targetDuration: 30
        }
      ]
    },
    {
      id: "atfl-b",
      programId: "upper-body-atfl",
      name: "Workout B - Row / Press / Arms + ATFL",
      orderInProgram: 2,
      exercises: [
        {
          id: "atfl-b-1",
          sessionId: "atfl-b",
          exerciseName: "Chest-supported T-bar rows",
          orderInSession: 1,
          targetSets: 3,
          restTimeSeconds: 180,
          restDescription: "2-3 min",
          targetDescription: "6-10 reps",
          targetReps: 10
        },
        {
          id: "atfl-b-2",
          sessionId: "atfl-b",
          exerciseName: "Incline dumbbell press",
          orderInSession: 2,
          targetSets: 3,
          restTimeSeconds: 180,
          restDescription: "2-3 min",
          targetDescription: "6-10 reps",
          targetReps: 10
        },
        {
          id: "atfl-b-3",
          sessionId: "atfl-b",
          exerciseName: "Cable lateral raises",
          orderInSession: 3,
          targetSets: 3,
          restTimeSeconds: 60,
          restDescription: "60 sec",
          targetDescription: "12-20 reps",
          targetReps: 20
        },
        {
          id: "atfl-b-5",
          sessionId: "atfl-b",
          exerciseName: "Preacher curls",
          orderInSession: 4,
          targetSets: 3,
          restTimeSeconds: 15,
          restDescription: "0-15 sec to change stations",
          targetDescription: "8-12 reps",
          targetReps: 12,
          supersetId: "atfl-b-arms",
          supersetLabel: "B1"
        },
        {
          id: "atfl-b-6",
          sessionId: "atfl-b",
          exerciseName: "Overhead cable triceps extensions",
          orderInSession: 5,
          targetSets: 3,
          restTimeSeconds: 90,
          restDescription: "90 sec after the pair",
          targetDescription: "10-15 reps",
          targetReps: 15,
          supersetId: "atfl-b-arms",
          supersetLabel: "B2"
        },
        {
          id: "atfl-b-7",
          sessionId: "atfl-b",
          exerciseName: "ATFL: Supported double-leg calf raises",
          orderInSession: 6,
          targetSets: 3,
          restTimeSeconds: 90,
          restDescription: "60-90 sec",
          targetDescription: "12 reps",
          targetReps: 12
        },
        {
          id: "atfl-b-8",
          sessionId: "atfl-b",
          exerciseName: "ATFL: Supported single-leg balance",
          orderInSession: 7,
          targetSets: 3,
          restTimeSeconds: 30,
          restDescription: "30 sec",
          targetDescription: "30 sec",
          targetDuration: 30
        },
        {
          id: "atfl-b-9",
          sessionId: "atfl-b",
          exerciseName: "ATFL: Tandem balance",
          orderInSession: 8,
          targetSets: 2,
          restTimeSeconds: 30,
          restDescription: "30 sec",
          targetDescription: "30 sec",
          targetDuration: 30
        },
        {
          id: "atfl-b-10",
          sessionId: "atfl-b",
          exerciseName: "ATFL: Knee-to-wall mobility",
          orderInSession: 9,
          targetSets: 2,
          restTimeSeconds: 30,
          restDescription: "20-30 sec",
          targetDescription: "10 reps",
          targetReps: 10
        }
      ]
    }
  ]
};

// Standalone session: combine the existing rehab blocks, keeping the first
// prescription for shared exercises (supported balance: 2 x 30 seconds).
const standaloneExercises = UPPER_BODY_ATFL.sessions
  .flatMap((session) => session.exercises)
  .filter((exercise) => exercise.exerciseName.startsWith("ATFL:"))
  .filter((exercise, index, exercises) =>
    exercises.findIndex((item) => item.exerciseName === exercise.exerciseName) === index,
  );

export const ATFL_STANDALONE: Program = {
  id: "atfl-standalone",
  name: "ATFL Rehab",
  description: "One complete ankle rehab session with band work, calf raises, balance and ankle mobility.",
  sessions: [{
    id: "atfl-standalone-session",
    programId: "atfl-standalone",
    name: "Complete ATFL Rehab",
    orderInProgram: 1,
    exercises: standaloneExercises.map((exercise, index) => ({
      ...exercise,
      id: `atfl-standalone-${index + 1}`,
      sessionId: "atfl-standalone-session",
      orderInSession: index + 1,
    })),
  }],
};

export const ATFL_STANDALONE_NOTES = [
  "One combined rehab session. Shared exercises are included once; supported single-leg balance is 2 x 30 seconds.",
  ...ATFL_RECOVERY_NOTES.slice(2),
];
