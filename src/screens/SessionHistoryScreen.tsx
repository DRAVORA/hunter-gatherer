import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

import { getDatabase } from "../database/init";
import { formatDate, formatMinutes } from "../utils/formatting";

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

// ============================================================================
// SESSION HISTORY SCREEN (PLACEHOLDER)
// ============================================================================

export default function SessionHistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    loadSessionHistory();
  }, []);

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
        ORDER BY start_time DESC
        LIMIT 20
      `);

      setSessions(results);
      console.log(`[SessionHistory] Loaded ${results.length} sessions`);
    } catch (error) {
      console.error("[SessionHistory] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleExpanded(sessionId: string) {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  }

  function renderSession({ item }: { item: SessionSummary }) {
    const isExpanded = expandedSession === item.id;
    const completionRate =
      item.planned_volume > 0
        ? Math.round((item.completed_volume / item.planned_volume) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => toggleExpanded(item.id)}
      >
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionName}>{item.session_name}</Text>
            <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.sessionStats}>
            <Text style={styles.statsText}>
              {item.completed_volume}/{item.planned_volume} sets
            </Text>
            {item.duration_minutes && (
              <Text style={styles.statsText}>
                {formatMinutes(item.duration_minutes)}
              </Text>
            )}
          </View>
        </View>

        {isExpanded && (
          <View style={styles.sessionDetails}>
            <Text style={styles.detailText}>
              Completion: {completionRate}%
            </Text>
            {item.session_feel && (
              <Text style={styles.detailText}>
                Feel: {item.session_feel}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (sessions.length === 0) {
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
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    padding: 16,
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
  },
  sessionCard: {
    backgroundColor: "#FFF",
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: "#666",
  },
  sessionStats: {
    alignItems: "flex-end",
  },
  statsText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  sessionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});
