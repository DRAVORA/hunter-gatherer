import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

import { getDatabase } from "../database/init";
import {
  formatMinutes,
  formatPercentage,
  formatWeight,
  formatDistance,
} from "../utils/formatting";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";
import { StopReason } from "../types";

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
  session_name: string;
  completed_volume: number;
  planned_volume: number;
  duration_minutes: number | null;
  session_feel: string | null;
  notes: string | null;
}

interface ExerciseSet {
  exercise_name: string;
  set_number: number;
  reps_completed: number | null;
  duration_seconds: number | null;
  distance_metres: number | null;
  weight_kg: number | null;
  felt_clean: number;
  stop_reason: string | null;
}

interface SessionSection {
  title: string;
  data: SessionSummary[];
}

interface ExerciseOptionRow {
  exercise_name: string;
}

interface ExerciseHistoryRow {
  session_id: string;
  date: string;
  volume_adjustment_applied: number;
  planned_sets: number;
  completed_sets: number;
  total_sets: number;
  total_clean_reps: number;
  total_duration: number;
  total_distance: number;
  clean_sets: number;
  top_clean_load: number | null;
  top_clean_duration: number | null;
  top_clean_reps: number | null;
  top_clean_distance: number | null;
  stop_flag_count: number;
}

interface ExerciseHistoryEntry {
  sessionId: string;
  date: string;
  volumeAdjustmentApplied: number;
  plannedSets: number;
  completedSets: number;
  totalSets: number;
  totalCleanReps: number;
  totalDuration: number;
  totalDistance: number;
  cleanSets: number;
  topCleanLoad: number | null;
  topCleanDuration: number | null;
  topCleanReps: number | null;
  topCleanDistance: number | null;
  stopFlagCount: number;
}

interface ProgressionStatus {
  label: string;
  description: string;
  tone: "stable" | "hold" | "regress";
}

type ExerciseMetricType = "load" | "hold" | "rep" | "distance";

// ============================================================================
// SESSION HISTORY SCREEN
// ============================================================================

