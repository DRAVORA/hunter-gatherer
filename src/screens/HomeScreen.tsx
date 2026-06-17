import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "../database/init";
import { formatDate, getTodayDate } from "../utils/formatting";
import {
  getEstimatedSessionDuration,
  getProgramById,
  getSessionById,
  getTotalVolumeForSession,
} from "../data/programs";
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

function getAppProgramId(programId: string): string {
  return programId === "gym" ? "hunter-gatherer-gym" : "hunter-gatherer-no-gym";
}

function formatProgramExercise(
  exerciseName: string,
  sets: number,
  targetDescription?: string,
): string {
  return `${exerciseName} (${sets}${UNICODE.MULTIPLY}${targetDescription ?? "AMRAP"})`;
}

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen({ navigation, route }: Props) {
  const { programId = "no-gym" } = route.params || {}; // Default to no-gym if undefined
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedProgram = getProgramById(getAppProgramId(programId));
  const PROGRAM_DAYS = selectedProgram?.sessions ?? [];
  const mobilityProgram = getProgramById("atavia-daily-mobility");
  const mobilityRoutine = mobilityProgram?.sessions[0]?.exercises ?? [];

  useEffect(() => {
    loadTodayCheckIn();
  }, []);

  // Reload check-in when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadTodayCheckIn();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadTodayCheckIn() {
    try {
      const db = getDatabase();
      const today = getTodayDate();

      const checkIn = await db.getFirstAsync<any>(
        "SELECT * FROM daily_checkin WHERE date = ?",
        [today],
      );

      setTodayCheckIn(checkIn);
    } catch (error) {
      console.error("[Home] Failed to load check-in:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartDay(dayId: string, dayNumber: number) {
    // Check if daily check-in is complete
    if (!todayCheckIn) {
      Alert.alert(
        "Daily Check-In Required",
        "Complete your daily check-in before starting a training session.",
        [
          {
            text: "Go to Check-In",
            onPress: () => navigation.navigate("DailyCheckIn", { programId }),
          },
        ],
      );
      return;
    }

    // Check readiness status
    const readinessStatus = todayCheckIn.readiness_status;
    const volumeAdjustment = todayCheckIn.volume_adjustment_percent;

    if (
      readinessStatus === "REST_DAY" ||
      readinessStatus === "NO_PROGRESSION"
    ) {
      Alert.alert(
        "Not Ready to Train",
        `Your readiness status is: ${readinessStatus}. Consider taking a rest day.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Train Anyway",
            style: "destructive",
            onPress: () => createSession(dayId, dayNumber, volumeAdjustment),
          },
        ],
      );
      return;
    }

    // Ready to train
    createSession(dayId, dayNumber, volumeAdjustment);
  }

  async function createSession(
    dayId: string,
    dayNumber: number,
    volumeAdjustment: number,
  ) {
    try {
      const db = getDatabase();
      const session = getSessionById(dayId);

      if (!session) {
        Alert.alert("Error", "Session not found");
        return;
      }

      // Create training session
      const sessionId = uuidv4();
      const today = getTodayDate();
      const plannedVolume = getTotalVolumeForSession(dayId);

      await db.runAsync(
        `INSERT INTO training_session (
          id, date, program_name, session_name, start_time,
          planned_volume, volume_adjustment_applied,
          pre_training_checklist_complete
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          today,
          programId === "gym" ? "ATAVIA Gym" : "ATAVIA No-Gym",
          session.name,
          new Date().toISOString(),
          plannedVolume,
          volumeAdjustment,
          0, // Checklist will be completed on readiness screen
        ],
      );

      console.log("[Home] Session created:", sessionId);

      // Navigate to readiness screen
      navigation.navigate("SessionReadiness", {
        sessionId,
        checkInId: todayCheckIn.id,
        readinessStatus: todayCheckIn.readiness_status,
        volumeAdjustmentPercent: volumeAdjustment,
      });
    } catch (error) {
      console.error("[Home] Failed to create session:", error);
      Alert.alert("Error", "Failed to start session. Please try again.");
    }
  }

  function handleViewHistory() {
    navigation.navigate("SessionHistory");
  }

  function handleDailyCheckIn() {
    navigation.navigate("DailyCheckIn", { programId });
  }

  function handleOpenManual() {
    navigation.navigate("TrainingManual");
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ATAVIA</Text>
          <Text style={styles.subtitle}>
            {programId === "gym"
              ? "Gym Program"
              : programId === "no-gym"
                ? "No-Gym Program"
                : "Training Program"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleOpenManual}
        >
          <Text style={styles.manualButtonText}>Open Training Manual</Text>
        </TouchableOpacity>

        {/* Daily Check-In Status */}
        <View style={styles.statusCard}>
          {todayCheckIn ? (
            <>
              <Text style={styles.statusTitle}>Today's Check-In Complete</Text>
              <Text style={styles.statusDetail}>
                Sleep: {todayCheckIn.sleep_hours}h
              </Text>
              <Text style={styles.statusDetail}>
                Status: {todayCheckIn.readiness_status.replace(/_/g, " ")}
              </Text>
              {todayCheckIn.volume_adjustment_percent > 0 && (
                <Text style={styles.statusWarning}>
                  Volume reduced by {todayCheckIn.volume_adjustment_percent}%
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>No Check-In Today</Text>
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={handleDailyCheckIn}
              >
                <Text style={styles.checkInButtonText}>
                  Complete Daily Check-In
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Program Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Training Day</Text>

          {PROGRAM_DAYS.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={styles.dayCard}
              onPress={() => handleStartDay(day.id, day.orderInProgram)}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayNumberBadge}>
                  <Text style={styles.dayNumberText}>{day.orderInProgram}</Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Text style={styles.dayDuration}>
                    {getEstimatedSessionDuration(day.id)} min
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {day.exercises.map((exercise) => (
                  <Text key={exercise.id} style={styles.exerciseItem}>
                    {UNICODE.BULLET}{" "}
                    {formatProgramExercise(
                      exercise.exerciseName,
                      exercise.targetSets,
                      exercise.targetDescription,
                    )}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Mobility Routine */}
        <View style={styles.nonNegotiablesCard}>
          <Text style={styles.nonNegotiablesTitle}>DAILY MOBILITY</Text>
          <Text style={styles.nonNegotiablesSubtitle}>
            Daily routine {UNICODE.DASH} complete every day, including rest days
          </Text>
          <Text style={styles.nonNegotiablesDescription}>
            Short movement practice for hips, hamstrings, trunk control,
            thoracic rotation, and overhead shoulder tolerance.
          </Text>
          <Text style={styles.nonNegotiablesWarning}>
            If quality drops or pain appears, reduce range and reset form.
          </Text>

          {mobilityRoutine.map((routine, index) => (
            <View key={routine.id} style={styles.nonNegotiableRoutineCard}>
              <Text style={styles.nonNegotiableHeader}>
                {index + 1}. {routine.exerciseName.toUpperCase()}
              </Text>
              <Text style={styles.nonNegotiableTarget}>
                {routine.targetSets}
                {UNICODE.MULTIPLY}
                {routine.targetDescription ?? "practice"}
              </Text>
            </View>
          ))}
        </View>

        {/* View History Button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleViewHistory}
        >
          <Text style={styles.historyButtonText}>View Session History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: theme.spacing[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  header: {
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  manualButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  manualButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  statusCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  statusTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  statusDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  statusWarning: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.state.warning,
    marginTop: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkInButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
    marginTop: theme.spacing[2],
  },
  checkInButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  dayCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  dayNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },
  dayNumberText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  dayDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  exerciseList: {
    marginTop: theme.spacing[2],
  },
  exerciseItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
    paddingLeft: theme.spacing[2],
  },
  nonNegotiablesCard: {
    backgroundColor: theme.colors.stopRules.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.stopRules.border,
  },
  nonNegotiablesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.stopRules.text,
    marginBottom: theme.spacing[2],
    textAlign: "center",
    letterSpacing: theme.typography.letterSpacing.widest,
  },
  nonNegotiablesSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontStyle: "italic",
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
  nonNegotiablesDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
  nonNegotiablesWarning: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.state.warning,
    marginBottom: theme.spacing[4],
    fontStyle: "italic",
  },
  nonNegotiableRoutineCard: {
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[4],
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.border.subtle,
  },
  nonNegotiableHeader: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent.tertiary,
    marginBottom: theme.spacing[1],
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  nonNegotiableTarget: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.state.warning,
    marginBottom: theme.spacing[2],
  },
  nonNegotiableChecklistItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[1],
  },
  historyButton: {
    backgroundColor: theme.colors.surface.interactive,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  historyButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});
