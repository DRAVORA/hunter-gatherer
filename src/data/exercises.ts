import { ExerciseRules, ExerciseCategory } from "../types";

// ============================================================================
// GLOBAL EXECUTION RULES
// ============================================================================

export const GLOBAL_RULES = {
  globalExecutionLaw: {
    title: "Global Execution Law",
    rules: [
      "Every rep must look the same",
      "Slow and controlled beats heavy",
      "If form changes, the set ends",
      "If unsure whether a rep counted, it did not",
      "Finish feeling capable, not destroyed",
    ],
  },
  cleanRepStandard: {
    title: "Clean Rep Standard",
    rules: [
      "Controlled throughout",
      "No momentum",
      "Core remains stable",
      "Form can be repeated",
      "No compensation patterns",
    ],
    emphasis: "If unsure — it does NOT count.",
  },

  repDisqualification: {
    title: "Rep Disqualification",
    rules: [
      "Momentum initiated movement",
      "Core collapsed mid-rep",
      "Joint pain appeared",
      "Compensation took over",
      "Form broke before completion",
    ],
  },

  sessionStopSignals: {
    title: "Session Stop Signals",
    subtitle: "End the session immediately if:",
    rules: [
      "Appetite does not return within 60 min",
      "Dizziness or lightheadedness appears",
      "Repeated core failure across exercises",
      "Sharp pain in any joint",
      "Nausea begins",
    ],
  },

  executionDegradation: {
    title: "Execution Degradation Sequence",
    subtitle: "Watch for this pattern (stop before stage 4):",
    stages: [
      "Setup gets sloppy",
      "Breathing becomes erratic",
      "Compensation appears",
      "Systemic fatigue (back takes over, nausea, dizziness)",
    ],
  },

  loadSelection: {
    title: "Load Selection Rule",
    subtitle: "Choosing Weight:",
    rules: [
      "Choose a load you can complete all prescribed reps with 2 clean reps in reserve",
      "If rep speed slows dramatically — load is too heavy",
      "If form degrades before final set — reduce load immediately",
      "Never increase load in the same session",
    ],
    emphasis: "This prevents ego-loading and protects execution quality.",
  },

  restTimeEnforcement: {
    title: "Rest Time Enforcement Rule",
    subtitle: "Rest Between Sets:",
    rules: [
      "Rest exactly the prescribed time",
      "Do not shorten rest to 'push conditioning'",
      "If breathing is not calm by end of rest — extend rest 30–60s",
      "If rest must be extended repeatedly — reduce volume next session",
    ],
    emphasis: "Rest protects the nervous system and maintains quality.",
  },

  sessionEntry: {
    title: "Session Entry Rule",
    subtitle: "Before Starting Working Sets:",
    checklistTitle: "Begin working sets only when:",
    checklist: [
      "Breathing is calm",
      "Joints feel warm",
      "No sharp stiffness or discomfort",
      "Movement feels smooth",
    ],
    emphasis:
      "If first working set feels unstable — stop and downgrade session.",
    emphasisSubtitle: "This prevents forcing training on bad days.",
  },
};

// ============================================================================
// EXERCISE RULES DATABASE
// ============================================================================