export default function SessionHistoryScreen({ navigation }: Props) {
  const [sections, setSections] = useState<SessionSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionExercises, setSessionExercises] = useState<{
    [key: string]: ExerciseSet[];
  }>({});
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryEntry[]>(
    [],
  );
  const [exerciseHistoryLoading, setExerciseHistoryLoading] = useState(false);

  useEffect(() => {
    loadExerciseOptions();
  }, []);

  // Reload history when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadExerciseOptions();
      if (selectedExercise) {
        loadSessionHistory(selectedExercise);
        loadExerciseHistory(selectedExercise);
      }
    });

    return unsubscribe;
  }, [navigation, selectedExercise]);

  useEffect(() => {
    if (selectedExercise) {
      loadSessionHistory(selectedExercise);
      loadExerciseHistory(selectedExercise);
    } else {
      setExerciseHistory([]);
      setSections([]);
    }
    setExpandedSession(null);
  }, [selectedExercise]);

  async function loadExerciseOptions() {
    try {
      const db = getDatabase();
      const results = await db.getAllAsync<ExerciseOptionRow>(`
        SELECT DISTINCT exercise_name
        FROM exercise_session
        ORDER BY exercise_name ASC
      `);
      setExerciseOptions(results.map((row) => row.exercise_name));
      if (results.length > 0 && !selectedExercise) {
        setSelectedExercise(results[0].exercise_name);
      } else if (results.length === 0) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[SessionHistory] Failed to load exercise options:", error);
    }
  }

  async function loadSessionHistory(exerciseName: string | null) {
    try {
      const db = getDatabase();

      const results = exerciseName
        ? await db.getAllAsync<SessionSummary>(
            `
              SELECT DISTINCT
                ts.id, ts.date, ts.session_name, ts.completed_volume, ts.planned_volume,
                ts.session_feel,
                ts.notes,
                CAST((julianday(ts.end_time) - julianday(ts.start_time)) * 24 * 60 AS INTEGER) as duration_minutes
              FROM training_session ts
              JOIN exercise_session es ON ts.id = es.session_id
              WHERE ts.end_time IS NOT NULL
                AND es.exercise_name = ?
              ORDER BY ts.date DESC, ts.start_time DESC
              LIMIT 50
            `,
            [exerciseName],
          )
        : await db.getAllAsync<SessionSummary>(`
            SELECT 
              id, date, session_name, completed_volume, planned_volume,
              session_feel,
              notes,
              CAST((julianday(end_time) - julianday(start_time)) * 24 * 60 AS INTEGER) as duration_minutes
            FROM training_session
            WHERE end_time IS NOT NULL
            ORDER BY date DESC, start_time DESC
            LIMIT 50
          `);

      // Group sessions by date category
      const grouped = groupSessionsByDate(results);
      setSections(grouped);

      console.log(`[SessionHistory] Loaded ${results.length} sessions`);
    } catch (error) {
      console.error("[SessionHistory] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadExerciseHistory(exerciseName: string) {
    try {
      setExerciseHistoryLoading(true);
      const db = getDatabase();
      const results = await db.getAllAsync<ExerciseHistoryRow>(
        `
          SELECT
            ts.id as session_id,
            ts.date,
            ts.volume_adjustment_applied,
            MAX(es.planned_sets) as planned_sets,
            MAX(es.completed_sets) as completed_sets,
            COUNT(ex.id) as total_sets,
            SUM(ex.clean_reps) as total_clean_reps,
            SUM(CASE WHEN ex.duration IS NOT NULL THEN ex.duration ELSE 0 END) as total_duration,
            SUM(CASE WHEN ex.distance IS NOT NULL THEN ex.distance ELSE 0 END) as total_distance,
            SUM(CASE WHEN ex.felt_clean = 1 THEN 1 ELSE 0 END) as clean_sets,
            MAX(CASE WHEN ex.felt_clean = 1 THEN ex.weight ELSE NULL END) as top_clean_load,
            MAX(CASE WHEN ex.felt_clean = 1 THEN ex.duration ELSE NULL END) as top_clean_duration,
            MAX(CASE WHEN ex.felt_clean = 1 THEN ex.clean_reps ELSE NULL END) as top_clean_reps,
            MAX(CASE WHEN ex.felt_clean = 1 THEN ex.distance ELSE NULL END) as top_clean_distance,
            SUM(CASE WHEN ex.stop_reason != ? THEN 1 ELSE 0 END) as stop_flag_count
          FROM training_session ts
          JOIN exercise_session es ON ts.id = es.session_id
          JOIN exercise_set ex ON es.id = ex.exercise_session_id
          WHERE ts.end_time IS NOT NULL
            AND es.exercise_name = ?
          GROUP BY ts.id, ts.date, ts.volume_adjustment_applied
          ORDER BY ts.date ASC, ts.start_time ASC
        `,
        [StopReason.CLEAN_COMPLETION, exerciseName],
      );

      const mapped: ExerciseHistoryEntry[] = results.map((row) => ({
        sessionId: row.session_id,
        date: row.date,
        volumeAdjustmentApplied: Number(row.volume_adjustment_applied) || 0,
        plannedSets: Number(row.planned_sets) || 0,
        completedSets: Number(row.completed_sets) || 0,
        totalSets: Number(row.total_sets) || 0,
        totalCleanReps: Number(row.total_clean_reps) || 0,
        totalDuration: Number(row.total_duration) || 0,
        totalDistance: Number(row.total_distance) || 0,
        cleanSets: Number(row.clean_sets) || 0,
        topCleanLoad: row.top_clean_load === null ? null : Number(row.top_clean_load),
        topCleanDuration:
          row.top_clean_duration === null ? null : Number(row.top_clean_duration),
        topCleanReps: row.top_clean_reps === null ? null : Number(row.top_clean_reps),
        topCleanDistance:
          row.top_clean_distance === null ? null : Number(row.top_clean_distance),
        stopFlagCount: Number(row.stop_flag_count) || 0,
      }));

      setExerciseHistory(mapped);
    } catch (error) {
      console.error("[SessionHistory] Failed to load exercise history:", error);
    } finally {
      setExerciseHistoryLoading(false);
    }
  }

  async function loadSessionExercises(sessionId: string) {
    try {
      const db = getDatabase();

      const exercises = await db.getAllAsync<ExerciseSet>(`
        SELECT 
          es.exercise_name,
          ex.set_number,
          ex.clean_reps as reps_completed,
          ex.duration as duration_seconds,
          ex.distance as distance_metres,
          ex.weight as weight_kg,
          ex.felt_clean,
          ex.stop_reason
        FROM exercise_set ex
        JOIN exercise_session es ON ex.exercise_session_id = es.id
        WHERE es.session_id = ?
        ORDER BY es.order_in_session ASC, ex.set_number ASC
      `, [sessionId]);

      setSessionExercises((prev) => ({
        ...prev,
        [sessionId]: exercises,
      }));

      console.log(`[SessionHistory] Loaded ${exercises.length} sets for session ${sessionId}`);
    } catch (error) {
      console.error("[SessionHistory] Failed to load exercises:", error);
    }
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
      const [year, month, day] = session.date.split('-').map(Number);
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
      "Conditioning": "Day 4: Movement / Conditioning",
    };

    return nameMap[sessionName] || sessionName;
  }

  function formatSessionDate(dateStr: string): string {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function formatDurationSeconds(seconds: number | null): string {
    if (seconds === null || Number.isNaN(seconds)) {
      return UNICODE.EM_DASH;
    }
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.round(seconds % 60);
    return `${minutes}m ${remaining}s`;
  }

  function getExerciseMetricType(
    entries: ExerciseHistoryEntry[],
  ): ExerciseMetricType {
    if (entries.some((entry) => entry.topCleanDistance !== null)) {
      return "distance";
    }
    if (entries.some((entry) => entry.topCleanDuration !== null)) {
      return "hold";
    }
    if (entries.some((entry) => entry.topCleanLoad !== null)) {
      return "load";
    }
    return "rep";
  }

  function formatMetricValue(
    entry: ExerciseHistoryEntry,
    metricType: ExerciseMetricType,
  ): string {
    const loadSuffix =
      entry.topCleanLoad !== null
        ? ` @ ${formatTopCleanLoad(entry.topCleanLoad)}`
        : "";
    if (metricType === "distance") {
      if (entry.topCleanDistance === null || Number.isNaN(entry.topCleanDistance)) {
        return UNICODE.EM_DASH;
      }
      return `${formatDistance(entry.topCleanDistance)}${loadSuffix}`;
    }
    if (metricType === "hold") {
      return `${formatDurationSeconds(entry.topCleanDuration)}${loadSuffix}`;
    }
    if (metricType === "rep") {
      if (entry.topCleanReps === null || Number.isNaN(entry.topCleanReps)) {
        return UNICODE.EM_DASH;
      }
      return `${Math.round(entry.topCleanReps)} reps${loadSuffix}`;
    }
    return formatTopCleanLoad(entry.topCleanLoad);
  }

  function getInvalidReasons(entry: ExerciseHistoryEntry): string[] {
    const reasons: string[] = [];
    if (entry.plannedSets > 0 && entry.completedSets < entry.plannedSets) {
      reasons.push("Sets incomplete");
    }
    if (entry.totalSets === 0) {
      reasons.push("No completed sets");
    }
    if (entry.cleanSets < entry.totalSets) {
      reasons.push("Clean execution not repeatable");
    }
    if (entry.stopFlagCount > 0) {
      reasons.push("Stop rule triggered");
    }
    if (entry.volumeAdjustmentApplied > 0) {
      reasons.push("Volume reduction");
    }
    return reasons;
  }

  function getCleanPercentage(entry: ExerciseHistoryEntry): number {
    if (entry.totalSets === 0) return 0;
    return Math.round((entry.cleanSets / entry.totalSets) * 100);
  }

  function getProgressionStatus(
    entry: ExerciseHistoryEntry | null,
  ): ProgressionStatus {
    if (!entry) {
      return {
        label: "Hold Load",
        description: "No sessions logged for this exercise yet.",
        tone: "hold",
      };
    }

    if (entry.stopFlagCount > 0) {
      return {
        label: "Regress",
        description: "Stop rule triggered in last session.",
        tone: "regress",
      };
    }

    if (entry.volumeAdjustmentApplied > 0) {
      return {
        label: "Regress",
        description: "Volume reduction applied in last session.",
        tone: "regress",
      };
    }

    if (entry.plannedSets > 0 && entry.completedSets < entry.plannedSets) {
      return {
        label: "Hold Load",
        description: "Prescribed sets not completed.",
        tone: "hold",
      };
    }

    if (entry.totalSets === 0) {
      return {
        label: "Hold Load",
        description: "No completed sets recorded.",
        tone: "hold",
      };
    }

    if (entry.cleanSets < entry.totalSets) {
      return {
        label: "Hold Load",
        description: "Clean execution not repeatable.",
        tone: "hold",
      };
    }

    return {
      label: "Eligible to Progress",
      description:
        "All prescribed sets completed cleanly with no stop rules or volume reductions.",
      tone: "stable",
    };
  }

  function formatTopCleanLoad(load: number | null): string {
    if (load === null || Number.isNaN(load)) {
      return UNICODE.EM_DASH;
    }
    return formatWeight(load);
  }

  function formatSetsReps(
    entry: ExerciseHistoryEntry,
    metricType: ExerciseMetricType,
  ): string {
    if (entry.totalSets === 0) return UNICODE.EM_DASH;
    if (metricType === "hold") {
      const averageSeconds =
        entry.totalSets > 0 ? entry.totalDuration / entry.totalSets : 0;
      return `${entry.totalSets} × ${formatDurationSeconds(averageSeconds)}`;
    }
    if (metricType === "distance") {
      const averageDistance =
        entry.totalSets > 0 ? entry.totalDistance / entry.totalSets : 0;
      return `${entry.totalSets} × ${formatDistance(averageDistance)}`;
    }
    const averageReps =
      entry.totalSets > 0
        ? Math.round(entry.totalCleanReps / entry.totalSets)
        : 0;
    return `${entry.totalSets} × ${averageReps}`;
  }

  function formatFlags(entry: ExerciseHistoryEntry): string {
    const flags: string[] = [];
    const invalidReasons = getInvalidReasons(entry);
    if (invalidReasons.length > 0) {
      flags.push(...invalidReasons);
    }
    return flags.length > 0 ? flags.join(", ") : "Clear";
  }

  function formatAuthorityFlags(entry: ExerciseHistoryEntry): string {
    const flags: string[] = [];
    if (entry.stopFlagCount > 0) {
      flags.push("Stop rule");
    }
    if (entry.volumeAdjustmentApplied > 0) {
      flags.push("Volume reduction");
    }
    return flags.length > 0 ? flags.join(", ") : "None";
  }

  function renderExerciseInsights() {
    if (!selectedExercise) {
      return (
        <View style={styles.emptyInsights}>
          <Text style={styles.emptyInsightsText}>
            Select an exercise to view progression eligibility and session
            validity for that movement only.
          </Text>
        </View>
      );
    }

    if (exerciseHistoryLoading) {
      return (
        <View style={styles.loadingInline}>
          <ActivityIndicator
            size="small"
            color={theme.colors.accent.secondary}
          />
        </View>
      );
    }

    const lastEntry =
      exerciseHistory.length > 0
        ? exerciseHistory[exerciseHistory.length - 1]
        : null;
    const progressionStatus = getProgressionStatus(lastEntry);
    const metricType = getExerciseMetricType(exerciseHistory);
    const tableEntries = [...exerciseHistory].reverse();
    const lastEntryFlags = lastEntry
      ? formatAuthorityFlags(lastEntry)
      : UNICODE.EM_DASH;

    return (
      <View style={styles.exerciseInsights}>
        <View style={styles.authorityCard}>
          <Text style={styles.authorityTitle}>Last Session Authority</Text>
          {lastEntry ? (
            <View style={styles.authorityGrid}>
              <View style={styles.authorityRow}>
                <Text style={styles.authorityLabel}>Date</Text>
                <Text style={styles.authorityValue}>
                  {formatSessionDate(lastEntry.date)}
                </Text>
              </View>
              <View style={styles.authorityRow}>
                <Text style={styles.authorityLabel}>Key metric</Text>
                <Text style={styles.authorityValue}>
                  {formatMetricValue(lastEntry, metricType)}
                </Text>
              </View>
              <View style={styles.authorityRow}>
                <Text style={styles.authorityLabel}>Sets × avg</Text>
                <Text style={styles.authorityValue}>
                  {formatSetsReps(lastEntry, metricType)}
                </Text>
              </View>
              <View style={styles.authorityRow}>
                <Text style={styles.authorityLabel}>Clean rep %</Text>
                <Text style={styles.authorityValue}>
                  {formatPercentage(getCleanPercentage(lastEntry))}
                </Text>
              </View>
              <View style={styles.authorityRow}>
                <Text style={styles.authorityLabel}>Flags</Text>
                <Text style={styles.authorityValue}>{lastEntryFlags}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.authorityEmptyText}>
              No completed sessions for this exercise yet.
            </Text>
          )}
        </View>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Progression Verdict</Text>
          {progressionStatus ? (
            <View
              style={[
                styles.statusBadge,
                progressionStatus.tone === "stable"
                  ? styles.statusBadgeStable
                  : progressionStatus.tone === "regress"
                    ? styles.statusBadgeRegress
                    : styles.statusBadgeHold,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {progressionStatus.label}
              </Text>
            </View>
          ) : null}
        </View>
        {progressionStatus ? (
          <Text style={styles.statusDescription}>
            {progressionStatus.description}
          </Text>
        ) : null}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Progression rules</Text>
          <Text style={styles.rulesText}>
            Progression is allowed only when the most recent session completes
            all prescribed sets, counts only clean reps, triggers no stop rules,
            maintains 1–2 reps in reserve on the final working set, and applies
            no volume reductions. Any violation blocks progression.
          </Text>
        </View>

        <Text style={styles.historyTitle}>Historical Sessions</Text>
        <View style={styles.historyTable}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.tableDate]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.tableLoad]}>
              Key metric
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableSets]}>
              Sets × avg
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableClean]}>
              Clean %
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableFlags]}>Flags</Text>
          </View>
          {tableEntries.length === 0 ? (
            <View style={styles.tableEmptyRow}>
              <Text style={styles.tableEmptyText}>
                No sessions logged for this exercise yet.
              </Text>
            </View>
          ) : (
            tableEntries.map((entry) => {
              return (
                <View
                  key={entry.sessionId}
                  style={styles.tableRow}
                >
                  <View style={[styles.tableDate, styles.tableDateCell]}>
                    <Text style={styles.tableCellText}>
                      {formatSessionDate(entry.date)}
                    </Text>
                  </View>
                  <Text style={[styles.tableCellText, styles.tableLoad]}>
                    {formatMetricValue(entry, metricType)}
                  </Text>
                  <Text style={[styles.tableCellText, styles.tableSets]}>
                    {formatSetsReps(entry, metricType)}
                  </Text>
                  <Text style={[styles.tableCellText, styles.tableClean]}>
                    {formatPercentage(getCleanPercentage(entry))}
                  </Text>
                  <Text style={[styles.tableCellText, styles.tableFlags]}>
                    {formatFlags(entry)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  }

  function renderExerciseFilter() {
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by exercise</Text>
        {exerciseOptions.length === 0 ? (
          <Text style={styles.filterEmptyText}>No exercise data yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {exerciseOptions.map((exerciseName) => (
              <TouchableOpacity
                key={exerciseName}
                onPress={() => setSelectedExercise(exerciseName)}
                style={[
                  styles.filterPill,
                  selectedExercise === exerciseName && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedExercise === exerciseName &&
                      styles.filterPillTextActive,
                  ]}
                >
                  {exerciseName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  function renderHistoryHeader() {
    return (
      <View>
        {renderExerciseFilter()}
        {renderExerciseInsights()}
      </View>
    );
  }

  async function toggleExpanded(sessionId: string) {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
      // Load exercises if not already loaded
      if (!sessionExercises[sessionId]) {
        await loadSessionExercises(sessionId);
      }
    }
  }

  function groupExercisesBySets(sets: ExerciseSet[]): { [key: string]: ExerciseSet[] } {
    const grouped: { [key: string]: ExerciseSet[] } = {};

    sets.forEach((set) => {
      if (!grouped[set.exercise_name]) {
        grouped[set.exercise_name] = [];
      }
      grouped[set.exercise_name].push(set);
    });

    return grouped;
  }

  function renderExerciseDetails(sessionId: string) {
    const exercises = sessionExercises[sessionId];

    if (!exercises || exercises.length === 0) {
      return (
        <View style={styles.exerciseSection}>
          <Text style={styles.noDataText}>No exercise data recorded</Text>
        </View>
      );
    }

    const groupedExercises = groupExercisesBySets(exercises);

    return (
      <View style={styles.exerciseSection}>
        <Text style={styles.exerciseSectionTitle}>Exercise Breakdown</Text>

        {Object.entries(groupedExercises).map(([exerciseName, sets]) => {
          const isTimedExercise = sets.some(
            (set) => set.duration_seconds !== null && set.duration_seconds > 0,
          );
          const isDistanceExercise = sets.some(
            (set) => set.distance_metres !== null && set.distance_metres > 0,
          );

          const totalReps = sets.reduce(
            (sum, set) => sum + (set.reps_completed || 0),
            0,
          );

          const totalDuration = sets.reduce(
            (sum, set) => sum + (set.duration_seconds || 0),
            0,
          );

          const totalDistance = sets.reduce(
            (sum, set) => sum + (set.distance_metres || 0),
            0,
          );

          const maxWeight = sets.reduce((max, set) => {
            if (set.weight_kg === null) return max;
            return Math.max(max, set.weight_kg);
          }, -Infinity);
          const hasWeight = Number.isFinite(maxWeight) && maxWeight > 0;

          const cleanSets = sets.filter((set) => set.felt_clean === 1).length;

          return (
            <View key={exerciseName} style={styles.exerciseBlock}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exerciseName}</Text>
                <Text style={styles.exerciseStats}>
                  {sets.length} sets {UNICODE.BULLET}{" "}
                  {isTimedExercise
                    ? `${formatDurationSeconds(totalDuration)} total`
                    : isDistanceExercise
                      ? `${formatDistance(totalDistance)} total`
                      : `${totalReps} reps`}
                  {hasWeight
                    ? ` ${UNICODE.BULLET} Top load ${formatWeight(maxWeight)}`
                    : ""}
                </Text>
              </View>

              {/* Set-by-set breakdown */}
              {sets.map((set) => (
                <View key={set.set_number} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {set.set_number}</Text>

                  <View style={styles.setMetrics}>
                    {set.duration_seconds !== null && set.duration_seconds > 0 ? (
                      <Text style={styles.setValue}>
                        Time: {formatDurationSeconds(set.duration_seconds)}
                      </Text>
                    ) : set.distance_metres !== null &&
                      set.distance_metres > 0 ? (
                      <Text style={styles.setValue}>
                        Distance: {formatDistance(set.distance_metres)}
                      </Text>
                    ) : set.reps_completed !== null &&
                      set.reps_completed > 0 ? (
                      <Text style={styles.setValue}>
                        Reps: {set.reps_completed}
                      </Text>
                    ) : (
                      <Text style={styles.setValue}>{UNICODE.EM_DASH}</Text>
                    )}
                    {set.weight_kg !== null && set.weight_kg > 0 ? (
                      <Text style={styles.setSubValue}>
                        Load: {formatWeight(set.weight_kg)}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.setIndicators}>
                    {set.felt_clean === 1 ? (
                      <View style={styles.cleanBadge}>
                        <Text style={styles.cleanBadgeText}>
                          {UNICODE.CHECKMARK} Clean
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.dirtyBadge}>
                        <Text style={styles.dirtyBadgeText}>Form Break</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Clean sets summary */}
              <View style={styles.exerciseSummary}>
                <Text style={styles.summaryText}>
                  Clean execution: {cleanSets}/{sets.length} sets (
                  {Math.round((cleanSets / sets.length) * 100)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  function renderSession({ item }: { item: SessionSummary }) {
    const isExpanded = expandedSession === item.id;
    const completionRate =
      item.planned_volume > 0
        ? Math.round((item.completed_volume / item.planned_volume) * 100)
        : 0;

    // Ensure all values are safe for rendering
    const displayName = getDisplayName(
      String(item.session_name || "Unknown Session")
    );
    const sessionDate = formatSessionDate(String(item.date || ""));
    const completedVol = Number(item.completed_volume) || 0;
    const plannedVol = Number(item.planned_volume) || 0;
    const durationMins = item.duration_minutes;
    const sessionFeel = item.session_feel;
    const sessionNotes = item.notes?.trim();

    return (
      <View style={styles.sessionCard}>
        <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
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
                <Text style={styles.statsText}>
                  {formatMinutes(durationMins)}
                </Text>
              ) : null}
              <Text style={styles.expandIndicator}>
                {isExpanded ? "▼" : "▶"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
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
            </View>

            {/* Exercise details */}
            {renderExerciseDetails(item.id)}
          </View>
        )}
      </View>
    );
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
              {selectedExercise
                ? "No sessions for this exercise yet."
                : "Select an exercise to view history."}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedExercise
                ? "Complete a session with this exercise to see execution history here."
                : "Choose an exercise to see session validity and progression rules."}
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
  filterList: {
    gap: theme.spacing[2],
    paddingRight: theme.spacing[2],
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
    paddingVertical: theme.spacing[6],
    alignItems: "center",
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
