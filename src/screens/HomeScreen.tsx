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
import { getSessionById, getTotalVolumeForSession } from "../data/programs";
import { UNICODE } from "../constants/unicode";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

// ============================================================================
// PROGRAM DAYS CONFIGURATION
// ============================================================================

const NO_GYM_PROGRAM_DAYS = [
  {
    id: "no-gym-day1",
    dayNumber: 1,
    name: "Pull + Traps",
    exercises: [
      `Pull-Up (6${UNICODE.MULTIPLY}AMRAP)`,
      `Chin-Up (4${UNICODE.MULTIPLY}AMRAP)`,
      `Scapular Pull-Up (3${UNICODE.MULTIPLY}15)`,
      `High Pull-Up Hold (3${UNICODE.MULTIPLY}30s)`,
      `Dead Hang (2${UNICODE.MULTIPLY}60s)`,
    ],
    estimatedDuration: "35-45 min",
  },
  {
    id: "no-gym-day2",
    dayNumber: 2,
    name: "Legs + Hinge",
    exercises: [
      `Bulgarian Split Squat (5${UNICODE.MULTIPLY}25/leg)`,
      `Single-Leg Hip Thrust (4${UNICODE.MULTIPLY}20/leg)`,
      `Hamstring Walkouts (3${UNICODE.MULTIPLY}15)`,
      `Wall Sit (2${UNICODE.MULTIPLY}max time)`,
    ],
    estimatedDuration: "35-45 min",
  },
  {
    id: "no-gym-day3",
    dayNumber: 3,
    name: "Push + Shoulders",
    exercises: [
      `Push-Up Feet Elevated (6${UNICODE.MULTIPLY}20)`,
      `Pike Push-Up (5${UNICODE.MULTIPLY}15)`,
      `Pseudo-Planche Push-Up (3${UNICODE.MULTIPLY}10)`,
      `Side Plank (3${UNICODE.MULTIPLY}60s/side)`,
    ],
    estimatedDuration: "35-45 min",
  },
  {
    id: "no-gym-day4",
    dayNumber: 4,
    name: "Movement / Conditioning",
    exercises: [
      "Loaded backpack walk (60-90 min)",
      "Hill sprints (8-12 reps)",
      "Long fast walk (60 min)",
    ],
    estimatedDuration: "Variable",
  },
];

