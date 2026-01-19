import { ExerciseRules, ExerciseCategory } from "../types";

// ============================================================================
// GLOBAL EXECUTION RULES
// ============================================================================

export const GLOBAL_RULES = {
  cleanRepStandard: {
    title: "Clean Rep Standard",
    rules: [
      "Controlled throughout",
      "No momentum",
      "Core remains stable",
      "Form can be repeated",
      "No compensation patterns",
    ],
    emphasis: "If unsure → it does NOT count.",
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
      "If rep speed slows dramatically → load is too heavy",
      "If form degrades before final set → reduce load immediately",
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
      "If breathing is not calm by end of rest → extend rest 30–60s",
      "If rest must be extended repeatedly → reduce volume next session",
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
      "If first working set feels unstable → stop and downgrade session.",
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
    setup: [
      "Overhand grip, full thumb wrap",
      "Hands shoulder-width or slightly wider",
      "Dead hang start",
      "Ribs down, glutes lightly engaged",
    ],
    executionFocus: [
      "Pull shoulders down first",
      "Drive elbows down and back",
      "Lead with chest",
      "Chin must clear bar",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "During pull",
    },
    stopRules: [
      "Any swing or leg kick",
      "Chin fails to clear bar",
      "Shoulders shrug up",
      "Hard lumbar arch appears",
      "Elbows stop tracking back",
    ],
  },

  "Chin-Up": {
    name: "Chin-Up",
    category: ExerciseCategory.PULL,
    setup: [
      "Underhand grip, full thumb wrap",
      "Hands shoulder-width",
      "Dead hang start",
      "Ribs down, glutes on",
    ],
    executionFocus: [
      "Shoulders down first",
      "Pull elbows to ribs",
      "Chin over bar",
      "Controlled lower",
    ],
    breathing: {
      inhale: "Bottom position",
      exhale: "During pull",
    },
    stopRules: [
      "Swing or momentum",
      "Chin fails to clear",
      "Elbows dominate (bicep takeover)",
      "Shoulder pinch or click",
      "Loss of core tension",
    ],
  },

  "Scapular Pull-Up": {
    name: "Scapular Pull-Up",
    category: ExerciseCategory.PULL,
    setup: [
      "Overhand grip",
      "Arms stay straight",
      "Dead hang",
      "Ribs down, glutes on",
    ],
    executionFocus: [
      "Depress shoulders only",
      "No elbow bend",
      "Small, controlled rise (2-3cm)",
      "Pause 1 sec at top",
    ],
    breathing: {
      inhale: "Hang",
      exhale: "Depress shoulders",
    },
    stopRules: [
      "Any elbow bend",
      "Back arches",
      "Hip shaking or swinging",
      "Shoulders elevate instead of depress",
    ],
    scaling: {
      description: "Cluster sets or isometric holds",
      options: ["Cluster sets: 2 reps + 20–30s rest", "Isometric holds: 5–10s"],
    },
  },

  "High Pull-Up Hold": {
    name: "High Pull-Up Hold",
    category: ExerciseCategory.PULL,
    setup: [
      "Pull chin over bar",
      "Hold top position",
      "Ribs down",
      "Glutes engaged",
    ],
    executionFocus: [
      "Shoulders stay depressed",
      "Elbows back",
      "Chest to bar",
      "No sinking",
    ],
    breathing: {
      inhale: "Steady, controlled breaths",
      exhale: "Do not hold breath",
    },
    stopRules: [
      "Shoulders shrug up",
      "Neck strain appears",
      "Core collapses",
      "Sinking below chin-over-bar",
      "Breathing becomes laboured",
    ],
  },

  "Dead Hang": {
    name: "Dead Hang",
    category: ExerciseCategory.PULL,
    setup: [
      "Overhand grip",
      "Arms straight",
      "Shoulders slightly depressed (active)",
      "Ribs down",
    ],
    executionFocus: [
      "Maintain shoulder position",
      "No swinging",
      "Steady breathing",
      "Minimal movement",
    ],
    breathing: {
      inhale: "Steady, rhythmic",
      exhale: "Inhale/exhale through nose",
    },
    stopRules: [
      "Grip slipping",
      "Back tightness or pain",
      "Shoulder discomfort",
      "Hip shaking",
      "Breathing disrupted",
    ],
  },

  "Barbell Row": {
    name: "Barbell Row",
    category: ExerciseCategory.PULL,
    setup: [
      "Hip-width stance",
      "Hinge at hips (45° torso angle)",
      "Neutral spine",
      "Overhand or underhand grip",
    ],
    executionFocus: [
      "Pull bar to lower ribs",
      "Elbows stay close",
      "Drive elbows back, not up",
      "Torso angle stays constant",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "During pull",
    },
    stopRules: [
      "Back rounds",
      "Torso rises up",
      "Hips shift",
      "Momentum appears",
      "Elbows flare wide",
    ],
  },

  "Dumbbell Row": {
    name: "Dumbbell Row",
    category: ExerciseCategory.PULL,
    setup: [
      "One hand on bench",
      "Neutral spine",
      "Hip hinge maintained",
      "Non-working arm supports bodyweight",
    ],
    executionFocus: [
      "Pull dumbbell to hip",
      "Elbow stays close",
      "No torso rotation",
      "Shoulder blade retracts",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "During pull",
    },
    stopRules: [
      "Torso rotates",
      "Hip drops",
      "Shoulder elevation",
      "Momentum swing",
      "Back rounds",
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
    setup: [
      "Heavy dumbbells or kettlebells",
      "Tall posture",
      "Ribs down",
      "Shoulders packed",
    ],
    executionFocus: [
      "Walk slowly",
      "No lean to either side",
      "Steady breathing",
      "Maintain tall spine",
    ],
    breathing: {
      inhale: "Steady, rhythmic",
      exhale: "Do not hold breath",
    },
    stopRules: [
      "Grip fails",
      "Posture collapses",
      "Leaning appears",
      "Shoulders elevate",
      "Back rounds",
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
    setup: [
      "Feet on bench/box",
      "Hands under shoulders",
      "Body straight",
      "Increased forward lean",
    ],
    executionFocus: [
      "Same as standard push-up",
      "Control the increased load",
      "Chest to floor",
      "Full lockout at top",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pushing up",
    },
    stopRules: [
      "Hips sag",
      "Hips pike up",
      "Elbows flare wide (>45°)",
      "Loss of control on descent",
      "Incomplete lockout",
    ],
  },

  "Pike Push-Up": {
    name: "Pike Push-Up",
    category: ExerciseCategory.PUSH,
    setup: [
      "Hips high (inverted V)",
      "Hands shoulder-width",
      "Feet hip-width",
      "Head neutral",
    ],
    executionFocus: [
      "Lower head between hands",
      "Elbows track forward",
      "Push back to start",
      "Hips stay high",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pushing up",
    },
    stopRules: [
      "Hips drop",
      "Lumbar arch appears",
      "Head tilts back",
      "Elbows flare wide",
      "Loss of balance",
    ],
  },

  "Overhead Press": {
    name: "Overhead Press",
    category: ExerciseCategory.PUSH,
    setup: [
      "Standing, feet hip-width",
      "Bar at collarbone (barbell) or shoulders (dumbbell)",
      "Elbows slightly forward",
      "Ribs down, glutes on",
    ],
    executionFocus: [
      "Press straight up",
      "Head moves back slightly",
      "Lock out overhead",
      "Bar over midfoot at top",
    ],
    breathing: {
      inhale: "Start position",
      exhale: "During press",
    },
    stopRules: [
      "Back arches excessively",
      "Ribs flare",
      "Hips shift forward",
      "Elbows flare out",
      "Neck strain",
    ],
  },

  "Bench Press": {
    name: "Bench Press",
    category: ExerciseCategory.PUSH,
    setup: [
      "Feet flat on floor",
      "Shoulder blades retracted",
      "Slight arch in lower back",
      "Bar over chest",
    ],
    executionFocus: [
      "Lower bar to mid-chest",
      "Elbows 45° angle",
      "Drive through full foot",
      "Lock out at top",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pressing up",
    },
    stopRules: [
      "Shoulders roll forward",
      "Elbows flare wide",
      "Bar bounces off chest",
      "Loss of foot contact",
      "Ribs flare excessively",
    ],
  },

  Dips: {
    name: "Dips",
    category: ExerciseCategory.PUSH,
    setup: [
      "Straight-arm support",
      "Shoulders depressed",
      "Ribs down",
      "Slight forward lean",
    ],
    executionFocus: [
      "Lower until upper arms parallel to floor",
      "Elbows track back",
      "Push back to lockout",
      "Control descent",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Pushing up",
    },
    stopRules: [
      "Shoulders roll forward",
      "Sternum pain",
      "Elbows flare wide",
      "Swinging or momentum",
      "Incomplete lockout",
    ],
  },

  // ==========================================================================
  // LEGS / HINGE
  // ==========================================================================

  "Barbell Back Squat": {
    name: "Barbell Back Squat",
    category: ExerciseCategory.LEGS,
    setup: [
      "Bar on upper traps",
      "Feet shoulder-width",
      "Toes slightly out",
      "Ribs down, core braced",
    ],
    executionFocus: [
      "Push hips back first",
      "Knees track over toes",
      "Depth: hip crease below knee",
      "Drive through full foot",
    ],
    breathing: {
      inhale: "Top position (brace)",
      exhale: "After standing",
    },
    stopRules: [
      "Knees cave inward",
      "Heels lift",
      "Back rounds",
      "Ribs flare",
      "Depth not achieved",
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
    setup: [
      "Rear foot elevated on bench",
      "Front foot far enough forward",
      "Torso upright",
      "Ribs down",
    ],
    executionFocus: [
      "Lower straight down",
      "Front knee tracks over toes",
      "Drive through front heel",
      "Maintain tall torso",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Standing",
    },
    stopRules: [
      "Front knee caves in",
      "Torso leans forward excessively",
      "Balance lost",
      "Back knee crashes down",
      "Heel lifts",
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
    setup: [
      "Hip-width stance",
      "Bar at thighs",
      "Neutral spine",
      "Ribs down, glutes engaged",
    ],
    executionFocus: [
      "Push hips back",
      "Bar tracks down thighs",
      "Slight knee bend",
      "Drive hips forward to stand",
    ],
    breathing: {
      inhale: "Lowering",
      exhale: "Standing",
    },
    stopRules: [
      "Back rounds",
      "Bar drifts away from legs",
      "Knees bend excessively",
      "Hips shift sideways",
      "Loss of neutral spine",
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
    setup: [
      "Elbow under shoulder",
      "Feet stacked or staggered",
      "Body in straight line",
      "Hips lifted",
    ],
    executionFocus: [
      "Keep hips up",
      "Stack shoulders",
      "Engage obliques",
      "No sinking",
    ],
    breathing: {
      inhale: "Steady, controlled",
      exhale: "Do not hold breath",
    },
    stopRules: [
      "Hips sag",
      "Shoulder collapses forward",
      "Breathing laboured",
      "Opposite side engages",
      "Balance lost",
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
