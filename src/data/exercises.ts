import { ExerciseRules, ExerciseCategory } from "../types";

// ============================================================================
// GLOBAL EXECUTION RULES
// ============================================================================

export const GLOBAL_RULES = {
  warmUp: {
    title: "Warm-Up",
    rules: [
      "5 minutes light movement before every session",
      "1-2 ramp-up sets before the first loaded exercise",
    ],
  },
  intensity: {
    title: "Intensity",
    rules: [
      "Most sets finish with 1-2 reps in reserve",
      "No grinding reps",
      "Every rep must look repeatable",
    ],
  },
  painRule: {
    title: "Pain Rule",
    rules: [
      "Stop immediately for sharp pain",
      "Stop immediately for nerve symptoms",
      "Stop if back pain alters mechanics",
      "Stop if joint pain worsens during the set",
    ],
  },
  progression: {
    title: "Progression",
    rules: [
      "When all sets reach the top of the rep range, increase load next session",
      "If recovery is poor, reduce volume by 30% and do not chase progression",
    ],
  },
};

type MovementInput = Omit<ExerciseRules, "breathing"> & {
  breathing?: ExerciseRules["breathing"];
};

const DEFAULT_STOP_RULES = [
  "Sharp pain",
  "Nerve symptoms",
  "Back pain alters mechanics",
  "Joint pain worsens during the set",
  "Form changes enough that the next rep would not match the first",
];

function movement(input: MovementInput): ExerciseRules {
  return {
    breathing: {
      inhale: "During the easier phase or reset",
      exhale: "During the effort while keeping the ribs stacked",
    },
    ...input,
    stopRules: input.stopRules.length > 0 ? input.stopRules : DEFAULT_STOP_RULES,
  };
}

function resolveAlias(exerciseName: string): string {
  const aliases: Record<string, string> = {
    "Pull-Ups": "Pull-Up",
    "Chin-Ups": "Chin-Up",
    "Push-Up (Feet Elevated)": "Feet Elevated Push-Up",
    "Pseudo-Planche Push-Up": "Pseudo Planche Push-Up",
    "Single-Leg Hip Thrust": "Single Leg Hip Thrust",
    "Hamstring Walkouts": "Hamstring Walkout",
    "Hollow Body Hold": "Hollow Hold",
    "Active Dead Hang": "Dead Hang",
    "Passive Dead Hang": "Passive Hang",
    "Long Fast Walk": "Hike",
    "Loaded Backpack Walk": "Hike",
  };

  return aliases[exerciseName] ?? exerciseName;
}

// ============================================================================
// EXERCISE RULES DATABASE
// ============================================================================

