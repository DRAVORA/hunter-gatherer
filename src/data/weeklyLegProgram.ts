import { ExerciseCategory, ExerciseRules, Program } from "../types";

// Source: Weekly_Leg_Routine_ATFL.pdf. Kept separate from the A/B rotation.
export const WEEKLY_LEG_NOTES = [
  "Once per week. 12 working sets; approximately 35-45 minutes including warm-up.",
  "Warm up with 5 minutes of comfortable movement and 1-2 light sets before hip thrusts.",
  "Once tolerated, aim to finish working sets with 1-2 reps in reserve. When you reach the top of the rep range on every set with good form, increase the weight slightly.",
  "Walking without pain is encouraging but does not establish full ligament recovery. Keep your injured foot flat and stable. Avoid painful ankle positions; stop or reduce load if pain, giving way, or swelling occurs during training or the next day.",
  "Continue prescribed ankle mobility, strengthening and balance rehabilitation separately. Seek physiotherapy guidance before returning to more demanding lower-body loading.",
];

export const WEEKLY_LEGS: Program = {
  id: "weekly-legs",
  name: "Weekly Leg Routine",
  description: "Once per week | Glute, quad and hamstring development | ATFL-conscious",
  sessions: [{
    id: "weekly-legs-session",
    programId: "weekly-legs",
    name: "Weekly Leg Routine",
    orderInProgram: 1,
    exercises: [
      { exerciseName: "Hip Thrusts", targetReps: 12, targetDescription: "8-12 reps", restTimeSeconds: 120, restDescription: "2 min" },
      { exerciseName: "Leg Extensions", targetReps: 15, targetDescription: "10-15 reps", restTimeSeconds: 90, restDescription: "90 sec" },
      { exerciseName: "Seated Leg Curls", targetReps: 15, targetDescription: "10-15 reps", restTimeSeconds: 90, restDescription: "90 sec" },
    ].map((exercise, index) => ({
      ...exercise,
      id: `weekly-legs-${index + 1}`,
      sessionId: "weekly-legs-session",
      orderInSession: index + 1,
      targetSets: 4,
    })),
  }],
};

const guide = (name: string, setup: string[], perform: string[], targetMuscles: string[]): ExerciseRules => ({
  name,
  category: ExerciseCategory.LEGS,
  setup,
  perform,
  executionFocus: ["Keep your injured foot flat and stable", "Avoid painful ankle positions", "Use controlled repetitions"],
  breathing: { inhale: "During the controlled return", exhale: "During the effort" },
  stopRules: ["Pain", "Ankle giving way", "Swelling during training or the next day: stop or reduce load"],
  progression: [WEEKLY_LEG_NOTES[2]],
  targetMuscles,
});

export const WEEKLY_LEG_RULES: Record<string, ExerciseRules> = {
  "Hip Thrusts": guide("Hip Thrusts", [
    "Upper back against a stable bench",
    "Feet flat and about hip-to-shoulder width",
    "Brace your core and keep ribs down",
  ], [
    "Drive through the midfoot and heel",
    "At the top, squeeze your glutes without arching your lower back",
    "Lower under control",
  ], ["Glutes"]),
  "Leg Extensions": guide("Leg Extensions", [
    "Adjust the machine so your knees align with its pivot",
    "Keep the ankle relaxed in a comfortable position",
  ], [
    "Extend your knees smoothly",
    "Pause briefly, then lower slowly",
  ], ["Quads"]),
  "Seated Leg Curls": guide("Seated Leg Curls", [
    "Align your knees with the machine pivot",
    "Position the ankle pad comfortably",
  ], [
    "Curl through a pain-free range",
    "Squeeze your hamstrings, then return slowly",
  ], ["Hamstrings"]),
};
