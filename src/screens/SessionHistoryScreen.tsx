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
import { formatDate, formatMinutes } from "../utils/formatting";
import { UNICODE } from "../constants/unicode";

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
}

interface ExerciseSet {
  exercise_name: string;
  set_number: number;
  reps_completed: number | null;
  duration_seconds: number | null;
  felt_clean: number;
  stop_reason: string | null;
}

interface SessionSection {
  title: string;
  data: SessionSummary[];
}

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

  useEffect(() => {
    loadSessionHistory();
  }, []);

  // Reload history when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessionHistory();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadSessionHistory() {
    try {
      const db = getDatabase();

      const results = await db.getAllAsync<SessionSummary>(`
        SELECT 
          id, date, session_name, completed_volume, planned_volume,
          session_feel,
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

  async function loadSessionExercises(sessionId: string) {
    try {
      const db = getDatabase();

      const exercises = await db.getAllAsync<ExerciseSet>(`
        SELECT 
          es.exercise_name,
          ex.set_number,
          ex.clean_reps as reps_completed,
          ex.duration as duration_seconds,
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
          // Check if this is a timed exercise (has duration instead of reps)
          const isTimedExercise = sets.some(set => set.duration_seconds !== null && set.duration_seconds > 0);
          
          const totalReps = sets.reduce(
            (sum, set) => sum + (set.reps_completed || 0),
            0
          );
          
          const totalDuration = sets.reduce(
            (sum, set) => sum + (set.duration_seconds || 0),
            0
          );
          
          const cleanSets = sets.filter((set) => set.felt_clean === 1).length;

          return (
            <View key={exerciseName} style={styles.exerciseBlock}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exerciseName}</Text>
                <Text style={styles.exerciseStats}>
                  {sets.length} sets {UNICODE.BULLET} {isTimedExercise ? `${totalDuration}s total` : `${totalReps} reps`}
                </Text>
              </View>

              {/* Set-by-set breakdown */}
              {sets.map((set) => (
                <View key={set.set_number} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {set.set_number}</Text>

                  {set.duration_seconds !== null && set.duration_seconds > 0 ? (
                    <Text style={styles.setValue}>
                      {set.duration_seconds}s
                    </Text>
                  ) : set.reps_completed !== null && set.reps_completed > 0 ? (
                    <Text style={styles.setValue}>
                      {set.reps_completed} reps
                    </Text>
                  ) : (
                    <Text style={styles.setValue}>—</Text>
                  )}

                  <View style={styles.setIndicators}>
                    {set.felt_clean === 1 ? (
                      <View style={styles.cleanBadge}>
                        <Text style={styles.cleanBadgeText}>{UNICODE.CHECKMARK} Clean</Text>
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
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No training sessions yet.</Text>
        <Text style={styles.emptySubtext}>
          Complete your first session to see it here.
        </Text>
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
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  sectionHeader: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sessionCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: "#666",
  },
  sessionStats: {
    alignItems: "flex-end",
  },
  statsText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  expandIndicator: {
    fontSize: 12,
    color: "#2196F3",
    marginTop: 4,
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  summarySection: {
    padding: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  exerciseSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  exerciseSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  exerciseBlock: {
    backgroundColor: "#FFF",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  exerciseHeader: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  exerciseStats: {
    fontSize: 13,
    color: "#666",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  setNumber: {
    fontSize: 13,
    color: "#666",
    width: 60,
  },
  setValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    width: 80,
  },
  setIndicators: {
    flex: 1,
    alignItems: "flex-end",
  },
  cleanBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cleanBadgeText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  dirtyBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dirtyBadgeText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  exerciseSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  summaryText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
});