export const EXERCISE_RULES: Record<string, ExerciseRules> = {
  "Leg Press": movement({
    name: "Leg Press",
    category: ExerciseCategory.LEGS,
    overview: "A stable lower-body press for building legs without loading the spine heavily.",
    why: "Develops usable leg strength while keeping execution controlled and repeatable.",
    setup: ["Feet shoulder-width on platform", "Lower back stays on pad", "Knees track over toes", "Unlock safeties only when braced"],
    perform: ["Lower under control", "Stop before pelvis tucks", "Drive through the full foot", "Finish without locking knees hard"],
    executionFocus: ["Stable pelvis", "Knees track cleanly", "Smooth tempo", "No bouncing at the bottom"],
    commonMistakes: ["Too much depth with pelvic tuck", "Knees collapsing inward", "Bouncing", "Locking out aggressively"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add load next session when every set reaches 15 clean reps with 1-2 reps in reserve"],
    regression: ["Reduce range of motion", "Use a lighter load", "Use fewer sets on poor recovery days"],
    targetMuscles: ["Quads", "Glutes", "Adductors", "Calves"],
    hunterGathererBenefit: "Builds climbing, crouching, rising, and terrain-moving strength with low spinal cost.",
  }),

  "Bulgarian Split Squat": movement({
    name: "Bulgarian Split Squat",
    category: ExerciseCategory.LEGS,
    overview: "A rear-foot elevated single-leg squat.",
    why: "Builds unilateral leg strength, hip stability, and knee control.",
    setup: ["Rear foot elevated", "Front foot far enough to keep balance", "Tall torso", "Brace before descending"],
    perform: ["Lower slowly", "Front knee tracks over toes", "Drive through front foot", "Stand without twisting"],
    executionFocus: ["Quiet balance", "Level hips", "Controlled depth", "No push from rear leg"],
    commonMistakes: ["Front foot too close", "Bouncing", "Torso twisting", "Knee collapsing inward"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add load next session when all sets reach the top of the rep range cleanly"],
    regression: ["Use bodyweight", "Hold a support lightly", "Use a shorter range of motion"],
    targetMuscles: ["Quads", "Glutes", "Adductors", "Hamstrings"],
    hunterGathererBenefit: "Builds stride strength and single-leg resilience for uneven ground.",
  }),

  "Hamstring Curl": movement({
    name: "Hamstring Curl",
    category: ExerciseCategory.LEGS,
    overview: "A knee-flexion hamstring exercise performed with controlled tempo.",
    why: "Strengthens the hamstrings directly to support knees, sprinting, hiking, and hinging.",
    setup: ["Align machine pivot with knee", "Hips stay down", "Brace lightly", "Start with full control"],
    perform: ["Curl smoothly", "Pause briefly at contraction", "Return under control", "Keep hips still"],
    executionFocus: ["No hip lift", "Full controlled range", "Even pressure", "No swinging"],
    commonMistakes: ["Using momentum", "Hips rising", "Partial reps", "Letting the stack slam"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load after all sets reach 15 controlled reps"],
    regression: ["Use lighter load", "Shorten range slightly", "Use hamstring walkouts if no machine is available"],
    targetMuscles: ["Hamstrings", "Calves"],
    hunterGathererBenefit: "Protects knees and posterior chain during running, climbing, and deceleration.",
  }),

  "Standing Calf Raise": movement({
    name: "Standing Calf Raise",
    category: ExerciseCategory.LEGS,
    overview: "A controlled ankle extension movement for lower-leg strength.",
    why: "Builds calves and Achilles tolerance for walking, hiking, jumping, and loaded carries.",
    setup: ["Feet hip-width", "Stand tall", "Use support only for balance", "Start from a controlled stretch"],
    perform: ["Rise onto balls of feet", "Pause at the top", "Lower slowly", "Keep ankles tracking straight"],
    executionFocus: ["Full range", "No bouncing", "Even pressure through big toe", "Tall posture"],
    commonMistakes: ["Short reps", "Bouncing", "Ankles rolling out", "Rushing the lowering"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add load when all sets reach 20 clean reps"],
    regression: ["Use bodyweight", "Use both legs instead of single-leg", "Reduce range if Achilles is sensitive"],
    targetMuscles: ["Gastrocnemius", "Soleus", "Intrinsic foot muscles"],
    hunterGathererBenefit: "Improves foot and ankle durability for long movement days.",
  }),

  "Hanging Leg Raise": movement({
    name: "Hanging Leg Raise",
    category: ExerciseCategory.CORE,
    overview: "A hanging anterior-core drill that raises the legs without swinging.",
    why: "Builds trunk control, hip flexor strength, and grip tolerance.",
    setup: ["Full grip on bar", "Ribs down", "Shoulders active", "Legs start still"],
    perform: ["Raise legs under control", "Avoid swing", "Pause briefly", "Lower slowly"],
    executionFocus: ["Still torso", "Posterior pelvic tilt", "Controlled lower", "No kicking"],
    commonMistakes: ["Swinging", "Arching lower back", "Using momentum", "Dropping legs"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Progress from knees bent to straighter legs, then add reps"],
    regression: ["Use bent-knee raises", "Do captain's chair raises", "Use dead bug on poor grip days"],
    targetMuscles: ["Abs", "Hip flexors", "Grip", "Lats"],
    hunterGathererBenefit: "Builds hanging control and trunk stiffness for climbing and carrying.",
  }),

  "Pull-Up": movement({
    name: "Pull-Up",
    category: ExerciseCategory.PULL,
    overview: "An overhand vertical pull from a controlled hang.",
    why: "Builds high-value upper-body pulling strength and shoulder control.",
    setup: ["Full overhand grip", "Dead hang", "Ribs down", "Glutes lightly engaged"],
    perform: ["Pull shoulders down", "Drive elbows toward ribs", "Clear chin over bar", "Lower under control"],
    executionFocus: ["No swing", "Clean chin-over-bar", "Ribs stay down", "Full controlled lower"],
    commonMistakes: ["Kipping", "Half reps", "Craning neck", "Losing shoulder control"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add reps until all sets reach the target, then add load or harder tempo"],
    regression: ["Use band assistance", "Use negatives", "Use ring rows or machine assistance"],
    targetMuscles: ["Lats", "Upper back", "Biceps", "Forearms", "Abs"],
    hunterGathererBenefit: "Builds climbing, hanging, and obstacle-clearing capacity.",
  }),

  "Chin-Up": movement({
    name: "Chin-Up",
    category: ExerciseCategory.PULL,
    overview: "An underhand vertical pull from a controlled hang.",
    why: "Builds pulling strength with extra biceps contribution.",
    setup: ["Full underhand grip", "Dead hang", "Ribs down", "Glutes lightly engaged"],
    perform: ["Pull shoulders down", "Drive elbows toward ribs", "Clear chin over bar", "Lower under control"],
    executionFocus: ["No swing", "No neck reach", "Smooth elbows", "Controlled lower"],
    commonMistakes: ["Kipping", "Half reps", "Over-arching", "Dropping from the top"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add reps until all sets reach the target, then add load"],
    regression: ["Use band assistance", "Use negatives", "Use assisted chin-ups"],
    targetMuscles: ["Lats", "Biceps", "Mid-back", "Forearms", "Abs"],
    hunterGathererBenefit: "Builds practical pulling power for climbing and hauling.",
  }),

  "Chest Supported Row": movement({
    name: "Chest Supported Row",
    category: ExerciseCategory.PULL,
    overview: "A horizontal row with the torso supported to reduce lower-back fatigue.",
    why: "Builds upper-back strength while preserving spinal position.",
    setup: ["Chest supported", "Feet planted", "Neutral neck", "Arms start long"],
    perform: ["Pull elbows back", "Squeeze shoulder blades lightly", "Pause", "Lower with control"],
    executionFocus: ["Chest stays on pad", "No shrugging", "No jerking", "Full reach at bottom"],
    commonMistakes: ["Lifting chest", "Shrugging", "Yanking the weight", "Cutting range short"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load when all sets reach 12 clean reps"],
    regression: ["Use lighter dumbbells", "Use a machine row", "Reduce range if shoulders pinch"],
    targetMuscles: ["Mid-back", "Lats", "Rear delts", "Biceps"],
    hunterGathererBenefit: "Builds pulling endurance and posture for carrying and climbing.",
  }),

  "Farmer Carry": movement({
    name: "Farmer Carry",
    category: ExerciseCategory.CARRY,
    overview: "A loaded carry with weight held at the sides.",
    why: "Builds grip, trunk stiffness, gait integrity, and whole-body work capacity.",
    setup: ["Weights beside feet", "Hinge to grip", "Stand tall", "Shoulders down and back"],
    perform: ["Walk with quiet steps", "Keep ribs stacked", "Do not lean", "Set weights down with control"],
    executionFocus: ["Tall posture", "Even stride", "Crush grip", "No torso sway"],
    commonMistakes: ["Leaning", "Rushing", "Shrugging", "Dropping weights carelessly"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load after all carries hit the prescribed distance with posture intact"],
    regression: ["Use lighter weights", "Shorten distance", "Carry one side at a time only if posture stays square"],
    targetMuscles: ["Forearms", "Traps", "Abs", "Glutes", "Upper back"],
    hunterGathererBenefit: "Directly trains carrying capacity for heavy objects over distance.",
  }),

  "Dead Hang": movement({
    name: "Dead Hang",
    category: ExerciseCategory.PULL,
    overview: "A controlled hang from a bar with active shoulder awareness.",
    why: "Builds grip endurance and shoulder tolerance in the overhead position.",
    setup: ["Full grip", "Arms straight", "Ribs down", "Feet clear or lightly assisted"],
    perform: ["Hang without swinging", "Keep breathing steady", "Avoid shrugging into pain", "Step down under control"],
    executionFocus: ["Long spine", "Quiet body", "Secure grip", "No pain"],
    commonMistakes: ["Passive shoulder irritation", "Swinging", "Holding breath", "Dropping suddenly"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Build to 60 seconds, then add controlled active hang work"],
    regression: ["Keep toes lightly on the floor", "Use shorter holds", "Use rings if shoulders prefer them"],
    targetMuscles: ["Forearms", "Lats", "Shoulders", "Abs"],
    hunterGathererBenefit: "Builds hanging resilience for climbing and shoulder longevity.",
  }),

  "Incline Press": movement({
    name: "Incline Press",
    category: ExerciseCategory.PUSH,
    overview: "An angled press that trains chest, shoulders, and triceps.",
    why: "Builds upper-body pressing strength with a shoulder-friendly line.",
    setup: ["Shoulder blades set", "Feet planted", "Wrists stacked", "Weights start controlled"],
    perform: ["Lower with control", "Touch or reach consistent depth", "Press without flaring", "Finish stacked"],
    executionFocus: ["Stable shoulders", "Smooth bar path", "No bounce", "No grinding"],
    commonMistakes: ["Over-flaring elbows", "Bouncing", "Arching excessively", "Losing wrist stack"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load when all sets reach 10 clean reps"],
    regression: ["Use dumbbells", "Lower the incline", "Reduce load or range"],
    targetMuscles: ["Upper chest", "Front delts", "Triceps", "Serratus"],
    hunterGathererBenefit: "Builds pushing strength for climbing, bracing, and getting off the ground.",
  }),

  "Overhead Press": movement({
    name: "Overhead Press",
    category: ExerciseCategory.PUSH,
    overview: "A vertical press performed from a braced standing or seated position.",
    why: "Builds shoulder strength, trunk stiffness, and overhead control.",
    setup: ["Feet rooted", "Glutes lightly on", "Ribs down", "Wrists stacked"],
    perform: ["Press overhead", "Move head through naturally", "Lock out without shrugging into pain", "Lower under control"],
    executionFocus: ["No backbend", "Smooth path", "Stacked ribs and pelvis", "No grinding"],
    commonMistakes: ["Lumbar arch", "Pressing forward", "Soft brace", "Grinding reps"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load when all sets reach 12 clean reps"],
    regression: ["Use dumbbells", "Use seated press", "Use pike push-up"],
    targetMuscles: ["Delts", "Triceps", "Upper chest", "Abs", "Serratus"],
    hunterGathererBenefit: "Builds overhead strength for lifting, climbing, and bracing.",
  }),

  "Dips": movement({
    name: "Dips",
    category: ExerciseCategory.PUSH,
    overview: "A bodyweight press on parallel bars.",
    why: "Builds chest, triceps, and shoulder extension strength.",
    setup: ["Grip bars firmly", "Shoulders down", "Ribs stacked", "Legs quiet"],
    perform: ["Lower under control", "Stop at pain-free depth", "Press tall", "Keep elbows tracking"],
    executionFocus: ["Shoulders stay controlled", "No bounce", "No neck tension", "Smooth lockout"],
    commonMistakes: ["Going too deep", "Shoulders rolling forward", "Kicking", "Bouncing"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add reps until 15 clean reps, then add load if shoulders feel excellent"],
    regression: ["Use assisted dips", "Use bench dips only if shoulders tolerate them", "Use push-ups"],
    targetMuscles: ["Chest", "Triceps", "Front delts", "Serratus"],
    hunterGathererBenefit: "Builds ability to press the body over obstacles.",
  }),

  "Lateral Raise": movement({
    name: "Lateral Raise",
    category: ExerciseCategory.PUSH,
    overview: "A controlled shoulder abduction drill.",
    why: "Builds shoulder tissue capacity and balanced deltoid development.",
    setup: ["Light weights", "Soft elbows", "Ribs down", "Shoulders relaxed"],
    perform: ["Raise to shoulder height", "Lead with elbows", "Pause briefly", "Lower slowly"],
    executionFocus: ["No swinging", "No shrugging", "Steady tempo", "Pain-free range"],
    commonMistakes: ["Too heavy", "Shrugging", "Throwing the weight", "Leaning back"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase load only after 20 clean reps across all sets"],
    regression: ["Use lighter weights", "Use partial pain-free range", "Use cables or bands"],
    targetMuscles: ["Side delts", "Rotator cuff", "Upper traps"],
    hunterGathererBenefit: "Supports shoulder durability for carrying, climbing, and pressing.",
  }),

  "Hollow Hold": movement({
    name: "Hollow Hold",
    category: ExerciseCategory.CORE,
    overview: "An isometric trunk position that resists spinal extension.",
    why: "Builds deep anterior-core control for athletic positions.",
    setup: ["Lie on back", "Low back gently pressed down", "Ribs down", "Arms and legs set to a controllable lever"],
    perform: ["Hold the shape", "Breathe shallow and steady", "Keep low back down", "Stop before shaking breaks position"],
    executionFocus: ["Low back contact", "Ribs down", "Quiet breathing", "No neck strain"],
    commonMistakes: ["Low back arching", "Holding breath", "Lever too long", "Neck tension"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Extend arms and legs farther or hold longer up to 60 seconds"],
    regression: ["Bend knees", "Keep arms by sides", "Use dead bug"],
    targetMuscles: ["Abs", "Hip flexors", "Serratus"],
    hunterGathererBenefit: "Builds trunk stiffness for crawling, climbing, and carrying.",
  }),

  "Single Leg Hip Thrust": movement({
    name: "Single Leg Hip Thrust",
    category: ExerciseCategory.LEGS,
    overview: "A single-leg hip extension movement from an elevated shoulder position.",
    why: "Builds glute strength and hip control without heavy spinal loading.",
    setup: ["Upper back on bench or couch", "One foot planted", "Ribs down", "Chin tucked"],
    perform: ["Drive through heel", "Lift hips to level", "Pause", "Lower under control"],
    executionFocus: ["Level hips", "Glute squeeze", "No low-back arch", "Stable foot"],
    commonMistakes: ["Arching back", "Twisting hips", "Pushing through toes", "Rushing"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add reps, then add load when all sets reach 15 per side cleanly"],
    regression: ["Use two-leg hip thrust", "Use glute bridge", "Shorten range"],
    targetMuscles: ["Glutes", "Hamstrings", "Abs"],
    hunterGathererBenefit: "Builds hip drive for climbing, hiking, sprinting, and rising from the ground.",
  }),

  "Hamstring Walkout": movement({
    name: "Hamstring Walkout",
    category: ExerciseCategory.LEGS,
    overview: "A bodyweight posterior-chain drill using small heel steps from a bridge.",
    why: "Builds hamstring strength and pelvic control without equipment.",
    setup: ["Start in glute bridge", "Ribs down", "Hips level", "Heels planted"],
    perform: ["Walk heels out slowly", "Keep hips lifted", "Walk back in", "Reset if pelvis drops"],
    executionFocus: ["Level pelvis", "Small steps", "Hamstrings working", "No back cramp"],
    commonMistakes: ["Hips sagging", "Steps too large", "Arching back", "Rushing"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add slower tempo or reps once 10 reps stay controlled"],
    regression: ["Use shorter walkouts", "Use two-leg bridge holds", "Reduce reps"],
    targetMuscles: ["Hamstrings", "Glutes", "Abs"],
    hunterGathererBenefit: "Builds posterior-chain resilience for walking, scrambling, and deceleration.",
  }),

  "Wall Sit": movement({
    name: "Wall Sit",
    category: ExerciseCategory.LEGS,
    overview: "An isometric squat hold against a wall.",
    why: "Builds quad endurance and mental composure without joint pounding.",
    setup: ["Back against wall", "Feet forward", "Knees track over toes", "Find pain-free depth"],
    perform: ["Hold position", "Breathe steadily", "Keep feet grounded", "Stand before form collapses"],
    executionFocus: ["Even foot pressure", "Quiet knees", "Steady breathing", "No knee pain"],
    commonMistakes: ["Too deep too soon", "Knees collapsing", "Holding breath", "Sliding lower as fatigue rises"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add time before adding load"],
    regression: ["Use a higher position", "Shorter holds", "Split into clusters"],
    targetMuscles: ["Quads", "Glutes", "Calves"],
    hunterGathererBenefit: "Builds lower-body endurance for sustained crouching and terrain work.",
  }),

  "Feet Elevated Push-Up": movement({
    name: "Feet Elevated Push-Up",
    category: ExerciseCategory.PUSH,
    overview: "A push-up variation with feet elevated to increase shoulder and upper-chest demand.",
    why: "Builds pressing strength with bodyweight and strong trunk control.",
    setup: ["Feet elevated", "Hands under shoulders", "Ribs down", "Glutes lightly on"],
    perform: ["Lower as one unit", "Chest approaches floor", "Press away", "Keep body line straight"],
    executionFocus: ["No sagging", "No flared elbows", "Full control", "Stop before failure"],
    commonMistakes: ["Hips sagging", "Head reaching", "Partial reps", "Grinding"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add reps, slow tempo, or height only while reps stay clean"],
    regression: ["Use regular push-ups", "Use incline push-ups", "Reduce elevation"],
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Abs"],
    hunterGathererBenefit: "Builds ground-to-obstacle pressing power.",
  }),

  "Pike Push-Up": movement({
    name: "Pike Push-Up",
    category: ExerciseCategory.PUSH,
    overview: "A bodyweight vertical pressing pattern from a pike position.",
    why: "Builds shoulder strength without a gym.",
    setup: ["Hips high", "Hands planted", "Head between arms", "Ribs controlled"],
    perform: ["Lower head toward floor", "Elbows track", "Press back to pike", "Keep weight through hands"],
    executionFocus: ["Vertical press line", "No collapsing neck", "Controlled depth", "No lumbar arch"],
    commonMistakes: ["Turning it into a push-up", "Head diving forward", "Elbows flaring", "Rushing"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Elevate feet or add reps once 15 reps are clean"],
    regression: ["Use a higher hand surface", "Shorten range", "Use overhead press if in gym"],
    targetMuscles: ["Shoulders", "Triceps", "Upper chest", "Abs"],
    hunterGathererBenefit: "Builds overhead pressing and shoulder control for climbing and vaulting.",
  }),

  "Pseudo Planche Push-Up": movement({
    name: "Pseudo Planche Push-Up",
    category: ExerciseCategory.PUSH,
    overview: "A forward-leaning push-up that increases shoulder and trunk demand.",
    why: "Builds straight-arm strength, pressing control, and anti-extension capacity.",
    setup: ["Hands near hips or slightly turned out", "Lean forward", "Ribs down", "Glutes on"],
    perform: ["Lower under control", "Keep lean consistent", "Press without losing body line", "Stop before wrist pain"],
    executionFocus: ["Forward lean", "Locked-in trunk", "No wrist pain", "Smooth reps"],
    commonMistakes: ["Lean disappearing", "Hips sagging", "Wrist irritation", "Grinding"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase lean gradually after all reps are clean"],
    regression: ["Reduce lean", "Use regular push-ups", "Use parallettes for wrists"],
    targetMuscles: ["Chest", "Front delts", "Triceps", "Abs", "Serratus"],
    hunterGathererBenefit: "Builds advanced body control for ground movement and climbing transitions.",
  }),

  "Side Plank": movement({
    name: "Side Plank",
    category: ExerciseCategory.CORE,
    overview: "A lateral trunk hold from forearm or hand support.",
    why: "Builds anti-lateral-flexion strength for hips, spine, and shoulders.",
    setup: ["Elbow under shoulder", "Feet stacked or staggered", "Hips tall", "Ribs stacked"],
    perform: ["Hold a straight line", "Breathe steadily", "Keep hips from rotating", "Switch sides with control"],
    executionFocus: ["Long line", "No hip drop", "No shoulder shrug", "Even breathing"],
    commonMistakes: ["Hips rolling back", "Shoulder collapsing", "Holding breath", "Neck tension"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase hold time, then use long-lever or loaded variations"],
    regression: ["Bend knees", "Use shorter holds", "Elevate upper body"],
    targetMuscles: ["Obliques", "Glute medius", "Shoulders", "Abs"],
    hunterGathererBenefit: "Builds lateral trunk resilience for carrying, scrambling, and changing direction.",
  }),

  "Hike": movement({
    name: "Hike",
    category: ExerciseCategory.CARRY,
    overview: "A long outdoor movement session at a sustainable pace.",
    why: "Builds aerobic base, recovery capacity, outdoor movement skill, and stress reduction.",
    setup: ["Choose safe terrain", "Wear suitable footwear", "Carry water", "Start at conversational pace"],
    perform: ["Move continuously", "Keep breathing sustainable", "Scan terrain", "Finish feeling better than when you started"],
    executionFocus: ["Relaxed shoulders", "Steady pace", "Quiet foot placement", "Awareness of terrain"],
    breathing: { inhale: "Natural nasal or mixed breathing", exhale: "Natural and relaxed" },
    commonMistakes: ["Turning it into a race", "Ignoring foot pain", "Under-hydrating", "Choosing unsafe terrain"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Extend duration toward 120 minutes before increasing terrain difficulty"],
    regression: ["Walk on flatter terrain", "Reduce duration", "Split into two shorter walks"],
    targetMuscles: ["Calves", "Quads", "Glutes", "Feet", "Heart and lungs"],
    hunterGathererBenefit: "Restores the base human pattern: covering ground outdoors for a long time.",
  }),

  "Deep Squat Hold": movement({
    name: "Deep Squat Hold",
    category: ExerciseCategory.MOBILITY,
    overview: "A relaxed deep squat position used to restore hips, ankles, and spine.",
    why: "Maintains the ability to rest, reach, and work close to the ground.",
    setup: ["Feet comfortable", "Heels down if possible", "Chest relaxed", "Use support if needed"],
    perform: ["Sink into a pain-free squat", "Breathe slowly", "Shift gently side to side", "Stand up with control"],
    executionFocus: ["Relaxed breathing", "Heels grounded or supported", "Knees tracking toes", "No pinching"],
    commonMistakes: ["Forcing depth", "Collapsing arches", "Holding breath", "Ignoring hip pinch"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add time or remove hand support"],
    regression: ["Hold a door frame", "Elevate heels", "Use a higher squat depth"],
    targetMuscles: ["Hips", "Ankles", "Adductors", "Spine"],
    hunterGathererBenefit: "Preserves ground-resting capacity and low-position comfort.",
  }),

  "Couch Stretch": movement({
    name: "Couch Stretch",
    category: ExerciseCategory.MOBILITY,
    overview: "A hip-flexor and quad stretch using a wall, couch, or bench.",
    why: "Restores hip extension for walking, lunging, and upright posture.",
    setup: ["Back knee near wall or couch", "Front foot planted", "Ribs down", "Glute on the stretching side lightly squeezed"],
    perform: ["Hold steady", "Breathe slowly", "Avoid arching lower back", "Switch sides"],
    executionFocus: ["Glute engaged", "Ribs stacked", "Front foot stable", "No knee pain"],
    commonMistakes: ["Arching back", "Forcing knee angle", "Holding breath", "Letting ribs flare"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Move closer to wall only if position stays calm"],
    regression: ["Move knee farther from wall", "Use padding", "Use a half-kneeling hip flexor stretch"],
    targetMuscles: ["Hip flexors", "Quads", "Abs"],
    hunterGathererBenefit: "Offsets sitting and improves stride mechanics.",
  }),

  "90/90 Hip Rotations": movement({
    name: "90/90 Hip Rotations",
    category: ExerciseCategory.MOBILITY,
    overview: "A seated hip rotation drill moving between internal and external rotation.",
    why: "Builds usable hip rotation for squatting, crawling, and ground transitions.",
    setup: ["Sit in 90/90 position", "Tall spine", "Hands lightly assist if needed", "Move within control"],
    perform: ["Rotate knees side to side", "Keep movement smooth", "Pause in each position", "Avoid forcing end range"],
    executionFocus: ["Tall posture", "Controlled hips", "No knee pain", "Smooth transitions"],
    commonMistakes: ["Yanking knees", "Collapsing torso", "Forcing painful range", "Rushing"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Use less hand support or add controlled lift-offs"],
    regression: ["Lean back on hands", "Use a smaller range", "Place cushions under knees"],
    targetMuscles: ["Hip rotators", "Glutes", "Adductors"],
    hunterGathererBenefit: "Maintains ground mobility and rotational hip options.",
  }),

  "Hamstring Stretch": movement({
    name: "Hamstring Stretch",
    category: ExerciseCategory.MOBILITY,
    overview: "A controlled posterior-chain stretch.",
    why: "Maintains hinge comfort and stride quality.",
    setup: ["Choose seated or standing position", "Spine long", "Knee softly bent if needed", "Toes relaxed"],
    perform: ["Ease into stretch", "Breathe slowly", "Hold without bouncing", "Switch sides"],
    executionFocus: ["Gentle tension", "Long spine", "No nerve symptoms", "Steady breath"],
    commonMistakes: ["Rounding aggressively", "Bouncing", "Forcing straight knee", "Chasing numbness"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add time or use active end-range contractions"],
    regression: ["Bend knee", "Use a strap", "Reduce range"],
    targetMuscles: ["Hamstrings", "Calves", "Glutes"],
    hunterGathererBenefit: "Supports hinging, stepping, and low-position movement.",
  }),

  "Child's Pose With Side Reach": movement({
    name: "Child's Pose With Side Reach",
    category: ExerciseCategory.MOBILITY,
    overview: "A relaxed floor stretch for lats, ribs, and back.",
    why: "Restores overhead reach and side-body length while calming breathing.",
    setup: ["Kneel on floor", "Sit hips back", "Reach arms forward", "Walk hands to one side"],
    perform: ["Breathe into ribs", "Hold calmly", "Switch sides", "Avoid shoulder pinch"],
    executionFocus: ["Slow breathing", "Long side body", "Relaxed neck", "No pinching"],
    commonMistakes: ["Forcing shoulders", "Holding breath", "Rushing sides", "Ignoring knee discomfort"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Reach farther or add longer exhales"],
    regression: ["Place cushion under hips or knees", "Keep arms wider", "Use shorter holds"],
    targetMuscles: ["Lats", "Thoracic spine", "Ribs", "Low back"],
    hunterGathererBenefit: "Improves overhead reach and down-regulates stress.",
  }),

  "Thoracic Rotations": movement({
    name: "Thoracic Rotations",
    category: ExerciseCategory.MOBILITY,
    overview: "A controlled upper-back rotation drill.",
    why: "Maintains rotation through the thoracic spine instead of borrowing from the low back.",
    setup: ["Quadruped or side-lying setup", "Hips stable", "Neck neutral", "Hand behind head or reaching long"],
    perform: ["Rotate through upper back", "Pause", "Return slowly", "Repeat both sides"],
    executionFocus: ["Hips quiet", "Smooth rotation", "No low-back twist", "Easy breathing"],
    commonMistakes: ["Moving hips", "Forcing neck", "Rushing", "Arching low back"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Increase range only while hips stay stable"],
    regression: ["Use smaller range", "Do side-lying open books", "Support head with hand"],
    targetMuscles: ["Thoracic spine", "Obliques", "Rhomboids", "Lats"],
    hunterGathererBenefit: "Supports throwing, crawling, reaching, and scanning the environment.",
  }),

  "Dead Bug": movement({
    name: "Dead Bug",
    category: ExerciseCategory.CORE,
    overview: "A supine core drill that resists extension while limbs move.",
    why: "Teaches trunk control without fatigue or spinal loading.",
    setup: ["Lie on back", "Ribs down", "Low back gently connected to floor", "Arms and knees up"],
    perform: ["Move opposite arm and leg", "Exhale as limb extends", "Return with control", "Alternate sides"],
    executionFocus: ["Low back quiet", "Slow limbs", "Full exhale", "No neck tension"],
    commonMistakes: ["Low back arching", "Moving too fast", "Holding breath", "Neck strain"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Use longer levers or add pauses"],
    regression: ["Move legs only", "Tap heels closer", "Shorten range"],
    targetMuscles: ["Abs", "Hip flexors", "Diaphragm", "Pelvic stabilizers"],
    hunterGathererBenefit: "Builds durable trunk control for every other movement.",
  }),

  "Passive Hang": movement({
    name: "Passive Hang",
    category: ExerciseCategory.MOBILITY,
    overview: "A relaxed overhead hang used for shoulder and grip tolerance.",
    why: "Maintains overhead range while decompressing the upper body.",
    setup: ["Full grip", "Use assistance if needed", "Relax legs", "Start with short holds"],
    perform: ["Hang calmly", "Breathe slowly", "Let shoulders elevate without pain", "Step down under control"],
    executionFocus: ["No pain", "Steady breathing", "Secure grip", "No swinging"],
    commonMistakes: ["Forcing long holds", "Swinging", "Dropping off", "Ignoring shoulder symptoms"],
    stopRules: DEFAULT_STOP_RULES,
    progression: ["Add time toward 60 seconds"],
    regression: ["Keep toes on floor", "Use shorter holds", "Use active hang instead if passive irritates shoulders"],
    targetMuscles: ["Shoulders", "Lats", "Forearms", "Thoracic spine"],
    hunterGathererBenefit: "Preserves hanging capacity and shoulder range for climbing.",
  }),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getExerciseRules(exerciseName: string): ExerciseRules | null {
  return EXERCISE_RULES[resolveAlias(exerciseName)] || null;
}

export function getExercisesByCategory(
  category: ExerciseCategory,
): ExerciseRules[] {
  return Object.values(EXERCISE_RULES).filter((ex) => ex.category === category);
}

export function getAllExerciseNames(): string[] {
  return Object.keys(EXERCISE_RULES);
}

export function exerciseExists(exerciseName: string): boolean {
  return resolveAlias(exerciseName) in EXERCISE_RULES;
}

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
    [ExerciseCategory.MOBILITY]: [],
  };

  Object.values(EXERCISE_RULES).forEach((exercise) => {
    grouped[exercise.category].push(exercise);
  });

  return grouped;
}
