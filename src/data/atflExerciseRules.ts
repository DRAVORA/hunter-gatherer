import { ExerciseCategory, ExerciseRules } from "../types";
import { ATFL_RECOVERY_NOTES } from "./atflProgram";

// Setup and performance cues transcribed from the updated user-supplied PDF.
function guide(
  name: string,
  category: ExerciseCategory,
  setup: string[],
  perform: string[],
  executionFocus: string[],
): ExerciseRules {
  const rehab = name.startsWith("ATFL:");
  return {
    name,
    category,
    setup,
    perform,
    executionFocus,
    breathing: {
      inhale: "Breathe comfortably during the return or reset",
      exhale: "Keep breathing through the effort; do not hold your breath",
    },
    stopRules: rehab
      ? ["Sharp pain", "Ankle gives way", "Pain, swelling or limping increases"]
      : ["Sharp pain", "Nerve symptoms", "Joint pain worsens", "Unstable foot positioning", "Form breaks down"],
    progression: [ATFL_RECOVERY_NOTES[rehab ? 2 : 1]],
    regression: rehab
      ? ["If symptoms flare, reduce resistance, range or sets."]
      : ["Reduce the load to keep repetitions controlled with 1-2 reps in reserve."],
  };
}

export const ATFL_EXERCISE_RULES: Record<string, ExerciseRules> = {
  "Neutral-grip pull-ups": guide(
    "Neutral-grip pull-ups", ExerciseCategory.PULL,
    ["Use the neutral grips and a step to reach the bar.", "Start from a controlled hang and brace your torso."],
    ["Drive elbows toward your ribs to pull up.", "Lower slowly to a controlled hang.", "Use the step to get down; do not jump or drop onto the injured ankle."],
    ["Braced torso", "Controlled lowering", "No jumping or dropping from the bar"],
  ),
  "Incline dumbbell press": guide(
    "Incline dumbbell press", ExerciseCategory.PUSH,
    ["Set the bench to a low incline, about 15-30 degrees.", "Keep shoulder blades stable."],
    ["Lower dumbbells toward the upper chest under control.", "Press through a comfortable range.", "Avoid bouncing or excessive back arch."],
    ["Steady shoulder blades", "Controlled lowering", "Comfortable range"],
  ),
  "Cable lateral raises": guide(
    "Cable lateral raises", ExerciseCategory.PUSH,
    ["Stand supported if needed.", "Keep a soft bend in your elbow."],
    ["Lead with the upper arm and raise out to the side to roughly shoulder height.", "Pause near shoulder height.", "Lower slowly without swinging."],
    ["Minimal body movement", "Soft elbow", "Slow lowering"],
  ),
  "Incline dumbbell curls": guide(
    "Incline dumbbell curls", ExerciseCategory.PULL,
    ["Sit on an incline bench.", "Let arms hang slightly behind the torso."],
    ["Keep upper arms still and curl without swinging.", "Lower for 2-3 seconds.", "Move to rope triceps pushdowns after this set; allow 0-15 seconds to change stations."],
    ["Upper arms still", "No swinging", "2-3 second lowering"],
  ),
  "Rope triceps pushdowns": guide(
    "Rope triceps pushdowns", ExerciseCategory.PUSH,
    ["Perform immediately after incline dumbbell curls.", "Keep elbows tucked beside your body."],
    ["Extend your arms and separate the rope slightly at the bottom.", "Control the return.", "Rest 90 seconds after the set, then repeat the pair until all rounds are complete."],
    ["Elbows tucked", "Controlled return", "Rest after the pair"],
  ),
  "Chest-supported T-bar rows": guide(
    "Chest-supported T-bar rows", ExerciseCategory.PULL,
    ["Keep your chest against the pad.", "Use a controlled, stable position."],
    ["Pull elbows back without shrugging.", "A moderately flared elbow path increases upper-back involvement.", "Lower under control while keeping your chest supported."],
    ["Chest stays on pad", "No shrugging", "Controlled lowering"],
  ),
  "Preacher curls": guide(
    "Preacher curls", ExerciseCategory.PULL,
    ["Keep upper arms planted on the preacher pad."],
    ["Curl smoothly without jerking your elbows.", "Lower without fully relaxing at the bottom.", "Move to overhead cable triceps extensions; allow 0-15 seconds to change stations."],
    ["Upper arms stay on pad", "Smooth curls", "No elbow jerking"],
  ),
  "Overhead cable triceps extensions": guide(
    "Overhead cable triceps extensions", ExerciseCategory.PUSH,
    ["Perform immediately after preacher curls.", "Face away from the cable and choose a comfortable shoulder position."],
    ["Keep upper arms relatively still.", "Extend elbows smoothly and control the return.", "Rest 90 seconds after the set, then repeat the pair until all rounds are complete."],
    ["Comfortable shoulders", "Upper arms still", "Smooth elbow extension"],
  ),
  "ATFL: Band eversion": guide(
    "ATFL: Band eversion", ExerciseCategory.MOBILITY,
    ["Sit with a light resistance band positioned to resist outward foot movement.", "Keep your knee still."],
    ["Turn the sole gently outward against the band.", "Return over 2-3 seconds.", "Use a pain-free range."],
    ["Knee still", "Light band", "Gentle outward movement"],
  ),
  "ATFL: Band dorsiflexion": guide(
    "ATFL: Band dorsiflexion", ExerciseCategory.MOBILITY,
    ["Sit with a light band positioned to resist pulling the toes toward the shin."],
    ["Pull toes toward your shin against band tension.", "Pause briefly.", "Return slowly."],
    ["Light resistance", "Brief pause", "Slow return"],
  ),
  "ATFL: Seated calf raises": guide(
    "ATFL: Seated calf raises", ExerciseCategory.MOBILITY,
    ["Sit with feet flat to start."],
    ["Raise heels gently.", "Lower for 2-3 seconds.", "Avoid forcing the painful pointed-toe position."],
    ["Gentle heel raise", "2-3 second lowering", "Do not force painful end range"],
  ),
  "ATFL: Supported single-leg balance": guide(
    "ATFL: Supported single-leg balance", ExerciseCategory.MOBILITY,
    ["Stand on the injured leg beside a sturdy support or countertop.", "Use fingertip or light hand support as required."],
    ["Keep pelvis level, with foot and knee aligned.", "Keep the foot steady and use support to prevent wobbling.", "Stop if the ankle gives way."],
    ["Level pelvis", "Foot and knee aligned", "Support within reach"],
  ),
  "ATFL: Supported double-leg calf raises": {
    ...guide(
      "ATFL: Supported double-leg calf raises", ExerciseCategory.MOBILITY,
      ["Hold a sturdy support with both feet on the ground."],
      ["Rise evenly through both feet.", "Lower slowly.", "Use seated calf raises instead if pointing the foot down is painful."],
      ["Even pressure", "Stable support", "Slow lowering"],
    ),
    regression: ["Use seated calf raises instead if pointing the foot down is painful.", "If symptoms flare, reduce resistance, range or sets."],
  },
  "ATFL: Tandem balance": guide(
    "ATFL: Tandem balance", ExerciseCategory.MOBILITY,
    ["Stand heel-to-toe beside a stable surface."],
    ["Maintain posture and steady pressure through both feet.", "Hold for the prescribed time.", "Switch foot position between sets."],
    ["Steady pressure through both feet", "Stable surface nearby", "Switch front foot between sets"],
  ),
  "ATFL: Knee-to-wall mobility": guide(
    "ATFL: Knee-to-wall mobility", ExerciseCategory.MOBILITY,
    ["Position your foot facing a wall and keep the heel down."],
    ["Guide the knee forward over the toes toward the wall.", "Return under control.", "Use a comfortable range; do not force the joint."],
    ["Heel stays down", "Knee follows toes", "Comfortable range"],
  ),
};
