import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

import { getDatabase } from "../database/init";
import { formatMinutes, formatWeight } from "../utils/formatting";
import { theme } from "../styles/theme";

type SessionHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SessionHistory"
>;

interface Props {
  navigation: SessionHistoryNavigationProp;
}

interface SessionSummary {
  id: string;
  date: string;
  program_name: string;
  session_name: string;
  completed_volume: number;
  planned_volume: number;
  duration_minutes: number | null;
  session_feel: string | null;
  notes: string | null;
}

interface SessionExerciseSummary {
  id: string;
  exercise_name: string;
  completed_sets: number;
  planned_sets: number;
  total_clean_reps: number;
  max_weight: number | null;
  reps_at_max_weight: number | null;
  sets: SessionExerciseSetSummary[];
}

interface SessionExerciseSetSummary {
  id: string;
  set_number: number;
  clean_reps: number;
  weight: number | null;
  duration: number | null;
  distance: number | null;
}

interface SessionSection {
  title: string;
  data: SessionSummary[];
}

type ProgramFilter = "gym" | "no-gym";

const PROGRAM_FILTERS: Array<{ key: ProgramFilter; label: string }> = [
  { key: "gym", label: "Gym" },
  { key: "no-gym", label: "No-Gym" },
];

const PROGRAM_NAME_BY_FILTER: Record<ProgramFilter, string> = {
  gym: "ATAVIA Gym",
  "no-gym": "ATAVIA No-Gym",
};

// ============================================================================
// SESSION HISTORY SCREEN
// ============================================================================

