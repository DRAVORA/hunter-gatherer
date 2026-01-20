import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDatabase } from "../hooks/useDatabase";
import { TrainingSession, SessionFeel } from "../types";
import { formatRelativeDate, formatMinutes } from "../utils/formatting";
import { calculateSessionDuration } from "../utils/calculations";

// ============================================================================
// SESSION HISTORY SCREEN
// ============================================================================
// Displays list of past training sessions
// Tap to expand and see exercise details
// ============================================================================

interface SessionHistoryScreenProps {
  navigation: any;
}

export default function SessionHistoryScreen({
  navigation,
}: SessionHistoryScreenProps) {
  const db = useDatabase();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadSessions();

    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadSessions();
    });

    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const history = await db.getSessionHistory(20);
      setSessions(history);
    } catch (err) {
      console.error("[SessionHistory] Failed to load sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const renderSession = ({ item }: { item: TrainingSession }) => {
    const isExpanded = expandedSessionId === item.id;

    // Calculate duration
    let duration = 0;
    if (item.endTime) {
      duration = calculateSessionDuration(item.startTime, item.endTime);
    }

    // Session feel icon
    const feelIcon = getSessionFeelIcon(item.sessionFeel);
    const feelColor = getSessionFeelColor(item.sessionFeel);

    return (
      <View style={styles.sessionCard}>
        <TouchableOpacity
          style={styles.sessionHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.sessionHeaderLeft}>
            <Text style={styles.sessionDate}>
              {formatRelativeDate(item.date)}
            </Text>
            <Text style={styles.sessionName}>{item.sessionName}</Text>
          </View>

          <View style={styles.sessionHeaderRight}>
            <Text style={styles.sessionVolume}>
              {item.completedVolume}/{item.plannedVolume} sets
            </Text>
            {duration > 0 && (
              <Text style={styles.sessionDuration}>
                {formatMinutes(duration)}
              </Text>
            )}
            {item.sessionFeel && (
              <View style={[styles.feelBadge, { backgroundColor: feelColor }]}>
                <Text style={styles.feelBadgeText}>{feelIcon}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded details */}
        {isExpanded && (
          <View style={styles.sessionDetails}>
            {/* Volume adjustment notice */}
            {item.volumeAdjustmentApplied > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Volume Adjustment:</Text>
                <Text style={styles.detailValue}>
                  -{item.volumeAdjustmentApplied}%
                </Text>
              </View>
            )}

            {/* Appetite return */}
            {item.appetiteReturnedWithin60Min !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Appetite Returned:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    item.appetiteReturnedWithin60Min
                      ? styles.successText
                      : styles.warningText,
                  ]}
                >
                  {item.appetiteReturnedWithin60Min ? "Yes" : "No"}
                </Text>
              </View>
            )}

            {/* Session feel */}
            {item.sessionFeel && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Session Felt:</Text>
                <Text style={styles.detailValue}>{item.sessionFeel}</Text>
              </View>
            )}

            {/* Compensation notes */}
            {item.compensationNotes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Compensation Notes:</Text>
                <Text style={styles.notesText}>{item.compensationNotes}</Text>
              </View>
            )}

            {/* General notes */}
            {item.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}

            {/* Exercises */}
            <View style={styles.exercisesContainer}>
              <Text style={styles.exercisesTitle}>Exercises:</Text>
              {item.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>
                    {index + 1}. {exercise.exerciseName}
                  </Text>
                  <Text style={styles.exerciseSets}>
                    {exercise.completedSets}/{exercise.plannedSets} sets
                  </Text>
                  <Text style={styles.exerciseReps}>
                    {exercise.sets.reduce((sum, set) => sum + set.cleanReps, 0)}{" "}
                    total reps
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Sessions Yet</Text>
        <Text style={styles.emptyText}>
          Complete your first training session to see it here.
        </Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("DailyCheckIn")}
        >
          <Text style={styles.startButtonText}>Start First Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadSessions}
      />
    </View>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSessionFeelIcon(feel?: SessionFeel): string {
  if (!feel) return "";

  switch (feel) {
    case SessionFeel.CONTROLLED:
      return "✓";
    case SessionFeel.PUSHED:
      return "↑";
    case SessionFeel.EASY:
      return "↓";
    default:
      return "";
  }
}

function getSessionFeelColor(feel?: SessionFeel): string {
  if (!feel) return "#CCC";

  switch (feel) {
    case SessionFeel.CONTROLLED:
      return "#4CAF50"; // Green
    case SessionFeel.PUSHED:
      return "#FFA500"; // Orange
    case SessionFeel.EASY:
      return "#2196F3"; // Blue
    default:
      return "#CCC";
  }
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 4,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  sessionCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  sessionHeaderLeft: {
    flex: 1,
  },
  sessionHeaderRight: {
    alignItems: "flex-end",
  },
  sessionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  sessionVolume: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  feelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  feelBadgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  successText: {
    color: "#4CAF50",
  },
  warningText: {
    color: "#FFA500",
  },
  notesBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  exercisesContainer: {
    marginTop: 16,
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  exerciseRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  exerciseSets: {
    fontSize: 12,
    color: "#666",
  },
  exerciseReps: {
    fontSize: 12,
    color: "#666",
  },
});
