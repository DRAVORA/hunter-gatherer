import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

import {
  AppetiteStatus,
  SorenessLevel,
} from "../types";
import { calculateReadiness } from "../utils/calculations";
import { formatDate } from "../utils/formatting";
import { validateSleepHours } from "../utils/validation";
import { getDatabase } from "../database/init";

type DailyCheckInScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyCheckIn"
>;

interface Props {
  navigation: DailyCheckInScreenNavigationProp;
}

// ============================================================================
// DAILY CHECK-IN SCREEN
// ============================================================================

export default function DailyCheckInScreen({ navigation }: Props) {
  const [sleepHours, setSleepHours] = useState("8.0");
  const [morningHydration, setMorningHydration] = useState(false);
  const [appetiteStatus, setAppetiteStatus] = useState<AppetiteStatus>(
    AppetiteStatus.NORMAL,
  );
  const [sorenessLevel, setSorenessLevel] = useState<SorenessLevel>(
    SorenessLevel.NONE,
  );
  const [hasSharpPain, setHasSharpPain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    // Validate sleep hours
    const hours = parseFloat(sleepHours);
    const error = validateSleepHours(hours);

    if (error) {
      Alert.alert("Validation Error", error.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get recent check-ins to calculate consecutive poor nights
      const db = getDatabase();
      const recentCheckIns = await db.getAllAsync<{ sleep_hours: number }>(
        "SELECT sleep_hours FROM daily_checkin ORDER BY date DESC LIMIT 2",
      );

      const recentSleepHours = recentCheckIns.map((c) => c.sleep_hours);
      let consecutivePoorNights = 0;

      // Add today's sleep to the front
      if (hours < 6.5) {
        consecutivePoorNights = 1;
        // Check if yesterday was also poor
        if (recentSleepHours.length > 0 && recentSleepHours[0] < 6.5) {
          consecutivePoorNights = 2;
        }
      }

      // Calculate readiness
      const readiness = calculateReadiness(
        hours,
        hasSharpPain,
        consecutivePoorNights,
      );

      // Save check-in
      const checkInId = uuidv4();
      const today = formatDate(new Date());

      await db.runAsync(
        `INSERT INTO daily_checkin (
          id, date, sleep_hours, morning_hydration_complete,
          appetite_status, soreness_level, has_sharp_pain,
          readiness_status, volume_adjustment_percent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          checkInId,
          today,
          hours,
          morningHydration ? 1 : 0,
          appetiteStatus,
          sorenessLevel,
          hasSharpPain ? 1 : 0,
          readiness.status,
          readiness.volumeAdjustmentPercent,
          new Date().toISOString(),
        ],
      );

      console.log("[DailyCheckIn] Check-in saved:", checkInId);

      // Navigate to home screen with programId
      navigation.navigate("Home", { programId: "no-gym" });
    } catch (error) {
      console.error("[DailyCheckIn] Failed to save:", error);
      Alert.alert("Error", "Failed to save check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.instructions}>
          Complete this before starting any training session.
        </Text>

        {/* Sleep Hours */}
        <View style={styles.section}>
          <Text style={styles.label}>Sleep Hours</Text>
          <TextInput
            style={styles.input}
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="decimal-pad"
            placeholder="8.0"
          />
        </View>

        {/* Morning Hydration */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setMorningHydration(!morningHydration)}
          >
            <View
              style={[
                styles.checkboxBox,
                morningHydration && styles.checkboxBoxChecked,
              ]}
            >
              {morningHydration && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Morning hydration complete (750ml + ¼ tsp salt)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appetite Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Appetite Status</Text>
          {Object.values(AppetiteStatus).map((status) => (
            <TouchableOpacity
              key={status}
              style={styles.radio}
              onPress={() => setAppetiteStatus(status)}
            >
              <View style={styles.radioCircle}>
                {appetiteStatus === status && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Soreness Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Soreness Level</Text>
          {Object.values(SorenessLevel).map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.radio}
              onPress={() => setSorenessLevel(level)}
            >
              <View style={styles.radioCircle}>
                {sorenessLevel === level && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sharp Pain */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setHasSharpPain(!hasSharpPain)}
          >
            <View
              style={[
                styles.checkboxBox,
                hasSharpPain && styles.checkboxBoxChecked,
              ]}
            >
              {hasSharpPain && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Sharp pain present</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Saving..." : "Complete Check-In"}
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#757575",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  checkboxBoxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  radio: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#757575",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  radioCircleSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2196F3",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