export default function SessionHistoryScreen({ navigation }: Props) {
  const [sections, setSections] = useState<SessionSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramFilter>("gym");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );
  const [sessionExercises, setSessionExercises] = useState<
    Record<string, SessionExerciseSummary[]>
  >({});

  // Reload history when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSessionHistory(selectedProgram);
    });

    return unsubscribe;
  }, [navigation, selectedProgram]);

  useEffect(() => {
    loadSessionHistory(selectedProgram);
  }, [selectedProgram]);

  async function loadSessionHistory(programFilter: ProgramFilter) {
    try {
      setIsLoading(true);
      const db = getDatabase();
      const programName = PROGRAM_NAME_BY_FILTER[programFilter];

      const results = await db.getAllAsync<SessionSummary>(
        `
          SELECT
            id,
            date,
            program_name,
            session_name,
            completed_volume,
            planned_volume,
            session_feel,
            notes,
            CAST((julianday(end_time) - julianday(start_time)) * 24 * 60 AS INTEGER) as duration_minutes
          FROM training_session
          WHERE end_time IS NOT NULL
            AND program_name = ?
          ORDER BY date DESC, start_time DESC
          LIMIT 50
        `,
        [programName],
      );

      // Group sessions by date category
      const grouped = groupSessionsByDate(results);
      setSections(grouped);
      setExpandedSessionId(null);

      console.log(`[SessionHistory] Loaded ${results.length} sessions`);
    } catch (error) {
      console.error("[SessionHistory] Failed to load:", error);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSessionExercises(sessionId: string) {
    if (sessionExercises[sessionId]) return;

    try {
      const db = getDatabase();
      type ExerciseRow = Omit<SessionExerciseSummary, "sets">;
      type SetRow = SessionExerciseSetSummary & { exercise_session_id: string };

      const exerciseRows = await db.getAllAsync<ExerciseRow>(
        `
          SELECT
            es.id,
            es.exercise_name,
            es.completed_sets,
            es.planned_sets,
            COALESCE(SUM(ex.clean_reps), 0) AS total_clean_reps,
            MAX(ex.weight) AS max_weight,
            (
              SELECT MAX(ex2.clean_reps)
              FROM exercise_set ex2
              WHERE ex2.exercise_session_id = es.id
                AND ex2.weight = (
                  SELECT MAX(ex3.weight)
                  FROM exercise_set ex3
                  WHERE ex3.exercise_session_id = es.id
                )
            ) AS reps_at_max_weight
          FROM exercise_session es
          LEFT JOIN exercise_set ex ON ex.exercise_session_id = es.id
          WHERE es.session_id = ?
          GROUP BY es.id
          ORDER BY es.order_in_session
        `,
        [sessionId],
      );

      const setRows = await db.getAllAsync<SetRow>(
        `
          SELECT
            ex.id,
            ex.exercise_session_id,
            ex.set_number,
            COALESCE(ex.clean_reps, 0) AS clean_reps,
            ex.weight,
            ex.duration,
            ex.distance
          FROM exercise_set ex
          JOIN exercise_session es ON es.id = ex.exercise_session_id
          WHERE es.session_id = ?
          ORDER BY es.order_in_session, ex.set_number
        `,
        [sessionId],
      );

      const setsByExerciseSessionId = new Map<string, SessionExerciseSetSummary[]>();

      setRows.forEach((setRow) => {
        const currentSets = setsByExerciseSessionId.get(setRow.exercise_session_id) || [];

        currentSets.push({
          id: setRow.id,
          set_number: Number(setRow.set_number) || 0,
          clean_reps: Number(setRow.clean_reps) || 0,
          weight: typeof setRow.weight === "number" ? setRow.weight : null,
          duration: typeof setRow.duration === "number" ? setRow.duration : null,
          distance: typeof setRow.distance === "number" ? setRow.distance : null,
        });

        setsByExerciseSessionId.set(setRow.exercise_session_id, currentSets);
      });

      const dedupedByExerciseName = new Map<string, SessionExerciseSummary>();

      exerciseRows.forEach((exerciseRow) => {
        const sets = setsByExerciseSessionId.get(exerciseRow.id) || [];
        const exercise: SessionExerciseSummary = {
          ...exerciseRow,
          sets,
        };

        const existing = dedupedByExerciseName.get(exercise.exercise_name);

        if (!existing) {
          dedupedByExerciseName.set(exercise.exercise_name, exercise);
          return;
        }

        const existingHasData = existing.sets.length > 0 || existing.completed_sets > 0;
        const currentHasData = exercise.sets.length > 0 || exercise.completed_sets > 0;

        if (!existingHasData && currentHasData) {
          dedupedByExerciseName.set(exercise.exercise_name, exercise);
        }
      });

      const exercises = Array.from(dedupedByExerciseName.values());

      setSessionExercises((prev) => ({
        ...prev,
        [sessionId]: exercises,
      }));
    } catch (error) {
      console.error("[SessionHistory] Failed to load exercises:", error);
      setSessionExercises((prev) => ({
        ...prev,
        [sessionId]: [],
      }));
    }
  }

  function toggleSessionExpansion(sessionId: string) {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }

    setExpandedSessionId(sessionId);
    loadSessionExercises(sessionId);
  }

  function groupSessionsByDate(sessions: SessionSummary[]): SessionSection[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaySessions: SessionSummary[] = [];
    const yesterdaySessions: SessionSummary[] = [];
    const thisWeekSessions: SessionSummary[] = [];
    const earlierSessions: SessionSummary[] = [];

    sessions.forEach((session) => {
      // Parse the date string (YYYY-MM-DD) as local date
      const [year, month, day] = session.date.split("-").map(Number);
      const sessionDate = new Date(year, month - 1, day);

      if (sessionDate.getTime() === today.getTime()) {
        todaySessions.push(session);
      } else if (sessionDate.getTime() === yesterday.getTime()) {
        yesterdaySessions.push(session);
      } else if (sessionDate >= weekAgo) {
        thisWeekSessions.push(session);
      } else {
        earlierSessions.push(session);
      }
    });

    const sections: SessionSection[] = [];

    if (todaySessions.length > 0) {
      sections.push({ title: "Today", data: todaySessions });
    }
    if (yesterdaySessions.length > 0) {
      sections.push({ title: "Yesterday", data: yesterdaySessions });
    }
    if (thisWeekSessions.length > 0) {
      sections.push({ title: "This Week", data: thisWeekSessions });
    }
    if (earlierSessions.length > 0) {
      sections.push({ title: "Earlier", data: earlierSessions });
    }

    return sections;
  }

  function getDisplayName(sessionName: string): string {
    // Map database session names to display names
    const nameMap: { [key: string]: string } = {
      "Pull Session A": "Day 1: Pull + Traps",
      "Pull + Traps": "Day 1: Pull + Traps",
      "Legs + Hinge": "Day 2: Legs + Hinge",
      "Leg Session": "Day 2: Legs + Hinge",
      "Push + Shoulders": "Day 3: Push + Shoulders",
      "Push Session": "Day 3: Push + Shoulders",
      "Movement / Conditioning": "Day 4: Movement / Conditioning",
      Conditioning: "Day 4: Movement / Conditioning",
    };

    return nameMap[sessionName] || sessionName;
  }

  function formatSessionDate(dateStr: string): string {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function renderProgramFilter() {
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by program</Text>
        <View style={styles.filterGroupPills}>
          {PROGRAM_FILTERS.map((program) => (
            <TouchableOpacity
              key={program.key}
              onPress={() => setSelectedProgram(program.key)}
              style={[
                styles.filterPill,
                selectedProgram === program.key && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedProgram === program.key && styles.filterPillTextActive,
                ]}
              >
                {program.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderHistoryHeader() {
    return (
      <View>
        {renderProgramFilter()}
      </View>
    );
  }

  function renderSession({ item }: { item: SessionSummary }) {
    const completionRate =
      item.planned_volume > 0
        ? Math.round((item.completed_volume / item.planned_volume) * 100)
        : 0;

    // Ensure all values are safe for rendering
    const displayName = getDisplayName(
      String(item.session_name || "Unknown Session"),
    );
    const sessionDate = formatSessionDate(String(item.date || ""));
    const completedVol = Number(item.completed_volume) || 0;
    const plannedVol = Number(item.planned_volume) || 0;
    const durationMins = item.duration_minutes;
    const sessionFeel = item.session_feel;
    const sessionNotes = item.notes?.trim();
    const isExpanded = expandedSessionId === item.id;
    const exercises = sessionExercises[item.id];

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        activeOpacity={0.9}
        onPress={() => toggleSessionExpansion(item.id)}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{displayName}</Text>
            <Text style={styles.sessionDate}>{sessionDate}</Text>
          </View>
          <View style={styles.sessionStats}>
            <Text style={styles.statsText}>
              {completedVol}/{plannedVol} sets
            </Text>
            {durationMins !== null && durationMins > 0 ? (
              <Text style={styles.statsText}>{formatMinutes(durationMins)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.sessionDetails}>
          {/* Session summary */}
          <View style={styles.summarySection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completion:</Text>
              <Text style={styles.detailValue}>{completionRate}%</Text>
            </View>
            {sessionFeel ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Session Feel:</Text>
                <Text style={styles.detailValue}>{String(sessionFeel)}</Text>
              </View>
            ) : null}
            {durationMins === null || durationMins === 0 ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>Not recorded</Text>
              </View>
            ) : null}
            {sessionNotes ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesValue}>{sessionNotes}</Text>
              </View>
            ) : null}
            <View style={styles.expandHintRow}>
              <Text style={styles.expandHintText}>
                {isExpanded ? "Hide exercises" : "Tap to view exercises"}
              </Text>
            </View>

            {isExpanded ? (
              <View style={styles.exerciseListSection}>
                <Text style={styles.exerciseListTitle}>Exercises</Text>
                {exercises ? (
                  exercises.length > 0 ? (
                    exercises.map((exercise) => (
                      <View key={exercise.id} style={styles.exerciseRow}>
                        <View style={styles.exerciseRowMain}>
                          <Text style={styles.exerciseListName}>
                            {exercise.exercise_name}
                          </Text>
                          <Text style={styles.exerciseSets}>
                            {exercise.completed_sets}/{exercise.planned_sets} sets
                          </Text>
                        </View>
                        <Text style={styles.exercisePerformanceText}>
                          {getExercisePerformanceText(exercise)}
                        </Text>
                        {exercise.sets.length > 0 ? (
                          <View style={styles.exerciseSetList}>
                            {exercise.sets.map((set) => (
                              <Text key={set.id} style={styles.exerciseSetText}>
                                {formatExerciseSetText(set)}
                              </Text>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.exerciseEmptyText}>
                      No exercise data saved for this session.
                    </Text>
                  )
                ) : (
                  <View style={styles.loadingInline}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.accent.secondary}
                    />
                  </View>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }


  function getExercisePerformanceText(exercise: SessionExerciseSummary): string {
    const maxWeight = exercise.max_weight;
    const hasLoad = typeof maxWeight === "number" && maxWeight > 0;
    const repsAtMax = exercise.reps_at_max_weight;

    if (hasLoad && repsAtMax && repsAtMax > 0) {
      return `Best set: ${formatWeight(maxWeight)} × ${repsAtMax} reps`;
    }

    if (exercise.total_clean_reps > 0) {
      return `Total clean reps: ${exercise.total_clean_reps}`;
    }

    return "No rep/load data saved";
  }

  function formatExerciseSetText(set: SessionExerciseSetSummary): string {
    const setLabel = `Set ${set.set_number}`;

    if (set.duration !== null) {
      return `${setLabel}: ${set.duration}s${
        set.weight !== null ? ` @ ${formatWeight(set.weight)}` : ""
      }`;
    }

    if (set.distance !== null) {
      return `${setLabel}: ${set.distance}m${
        set.weight !== null ? ` @ ${formatWeight(set.weight)}` : ""
      }`;
    }

    return `${setLabel}: ${set.clean_reps} reps${
      set.weight !== null ? ` @ ${formatWeight(set.weight)}` : ""
    }`;
  }

  function renderSectionHeader({ section }: { section: SessionSection }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={renderHistoryHeader()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedProgram === "gym"
                ? "No gym sessions yet."
                : "No no-gym sessions yet."}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedProgram === "gym"
                ? "Complete a gym session to see it here."
                : "Complete a no-gym session to see it here."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  filterSection: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  filterLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  filterEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
  },
  filterGroups: {
    gap: theme.spacing[3],
  },
  filterGroup: {
    gap: theme.spacing[2],
  },
  filterGroupTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  filterGroupPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  filterPill: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  filterPillActive: {
    borderColor: theme.colors.border.emphasis,
    backgroundColor: theme.colors.surface.elevated,
  },
  filterPillText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  filterPillTextActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyInsights: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.base,
    marginBottom: theme.spacing[4],
  },
  emptyInsightsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  loadingInline: {
    paddingVertical: theme.spacing[2],
    alignItems: "center",
  },
  expandHintRow: {
    marginTop: theme.spacing[2],
  },
  expandHintText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  exerciseListSection: {
    marginTop: theme.spacing[3],
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.border.subtle,
    paddingTop: theme.spacing[3],
    gap: theme.spacing[2],
  },
  exerciseListTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  exerciseRow: {
    gap: theme.spacing[1],
  },
  exerciseRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  exerciseListName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    flex: 1,
  },
  exerciseSets: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exercisePerformanceText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  exerciseSetList: {
    marginTop: theme.spacing[1],
    gap: theme.spacing[0.5],
  },
  exerciseSetText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  exerciseEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
  },
  exerciseInsights: {
    marginBottom: theme.spacing[4],
  },
  authorityCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[3],
  },
  authorityTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  authorityGrid: {
    gap: theme.spacing[2],
  },
  authorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  authorityLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    flex: 1,
  },
  authorityValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "right",
    flex: 1,
  },
  authorityEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.borderWidth.hairline,
  },
  statusBadgeStable: {
    borderColor: theme.colors.state.success,
    backgroundColor: theme.colors.surface.elevated,
  },
  statusBadgeHold: {
    borderColor: theme.colors.state.warning,
    backgroundColor: theme.colors.surface.elevated,
  },
  statusBadgeRegress: {
    borderColor: theme.colors.state.error,
    backgroundColor: theme.colors.surface.elevated,
  },
  statusBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[3],
  },
  rulesCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing[3],
  },
  rulesTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing[1],
  },
  rulesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  historyTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  historyTable: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[3],
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: theme.borderWidth.hairline,
    borderBottomColor: theme.colors.border.subtle,
    paddingBottom: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  tableHeaderText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: theme.spacing[2],
    borderBottomWidth: theme.borderWidth.hairline,
    borderBottomColor: theme.colors.border.subtle,
  },
  tableCellText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  tableDate: {
    flex: 1.2,
  },
  tableDateCell: {
    justifyContent: "flex-start",
  },
  tableLoad: {
    flex: 1,
    textAlign: "right",
  },
  tableSets: {
    flex: 1.2,
    textAlign: "right",
  },
  tableClean: {
    flex: 0.8,
    textAlign: "right",
  },
  tableFlags: {
    flex: 1.2,
    textAlign: "right",
  },
  tableEmptyRow: {
    paddingVertical: theme.spacing[3],
  },
  tableEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[6],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    textAlign: "center",
  },
  sectionHeader: {
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing[3],
    paddingTop: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  sessionCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
    overflow: "hidden",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: theme.spacing[4],
  },
  sessionInfo: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  sessionName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  sessionDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  sessionStats: {
    alignItems: "flex-end",
  },
  statsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[0.5],
  },
  expandIndicator: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.accent.secondary,
    marginTop: theme.spacing[1],
  },
  sessionDetails: {
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.elevated,
  },
  summarySection: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing[2],
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  notesSection: {
    marginTop: theme.spacing[2],
  },
  notesLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  notesValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  exerciseSection: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  exerciseSectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  noDataText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    fontStyle: "italic",
  },
  exerciseBlock: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.default,
  },
  exerciseHeader: {
    marginBottom: theme.spacing[2],
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  exerciseStats: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
    borderBottomWidth: theme.borderWidth.hairline,
    borderBottomColor: theme.colors.border.subtle,
  },
  setNumber: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    width: 60,
  },
  setMetrics: {
    flex: 1,
  },
  setValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  setSubValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[0.5],
  },
  setIndicators: {
    flex: 1,
    alignItems: "flex-end",
  },
  cleanBadge: {
    backgroundColor: theme.colors.execution.cleanRep,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  cleanBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  dirtyBadge: {
    backgroundColor: theme.colors.execution.dirtyRep,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  dirtyBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exerciseSummary: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.border.subtle,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontStyle: "italic",
  },
});