const GYM_PROGRAM_DAYS = [
  {
    id: "gym-day1",
    dayNumber: 1,
    name: "Day 1: Lower Body",
    exercises: [
      `Back Squat (4${UNICODE.MULTIPLY}5)`,
      `Romanian Deadlift (3${UNICODE.MULTIPLY}6)`,
      `Bulgarian Split Squat (3${UNICODE.MULTIPLY}6/leg)`,
      `Standing Calf Raise (3${UNICODE.MULTIPLY}12)`,
      `Side Plank (3${UNICODE.MULTIPLY}30s/side)`,
    ],
    estimatedDuration: "45-60 min",
  },
  {
    id: "gym-day2",
    dayNumber: 2,
    name: "Day 2: Upper Pull",
    exercises: [
      `Pull-Ups (4${UNICODE.MULTIPLY}6)`,
      `Barbell Row (3${UNICODE.MULTIPLY}8)`,
      `Shrugs (3${UNICODE.MULTIPLY}10)`,
      `Farmer Carries (4${UNICODE.MULTIPLY}40m)`,
    ],
    estimatedDuration: "45-60 min",
  },
  {
    id: "gym-day3",
    dayNumber: 3,
    name: "Day 3: Upper Push",
    exercises: [
      `Overhead Press (4${UNICODE.MULTIPLY}5)`,
      `Bench Press (3${UNICODE.MULTIPLY}8)`,
      `Dips (3${UNICODE.MULTIPLY}10)`,
      `Hollow Hold (3${UNICODE.MULTIPLY}30s)`,
    ],
    estimatedDuration: "45-60 min",
  },
];

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen({ navigation, route }: Props) {
  const { programId = "no-gym" } = route.params || {}; // Default to no-gym if undefined
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Select program days based on programId
  const PROGRAM_DAYS = programId === "gym" ? GYM_PROGRAM_DAYS : NO_GYM_PROGRAM_DAYS;

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
            onPress: () => navigation.navigate("DailyCheckIn"),
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
          programId === "gym" ? "Hunter-Gatherer Gym" : "Hunter-Gatherer No-Gym",
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
    navigation.navigate("DailyCheckIn");
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
          <Text style={styles.title}>Hunter-Gatherer</Text>
          <Text style={styles.subtitle}>
            {programId === "gym" ? "Gym Program" : programId === "no-gym" ? "No-Gym Program" : "Training Program"}
          </Text>
        </View>

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
              onPress={() => handleStartDay(day.id, day.dayNumber)}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayNumberBadge}>
                  <Text style={styles.dayNumberText}>{day.dayNumber}</Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Text style={styles.dayDuration}>
                    {day.estimatedDuration}
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {day.exercises.map((exercise, index) => (
                  <Text key={index} style={styles.exerciseItem}>
                    {UNICODE.BULLET} {exercise}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Non-Negotiables - Comprehensive */}
        <View style={styles.nonNegotiablesCard}>
          <Text style={styles.nonNegotiablesTitle}>DAILY NON-NEGOTIABLES</Text>
          <Text style={styles.nonNegotiablesSubtitle}>
            Performed every day, including rest days
          </Text>
          <Text style={styles.nonNegotiablesDescription}>
            These are maintenance requirements, not training volume. They gate
            posture, shoulder health, and pulling capacity.
          </Text>
          <Text style={styles.nonNegotiablesWarning}>
            If these degrade, do not progress training.
          </Text>

          {/* 1. Active Dead Hang */}
          <View style={styles.nonNegotiableSection}>
            <Text style={styles.nonNegotiableHeader}>
              1. ACTIVE DEAD HANG {UNICODE.DASH} 60 SECONDS TOTAL
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Setup</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Overhand grip with full thumb wrap{"\n"}
              {UNICODE.BULLET} Hands shoulder-width or slightly wider{"\n"}
              {UNICODE.BULLET} Arms fully straight{"\n"}
              {UNICODE.BULLET} Let body settle before starting
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Body Position</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Ribs down (no flare){"\n"}
              {UNICODE.BULLET} Glutes lightly engaged{"\n"}
              {UNICODE.BULLET} Legs together or slightly forward{"\n"}
              {UNICODE.BULLET} Neck neutral{"\n"}
              {"\n"}
              You should feel long and supported {UNICODE.DASH} not collapsed.
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Execution</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Maintain slight shoulder depression (shoulders
              not in ears)
              {"\n"}
              {UNICODE.BULLET} No swinging{"\n"}
              {UNICODE.BULLET} No shrugging{"\n"}
              {UNICODE.BULLET} Body stays quiet{"\n"}
              {"\n"}
              This is not a passive stretch.
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Breathing</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Slow nasal breathing{"\n"}
              {UNICODE.BULLET} Calm, steady rhythm
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Stop/Reset Rules</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Grip slipping{"\n"}
              {UNICODE.BULLET} Lower back tightens{"\n"}
              {UNICODE.BULLET} Shoulders elevate{"\n"}
              {UNICODE.BULLET} Hips shake{"\n"}
              {UNICODE.BULLET} Swinging appears{"\n"}
              {"\n"}
              If 60 seconds cannot be held cleanly:{"\n"}
              Break into 2{UNICODE.MULTIPLY}30s or 3{UNICODE.MULTIPLY}20s
            </Text>
          </View>

          {/* 2. Scapular Pull-Ups */}
          <View style={styles.nonNegotiableSection}>
            <Text style={styles.nonNegotiableHeader}>
              2. SCAPULAR PULL-UPS {UNICODE.DASH} 15 TOTAL REPS
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Setup</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Overhand grip{"\n"}
              {UNICODE.BULLET} Arms completely straight{"\n"}
              {UNICODE.BULLET} Dead hang start{"\n"}
              {UNICODE.BULLET} Ribs down{"\n"}
              {UNICODE.BULLET} Glutes lightly engaged{"\n"}
              {"\n"}
              Elbows must stay locked.
            </Text>

            <Text style={styles.nonNegotiableSubheading}>
              Execution (Step-by-Step)
            </Text>
            <Text style={styles.nonNegotiableText}>
              1. Pull shoulders down (depress){"\n"}
              2. Think "put shoulders in back pockets"{"\n"}
              3. Body rises 2{UNICODE.DASH}3 cm only{"\n"}
              4. Pause 1 second at top{"\n"}
              5. Slowly return to full hang{"\n"}
              {"\n"}
              That is one rep.{"\n"}
              If the movement looks big, it's wrong.
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Breathing</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Exhale as shoulders depress{"\n"}
              {UNICODE.BULLET} Inhale returning to hang
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Stop Rules</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Elbows bend{"\n"}
              {UNICODE.BULLET} Lower back arches{"\n"}
              {UNICODE.BULLET} Hips swing{"\n"}
              {UNICODE.BULLET} Neck strains{"\n"}
              {UNICODE.BULLET} Shoulders elevate instead of depress
            </Text>

            <Text style={styles.nonNegotiableSubheading}>
              Scaling (If 15 clean reps not possible)
            </Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Cluster sets: 2 reps, rest 20{UNICODE.DASH}30s,
              repeat until 15 total{"\n"}
              OR{"\n"}
              {UNICODE.BULLET} Isometric: Hold scap-down position 5
              {UNICODE.DASH}10s {UNICODE.MULTIPLY} 5{UNICODE.DASH}6 sets
            </Text>
          </View>

          {/* 3. Chin Tucks */}
          <View style={styles.nonNegotiableSection}>
            <Text style={styles.nonNegotiableHeader}>
              3. CHIN TUCKS {UNICODE.DASH} 20 CONTROLLED REPS
            </Text>

            <Text style={styles.nonNegotiableSubheading}>
              Setup (Choose one)
            </Text>
            <Text style={styles.nonNegotiableText}>
              Floor:{"\n"}
              {UNICODE.BULLET} Lie on back{"\n"}
              {UNICODE.BULLET} Knees bent{"\n"}
              {UNICODE.BULLET} Back of head resting on floor{"\n"}
              {"\n"}
              Wall:{"\n"}
              {UNICODE.BULLET} Stand with back against wall{"\n"}
              {UNICODE.BULLET} Back of head lightly touching wall
            </Text>

            <Text style={styles.nonNegotiableSubheading}>
              Execution (Step-by-Step)
            </Text>
            <Text style={styles.nonNegotiableText}>
              1. Gently pull chin straight back{"\n"}
              2. Create a "double chin"{"\n"}
              3. Head stays level (no nodding){"\n"}
              4. Hold 1{UNICODE.DASH}2 seconds{"\n"}
              5. Relax and repeat{"\n"}
              {"\n"}
              This is a retraction, not a tilt.
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Execution Focus</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Neck stays long{"\n"}
              {UNICODE.BULLET} Jaw relaxed{"\n"}
              {UNICODE.BULLET} Shoulders stay down{"\n"}
              {UNICODE.BULLET} Minimal effort
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Breathing</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Normal nasal breathing{"\n"}
              {UNICODE.BULLET} Do not brace
            </Text>

            <Text style={styles.nonNegotiableSubheading}>Stop Rules</Text>
            <Text style={styles.nonNegotiableText}>
              {UNICODE.BULLET} Neck strain{"\n"}
              {UNICODE.BULLET} Head tilts up or down{"\n"}
              {UNICODE.BULLET} Jaw clenches{"\n"}
              {UNICODE.BULLET} Shoulders elevate{"\n"}
              {UNICODE.BULLET} Head lifts off floor/wall
            </Text>
          </View>
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
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  statusCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusWarning: {
    fontSize: 14,
    color: "#D32F2F",
    marginTop: 8,
    fontWeight: "bold",
  },
  checkInButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dayNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dayNumberText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  dayDuration: {
    fontSize: 14,
    color: "#666",
  },
  exerciseList: {
    marginTop: 8,
  },
  exerciseItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    paddingLeft: 8,
  },
  nonNegotiablesCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFB74D",
  },
  nonNegotiablesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 8,
    textAlign: "center",
  },
  nonNegotiablesSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  nonNegotiablesDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  nonNegotiablesWarning: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D84315",
    marginBottom: 16,
    fontStyle: "italic",
  },
  nonNegotiableSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  nonNegotiableHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 12,
  },
  nonNegotiableSubheading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
    marginBottom: 4,
  },
  nonNegotiableText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  nonNegotiableItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  historyButton: {
    backgroundColor: "#757575",
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 24,
  },
  historyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