export const EXERCISE_RULES: Record<string, ExerciseRules> = {
  // ==========================================================================
  // PULL / HANG / TRAPS
  // ==========================================================================

  "Pull-Up": {
    name: "Pull-Up",
    category: ExerciseCategory.PULL,
    overview:
      "A bodyweight vertical pull using an overhand grip from a dead hang.",
    why: "Builds primary upper-body pulling strength and shoulder control.",
    setup: [
      "Full grip",
      "Dead hang",
      "Ribs down",
      "Glutes lightly engaged",
    ],
    perform: [
      "Pull shoulders down",
      "Drive elbows to ribs",
      "Chin clears bar",
      "Lower under control",
    ],
    executionFocus: [
      "No swing",
      "Clean chin-over-bar",
      "Ribs stay down",
      "Lower under control",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "During pull",
    },
    selfCheck: ["No swing", "Clean chin-over-bar"],
    commonMistakes: ["Kipping", "Half reps"],
    stopRules: [
      "Swinging",
      "Lumbar arch",
    ],
  },

  "Chin-Up": {
    name: "Chin-Up",
    category: ExerciseCategory.PULL,
    overview:
      "A bodyweight vertical pull using an underhand grip from a dead hang.",
    why: "Builds upper-body pulling strength with increased biceps emphasis.",
    setup: [
      "Full grip",
      "Dead hang",
      "Ribs down",
      "Glutes lightly engaged",
    ],
    perform: [
      "Pull shoulders down",
      "Drive elbows to ribs",
      "Chin clears bar",
      "Lower under control",
    ],
    executionFocus: [
      "No swing",
      "Clean chin-over-bar",
      "Ribs stay down",
      "Lower under control",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "During pull",
    },
    selfCheck: ["No swing", "Clean chin-over-bar"],
    commonMistakes: ["Kipping", "Half reps"],
    stopRules: [
      "Swinging",
      "Lumbar arch",
    ],
  },

  "Scapular Pull-Up": {
    name: "Scapular Pull-Up",
    category: ExerciseCategory.PULL,
    overview:
      "A small-range pull-up that moves only the shoulders with straight elbows.",
    why: "Teaches shoulder depression needed for safe pulling strength.",
    setup: [
      "Dead hang",
      "Arms locked straight",
      "Ribs down",
    ],
    perform: [
      "Pull shoulders down only",
      "Rise a few centimetres",
      "Pause 1 second",
      "Lower slowly",
    ],
    executionFocus: [
      "Elbows stay perfectly straight",
      "Small, controlled rise",
      "No elbow bend",
      "Lower slowly",
    ],
    breathing: {
      inhale: "Return to hang",
      exhale: "Depress shoulders",
    },
    selfCheck: ["Elbows remain perfectly straight"],
    commonMistakes: ["Elbow bend", "Large movement"],
    stopRules: [
      "Any elbow bend",
      "Back arch",
    ],
    scaling: {
      description: "Cluster sets or isometric holds",
      options: ["Cluster sets: 2 reps + 20–30s rest", "Isometric holds: 5–10s"],
    },
  },

  "High Pull-Up Hold": {
    name: "High Pull-Up Hold",
    category: ExerciseCategory.PULL,
    overview: "An isometric hold at the top of a pull-up.",
    why: "Builds top-position strength and scapular control.",
    setup: [
      "Pull chin over bar",
      "Ribs down",
      "Glutes on",
    ],
    perform: [
      "Hold top position",
      "Shoulders stay down",
    ],
    executionFocus: [
      "Chin stays above bar",
      "Shoulders stay down",
    ],
    breathing: {
      inhale: "Steady breathing",
      exhale: "Steady breathing",
    },
    selfCheck: ["Chin stays above bar"],
    commonMistakes: ["Shrugging", "Neck strain"],
    stopRules: [
      "Dropping below bar",
    ],
  },

  "Dead Hang": {
    name: "Active Dead Hang",
    category: ExerciseCategory.PULL,
    overview:
      "An active dead hang with straight arms and slight shoulder depression.",
    why: "Builds shoulder tolerance and grip while restoring overhead posture.",
    setup: [
      "Step under bar",
      "Full thumb grip",
      "Arms straight",
      "Ribs down",
      "Light glute squeeze",
    ],
    perform: [
      "Hang still",
      "Shoulders gently pulled down",
      "No swinging",
      "Stay quiet",
    ],
    executionFocus: [
      "Shoulders stay down",
      "No swinging",
      "Quiet body",
      "Controlled hang",
    ],
    breathing: {
      inhale: "Slow nasal breathing throughout",
      exhale: "Slow nasal breathing throughout",
    },
    selfCheck: ["Shoulders stay down", "Breathing stays calm"],
    commonMistakes: ["Shrugging", "Swinging", "Holding breath"],
    stopRules: [
      "Grip slipping",
      "Back tightening",
      "Shoulders rising",
    ],
  },

  "Barbell Row": {
    name: "Barbell Row",
    category: ExerciseCategory.PULL,
    overview: "A hip-hinged row pulling a barbell to the lower ribs.",
    why: "Builds upper-back strength and reinforces posture.",
    setup: [
      "Hip hinge",
      "Neutral spine",
    ],
    perform: [
      "Pull to ribs",
      "Lower slowly",
    ],
    executionFocus: [
      "Torso stays still",
      "Pull to ribs",
      "Lower slowly",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "Pull to ribs",
    },
    selfCheck: ["Torso still"],
    commonMistakes: ["Jerking weight"],
    stopRules: [
      "Momentum",
    ],
  },

  "Dumbbell Row": {
    name: "Dumbbell Row",
    category: ExerciseCategory.PULL,
    overview: "A single-arm row braced on a bench or rack.",
    why: "Builds upper-back strength while reinforcing core stability.",
    setup: [
      "Hip hinge",
      "Neutral spine",
    ],
    perform: [
      "Pull to ribs",
      "Lower slowly",
    ],
    executionFocus: [
      "Torso stays still",
      "Pull to ribs",
      "Lower slowly",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "Pull to ribs",
    },
    selfCheck: ["Torso still"],
    commonMistakes: ["Jerking weight"],
    stopRules: [
      "Momentum",
    ],
  },

  Shrugs: {
    name: "Shrugs",
    category: ExerciseCategory.PULL,
    setup: [
      "Standing, feet hip-width",
      "Arms straight",
      "Neutral spine",
      "Shoulders relaxed down",
    ],
    executionFocus: [
      "Elevate shoulders only",
      "No head tilt",
      "Squeeze at top (1 sec)",
      "Controlled lower",
    ],
    breathing: {
      inhale: "Bottom",
      exhale: "Shrug up",
    },
    stopRules: [
      "Neck strain",
      "Head tilts back",
      "Bending elbows",
      "Hips shift",
      "Loss of control",
    ],
  },

  "Farmer Carry": {
    name: "Farmer Carry",
    category: ExerciseCategory.CARRY,
    overview: "A loaded walk carrying heavy implements at your sides.",
    why: "Builds grip, core, and posture under load.",
    setup: [
      "Heavy implements",
      "Tall posture",
    ],
    perform: [
      "Walk slowly",
      "Stay upright",
    ],
    executionFocus: [
      "No leaning",
      "Controlled pace",
    ],
    breathing: {
      inhale: "Steady nasal breathing",
      exhale: "Steady nasal breathing",
    },
    selfCheck: ["No leaning"],
    commonMistakes: ["Rushing"],
    stopRules: [
      "Grip failure",
    ],
  },

  // ==========================================================================
  // PUSH
  // ==========================================================================

  "Push-Up": {
    name: "Push-Up",
    category: ExerciseCategory.PUSH,
    setup: [
      "Hands under shoulders",
      "Body in straight line",
      "Feet together or hip-width",
      "Ribs down, glutes on",
    ],
    perform: [
      "Lower chest under control",
      "Press to full lockout",
    ],
    executionFocus: [
      "Lower chest to floor",
      "Elbows 45° angle",
      "Push through full ROM",
      "Body stays rigid",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pushing up",
    },
    stopRules: [
      "Hips sag",
      "Hips pike up",
      "Elbows flare wide (>45°)",
      "Neck cranes forward",
      "Shoulders shrug to ears",
    ],
  },

  "Push-Up (Feet Elevated)": {
    name: "Push-Up (Feet Elevated)",
    category: ExerciseCategory.PUSH,
    overview: "A push-up with feet elevated to increase loading.",
    why: "Builds primary horizontal pushing strength with added intensity.",
    setup: [
      "Feet on bench",
      "Hands under shoulders",
      "Body straight",
    ],
    perform: [
      "Lower chest",
      "Press to lockout",
    ],
    executionFocus: [
      "Body remains rigid",
      "Control the descent",
      "Full lockout",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Body remains rigid"],
    commonMistakes: ["Sagging hips"],
    stopRules: [
      "Loss of control",
    ],
  },

  "Pike Push-Up": {
    name: "Pike Push-Up",
    category: ExerciseCategory.PUSH,
    overview: "A vertical pressing pattern using an inverted V position.",
    why: "Builds vertical pressing strength without equipment.",
    setup: [
      "Hips high",
      "Hands under shoulders",
    ],
    perform: [
      "Lower head between hands",
      "Press back up",
    ],
    executionFocus: [
      "Hips stay high",
      "Lower head between hands",
      "Press back up",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Hips stay high"],
    commonMistakes: ["Lumbar arch"],
    stopRules: [
      "Back pain",
    ],
  },

  "Pseudo-Planche Push-Up": {
    name: "Pseudo-Planche Push-Up",
    category: ExerciseCategory.PUSH,
    setup: [
      "Hands at lower ribs level",
      "Fingers pointed back or to sides",
      "Body leans forward over hands",
      "Shoulders protracted",
    ],
    executionFocus: [
      "Maintain forward lean throughout",
      "Lower chest to floor",
      "Push back maintaining lean",
      "Core locked entire time",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pushing up",
    },
    stopRules: [
      "Forward lean lost",
      "Elbows flare wide",
      "Hips sag or pike",
      "Wrist pain",
      "Cannot maintain protraction",
    ],
  },

  "Overhead Press": {
    name: "Overhead Press",
    category: ExerciseCategory.PUSH,
    overview: "A standing press moving weight from shoulders to overhead.",
    why: "Builds vertical pushing strength and shoulder stability.",
    setup: [
      "Bar at shoulders",
      "Ribs down",
    ],
    perform: [
      "Press overhead",
      "Lock out",
    ],
    executionFocus: [
      "No back arch",
      "Press to lockout",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "Press",
    },
    selfCheck: ["No back arch"],
    commonMistakes: ["Leaning back"],
    stopRules: [
      "Lower-back pain",
    ],
  },

  "Bench Press": {
    name: "Bench Press",
    category: ExerciseCategory.PUSH,
    overview: "A horizontal press from a bench with feet planted.",
    why: "Builds primary horizontal pushing strength.",
    setup: [
      "Feet planted",
      "Shoulders set",
    ],
    perform: [
      "Lower to chest",
      "Press to lockout",
    ],
    executionFocus: [
      "Stable setup",
      "Controlled lower",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Stable setup"],
    commonMistakes: ["Bouncing bar"],
    stopRules: [
      "Shoulder pain",
    ],
  },

  Dips: {
    name: "Dips",
    category: ExerciseCategory.PUSH,
    overview: "A bodyweight press on parallel bars from support to depth.",
    why: "Builds compound pushing strength and shoulder stability.",
    setup: [
      "Support hold",
      "Shoulders down",
    ],
    perform: [
      "Lower under control",
      "Press up",
    ],
    executionFocus: [
      "Shoulders stay packed",
      "Controlled lowering",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Shoulders stay packed"],
    commonMistakes: ["Flaring elbows"],
    stopRules: [
      "Sternum pain",
    ],
  },

  // ==========================================================================
  // LEGS / HINGE
  // ==========================================================================

  "Barbell Back Squat": {
    name: "Barbell Back Squat",
    category: ExerciseCategory.LEGS,
    overview: "A barbell squat with the bar resting on the upper traps.",
    why: "Builds full lower-body strength and bracing capacity.",
    setup: [
      "Bar on upper traps",
      "Feet shoulder-width",
      "Brace core",
    ],
    perform: [
      "Sit down",
      "Reach depth",
      "Drive up",
    ],
    executionFocus: [
      "Balanced and controlled",
      "Consistent rep speed",
    ],
    breathing: {
      inhale: "Brace breath",
      exhale: "After standing",
    },
    selfCheck: ["Balanced and controlled"],
    commonMistakes: ["Rushing reps"],
    stopRules: [
      "Back rounds",
    ],
  },

  "Bodyweight Squat": {
    name: "Bodyweight Squat",
    category: ExerciseCategory.LEGS,
    setup: [
      "Feet shoulder-width",
      "Arms forward for balance",
      "Tall posture",
      "Ribs down",
    ],
    perform: [
      "Hips back then down",
      "Knees track toes",
      "Drive through full foot to stand",
    ],
    executionFocus: [
      "Hips back first",
      "Knees track toes",
      "Full depth if able",
      "Controlled tempo",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Standing",
    },
    stopRules: [
      "Knees cave inward",
      "Heels lift",
      "Back rounds",
      "Loss of balance",
      "Ribs flare",
    ],
  },

  "Bulgarian Split Squat": {
    name: "Bulgarian Split Squat",
    category: ExerciseCategory.LEGS,
    overview: "A single-leg squat with the rear foot elevated.",
    why: "Builds single-leg strength and balance.",
    setup: [
      "Rear foot elevated",
      "Torso upright",
    ],
    perform: [
      "Lower straight down",
      "Drive through front heel",
    ],
    executionFocus: [
      "Balance stays steady",
      "Torso stays upright",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Balance stays steady"],
    commonMistakes: ["Knee cave"],
    stopRules: [
      "Balance lost",
    ],
  },

  "Single-Leg Hip Thrust": {
    name: "Single-Leg Hip Thrust",
    category: ExerciseCategory.LEGS,
    setup: [
      "Upper back on bench",
      "One foot flat, hip-width from bench",
      "Other leg extended straight",
      "Ribs down",
    ],
    executionFocus: [
      "Drive through grounded heel only",
      "Squeeze glute at top",
      "Keep hips level",
      "Maintain neutral spine",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "Thrust up",
    },
    stopRules: [
      "Hips shift sideways",
      "Lumbar hyperextension",
      "Working knee caves in",
      "Ribs flare",
      "Balance lost",
    ],
  },

  Lunges: {
    name: "Lunges",
    category: ExerciseCategory.LEGS,
    setup: [
      "Start standing",
      "Long stride forward",
      "Back knee lowers toward floor",
      "Torso stays upright",
    ],
    executionFocus: [
      "Lower until back knee near floor",
      "Front knee tracks over toes",
      "Push through front heel",
      "Keep torso tall",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Standing",
    },
    stopRules: [
      "Front knee caves",
      "Torso leans forward",
      "Balance lost",
      "Front heel lifts",
      "Back knee crashes",
    ],
  },

  "Romanian Deadlift": {
    name: "Romanian Deadlift",
    category: ExerciseCategory.LEGS,
    overview: "A hip hinge that loads the hamstrings with a neutral spine.",
    why: "Builds posterior chain strength and hip-hinge control.",
    setup: [
      "Bar close",
      "Spine neutral",
    ],
    perform: [
      "Push hips back",
      "Stand tall",
    ],
    executionFocus: [
      "Hamstrings loaded",
      "Neutral spine",
    ],
    breathing: {
      inhale: "Down",
      exhale: "Up",
    },
    selfCheck: ["Hamstrings loaded"],
    commonMistakes: ["Rounding"],
    stopRules: [
      "Back pain",
    ],
  },

  "Hamstring Walkouts": {
    name: "Hamstring Walkouts",
    category: ExerciseCategory.LEGS,
    setup: [
      "Lie on back",
      "Heels on smooth surface or sliders",
      "Arms at sides for stability",
      "Hips lifted off ground",
    ],
    executionFocus: [
      "Walk heels away slowly",
      "Keep hips elevated parallel to ground",
      "Control the extension",
      "Pull heels back in",
    ],
    breathing: {
      inhale: "Walking out",
      exhale: "Pulling back",
    },
    stopRules: [
      "Hips drop below parallel",
      "Hamstring cramps",
      "Excessive back arch",
      "Loss of control",
      "Balance lost",
    ],
  },

  "Wall Sit": {
    name: "Wall Sit",
    category: ExerciseCategory.LEGS,
    overview: "An isometric hold with back against the wall at ~90° knees.",
    why: "Builds isometric leg endurance and postural control.",
    setup: [
      "Back to wall",
      "Knees ~90°",
    ],
    perform: ["Hold position", "Stay still"],
    executionFocus: [
      "Posture unchanged",
      "Stay still",
    ],
    breathing: {
      inhale: "Steady breathing",
      exhale: "Steady breathing",
    },
    selfCheck: ["Posture unchanged"],
    commonMistakes: ["Shifting weight"],
    stopRules: [
      "Knee pain",
    ],
  },

  "Hip Thrust": {
    name: "Hip Thrust",
    category: ExerciseCategory.LEGS,
    setup: [
      "Upper back on bench",
      "Feet flat, hip-width",
      "Barbell over hips (pad recommended)",
      "Ribs down",
    ],
    executionFocus: [
      "Drive through heels",
      "Squeeze glutes at top",
      "Maintain neutral spine",
      "Lower with control",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "Thrust up",
    },
    stopRules: [
      "Lumbar hyperextension",
      "Ribs flare",
      "Knees cave in",
      "Heels lift",
      "Momentum used",
    ],
  },

  "Glute Bridge": {
    name: "Glute Bridge",
    category: ExerciseCategory.LEGS,
    setup: [
      "Lie on back",
      "Feet flat, near glutes",
      "Arms at sides",
      "Ribs down",
    ],
    executionFocus: [
      "Drive through heels",
      "Squeeze glutes at top",
      "Shoulders to knees in line",
      "Lower with control",
    ],
    breathing: {
      inhale: "Bottom",
      exhale: "Bridge up",
    },
    stopRules: [
      "Lumbar hyperextension",
      "Knees cave in",
      "Pushing through toes",
      "Ribs flare",
      "Neck strain",
    ],
  },

  "Standing Calf Raise": {
    name: "Standing Calf Raise",
    category: ExerciseCategory.LEGS,
    setup: [
      "Balls of feet on edge of platform",
      "Heels hanging off",
      "Legs straight",
      "Weight on shoulders or in hands",
    ],
    executionFocus: [
      "Drive through balls of feet",
      "Full range of motion",
      "Squeeze at top",
      "Controlled descent",
    ],
    breathing: {
      inhale: "Bottom",
      exhale: "Raise up",
    },
    stopRules: [
      "Knees bend",
      "Balance lost",
      "Ankle rolls",
      "Bouncing at bottom",
      "Incomplete range",
    ],
  },

  // ==========================================================================
  // CORE / STABILITY
  // ==========================================================================

  "Hollow Body Hold": {
    name: "Hollow Body Hold",
    category: ExerciseCategory.CORE,
    setup: [
      "Lie on back",
      "Lower back pressed to floor",
      "Arms overhead, legs extended",
      "Ribs down",
    ],
    executionFocus: [
      "Maintain lower back contact",
      "Squeeze glutes",
      "Breathe steadily",
      "No arching",
    ],
    breathing: {
      inhale: "Shallow, steady breaths",
      exhale: "Do not hold breath",
    },
    stopRules: [
      "Lower back lifts",
      "Ribs flare",
      "Hip flexors cramp",
      "Breathing disrupted",
      "Neck strain",
    ],
  },

  "Dead Bug": {
    name: "Dead Bug",
    category: ExerciseCategory.CORE,
    setup: [
      "Lie on back",
      "Lower back pressed to floor",
      "Arms vertical, knees at 90°",
      "Ribs down",
    ],
    executionFocus: [
      "Extend opposite arm and leg",
      "Keep lower back down",
      "Controlled tempo",
      "Return to start",
    ],
    breathing: {
      inhale: "Returning",
      exhale: "Extending",
    },
    stopRules: [
      "Lower back arches",
      "Ribs flare",
      "Opposite side compensates",
      "Movement becomes jerky",
      "Breathing stops",
    ],
  },

  "Side Plank": {
    name: "Side Plank",
    category: ExerciseCategory.CORE,
    overview: "A lateral core hold supported on one elbow or hand.",
    why: "Builds lateral core stability and shoulder endurance.",
    setup: [
      "Elbow under shoulder",
      "Body straight",
    ],
    perform: ["Hold hips high"],
    executionFocus: [
      "No sagging",
      "Hips stay high",
    ],
    breathing: {
      inhale: "Steady breathing",
      exhale: "Steady breathing",
    },
    selfCheck: ["No sagging"],
    commonMistakes: ["Hip drop"],
    stopRules: [
      "Shoulder pain",
    ],
  },

  "Chin Tucks": {
    name: "Chin Tucks",
    category: ExerciseCategory.CORE,
    overview: "A neck alignment drill that glides the chin straight back.",
    why: "Restores neck alignment and reduces forward-head posture.",
    setup: [
      "Head supported on floor or wall",
      "Jaw relaxed",
    ],
    perform: [
      "Pull chin straight back",
      "Hold briefly",
      "Relax",
    ],
    executionFocus: [
      "Neck feels long",
      "No head tilt",
    ],
    breathing: {
      inhale: "Normal breathing",
      exhale: "Normal breathing",
    },
    selfCheck: ["Neck feels long, not strained"],
    commonMistakes: ["Tilting head", "Clenching jaw"],
    stopRules: [
      "Neck pain or tension",
    ],
  },

  "Hanging Leg Raise": {
    name: "Hanging Leg Raise",
    category: ExerciseCategory.CORE,
    setup: [
      "Dead hang on bar",
      "Shoulders slightly depressed",
      "Ribs down",
      "Legs straight or knees bent",
    ],
    executionFocus: [
      "Raise legs to 90° (or knees to chest)",
      "No swinging",
      "Lower with control",
      "Maintain shoulder position",
    ],
    breathing: {
      inhale: "Bottom",
      exhale: "Raising legs",
    },
    stopRules: [
      "Swinging appears",
      "Shoulders shrug up",
      "Back arches",
      "Momentum used",
      "Grip fails",
    ],
  },

  // ==========================================================================
  // CONDITIONING / CARDIO
  // ==========================================================================

  "Loaded Backpack Walk": {
    name: "Loaded Backpack Walk",
    category: ExerciseCategory.CARRY,
    setup: [
      "Backpack with 10-20kg load",
      "Worn properly on both shoulders",
      "60-90 minute duration",
    ],
    executionFocus: [
      "Nasal breathing only",
      "Steady sustainable pace",
      "Maintain upright posture",
    ],
    breathing: {
      inhale: "Through nose",
      exhale: "Through nose",
    },
    stopRules: [
      "Cannot maintain nasal breathing",
      "Back discomfort",
      "Posture degrades",
    ],
  },

  "Hill Sprints": {
    name: "Hill Sprints",
    category: ExerciseCategory.CARRY,
    setup: [
      "Hill with 5-10% grade",
      "8-12 sprints total",
      "Full walk-back recovery between reps",
    ],
    executionFocus: [
      "Full effort uphill",
      "Walk back down completely",
      "Start next rep when breathing recovered",
    ],
    breathing: {
      inhale: "Natural, forceful",
      exhale: "Natural, forceful",
    },
    stopRules: [
      "Form breaks down",
      "Cannot recover breathing",
      "Dizziness or nausea",
    ],
  },

  "Long Fast Walk": {
    name: "Long Fast Walk",
    category: ExerciseCategory.CARRY,
    setup: [
      "60 minute duration",
      "No phone, no music",
      "Brisk but sustainable pace",
    ],
    executionFocus: [
      "Can talk but breathing elevated",
      "Present and aware",
      "Relaxed shoulders",
    ],
    breathing: {
      inhale: "Natural",
      exhale: "Natural",
    },
    stopRules: ["Pace becomes unsustainable", "Sharp pain", "Extreme fatigue"],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get exercise rules by name
 */
export function getExerciseRules(exerciseName: string): ExerciseRules | null {
  return EXERCISE_RULES[exerciseName] || null;
}

/**
 * Get all exercises in a category
 */
export function getExercisesByCategory(
  category: ExerciseCategory,
): ExerciseRules[] {
  return Object.values(EXERCISE_RULES).filter((ex) => ex.category === category);
}

/**
 * Get all exercise names
 */
export function getAllExerciseNames(): string[] {
  return Object.keys(EXERCISE_RULES);
}

/**
 * Check if exercise exists
 */
export function exerciseExists(exerciseName: string): boolean {
  return exerciseName in EXERCISE_RULES;
}

/**
 * Get exercises by category as a grouped object
 */
export function getExercisesGroupedByCategory(): Record<
  ExerciseCategory,
  ExerciseRules[]
> {
  const grouped: Record<ExerciseCategory, ExerciseRules[]> = {
    [ExerciseCategory.PULL]: [],
    [ExerciseCategory.PUSH]: [],
    [ExerciseCategory.LEGS]: [],
    [ExerciseCategory.CORE]: [],
    [ExerciseCategory.CARRY]: [],
  };

  Object.values(EXERCISE_RULES).forEach((exercise) => {
    grouped[exercise.category].push(exercise);
  });

  return grouped;
}
