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
import { RouteProp } from "@react-navigation/native";
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
import { UNICODE } from "../constants/unicode";
import { theme } from "../styles/theme";

type DailyCheckInScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyCheckIn"
>;
type DailyCheckInScreenRouteProp = RouteProp<RootStackParamList, "DailyCheckIn">;

interface Props {
  navigation: DailyCheckInScreenNavigationProp;
  route: DailyCheckInScreenRouteProp;
}

// ============================================================================
// DAILY CHECK-IN SCREEN
// ============================================================================

export default function DailyCheckInScreen({ navigation, route }: Props) {
  const programId = route.params?.programId ?? "no-gym";
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

      // Navigate to home screen with programId and clear check-in from stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Home", params: { programId } }],
      });
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
            placeholderTextColor={theme.colors.text.disabled}
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
              {morningHydration && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Morning hydration complete (750ml + {UNICODE.QUARTER} tsp salt)
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
              {hasSharpPain && <Text style={styles.checkmark}>{UNICODE.CHECKMARK}</Text>}
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
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    color: theme.colors.text.primary,
  },
  instructions: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[6],
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
    color: theme.colors.text.emphasis,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  input: {
    backgroundColor: theme.colors.surface.base,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing[3],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.base,
  },
  checkboxBoxChecked: {
    backgroundColor: theme.colors.state.success,
    borderColor: theme.colors.state.success,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  radio: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    marginRight: theme.spacing[3],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.base,
  },
  radioCircleSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent.secondary,
  },
  radioLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  submitButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: "center",
    marginTop: theme.spacing[4],
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.secondaryDark,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.surface.base,
    borderColor: theme.colors.border.subtle,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});
