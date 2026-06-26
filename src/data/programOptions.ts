export type AppProgramId = "no-gym" | "gym" | "mobility";

export interface ProgramOption {
  id: AppProgramId;
  programId: string;
  databaseName: string;
  name: string;
  shortName: string;
  description: string;
  requirements: string[];
  duration: string;
  frequency: string;
}

export const PROGRAM_OPTIONS: ProgramOption[] = [
  {
    id: "no-gym",
    programId: "hunter-gatherer-no-gym",
    databaseName: "ATAVIA No-Gym",
    name: "No-Gym Program",
    shortName: "No-Gym",
    description:
      "4-day bodyweight program built around pull-ups, single-leg strength, push-up progressions, grip, and outdoor movement.",
    requirements: ["Pull-up bar", "Open floor space", "Outdoor walking route"],
    duration: "35-45 min strength days, 60-120 min movement day",
    frequency: "4 days per week",
  },
  {
    id: "gym",
    programId: "hunter-gatherer-gym",
    databaseName: "ATAVIA Gym",
    name: "Gym Program",
    shortName: "Gym",
    description:
      "3-day gym program for durable strength, joint-friendly hypertrophy, grip, core control, and work capacity.",
    requirements: [
      "Leg press",
      "Incline press",
      "Chest supported row",
      "Pull-up bar",
      "Dumbbells or carry handles",
    ],
    duration: "45-60 min per session",
    frequency: "3 days per week",
  },
  {
    id: "mobility",
    programId: "atavia-daily-mobility",
    databaseName: "ATAVIA Daily Mobility",
    name: "Daily Mobility",
    shortName: "Mobility",
    description:
      "Daily mobility work for hips, hamstrings, thoracic rotation, trunk control, and overhead shoulder tolerance.",
    requirements: ["Open floor space", "Wall or couch", "Pull-up bar for hangs"],
    duration: "15-20 min per session",
    frequency: "Daily",
  },
];

export const DEFAULT_APP_PROGRAM_ID: AppProgramId = "no-gym";

export function isAppProgramId(programId: string): programId is AppProgramId {
  return PROGRAM_OPTIONS.some((program) => program.id === programId);
}

export function getProgramOption(programId?: string): ProgramOption {
  if (programId && isAppProgramId(programId)) {
    return PROGRAM_OPTIONS.find((program) => program.id === programId)!;
  }

  return PROGRAM_OPTIONS.find((program) => program.id === DEFAULT_APP_PROGRAM_ID)!;
}

export function getProgramOptionByName(programName: string): ProgramOption | null {
  const normalizedProgramName = programName.trim().toLowerCase();

  return (
    PROGRAM_OPTIONS.find(
      (program) => program.databaseName.toLowerCase() === normalizedProgramName,
    ) ?? null
  );
}
