import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useDailyCheckIn } from "../hooks/useDailyCheckIn";
import { AppetiteStatus, SorenessLevel } from "../types";

// ============================================================================
// DAILY CHECK-IN SCREEN
// ============================================================================
// Entry point for the app - NO SKIP ALLOWED
// Collects sleep, hydration, appetite, soreness, pain data
// Calculates readiness and navigates to SessionReadinessScreen
// ============================================================================

interface DailyCheckInScreenProps {
  navigation: any;
}

export default function DailyCheckInScreen({
  navigation,
}: DailyCheckInScreenProps) {
  const {
    sleepHours,
    setSleepHours,
    morningHydration,
    setMorningHydration,
    appetite,
    setAppetite,
    soreness,
    setSoreness,
    hasSharpPain,
    setHasSharpPain,
    sharpPainLocation,
    setSharpPainLocation,
    notes,
    setNotes,
    handleSubmit,
    isSubmitting,
    error,
  } = useDailyCheckIn();

  const onSubmit = async () => {
    try {
      const result = await handleSubmit();

      // Navigate to SessionReadinessScreen with result
      navigation.navigate("SessionReadiness", {
        checkInId: result.checkInId,
        readinessStatus: result.readinessStatus,
        volumeAdjustment: result.volumeAdjustment,
        message: result.message,
        allowTraining: result.allowTraining,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to save check-in. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.subtitle}>Required before training</Text>

        {/* Sleep Hours */}
        <View style={styles.section}>
          <Text style={styles.label}>Sleep Hours (0-24)</Text>
          <TextInput
            style={styles.input}
            value={sleepHours.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 0 && num <= 24) {
                setSleepHours(num);
              }
            }}
            keyboardType="decimal-pad"
            placeholder="7.5"
          />
        </View>

        {/* Morning Hydration */}
        <View style={styles.section}>
          <Text style={styles.label}>Morning Hydration</Text>
          <Text style={styles.hint}>750ml water + 1/4 tsp salt</Text>
          <TouchableOpacity
            style={[
              styles.checkbox,
              morningHydration && styles.checkboxChecked,
            ]}
            onPress={() => setMorningHydration(!morningHydration)}
          >
            <Text style={styles.checkboxLabel}>
              {morningHydration ? "✓ Complete" : "Incomplete"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appetite Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Appetite Status</Text>
          <View style={styles.radioGroup}>
            <RadioButton
              label="Normal"
              selected={appetite === AppetiteStatus.NORMAL}
              onPress={() => setAppetite(AppetiteStatus.NORMAL)}
            />
            <RadioButton
              label="Reduced"
              selected={appetite === AppetiteStatus.REDUCED}
              onPress={() => setAppetite(AppetiteStatus.REDUCED)}
            />
            <RadioButton
              label="None"
              selected={appetite === AppetiteStatus.NONE}
              onPress={() => setAppetite(AppetiteStatus.NONE)}
            />
          </View>
        </View>

        {/* Soreness Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Soreness Level</Text>
          <View style={styles.radioGroup}>
            <RadioButton
              label="None"
              selected={soreness === SorenessLevel.NONE}
              onPress={() => setSoreness(SorenessLevel.NONE)}
            />
            <RadioButton
              label="Light"
              selected={soreness === SorenessLevel.LIGHT}
              onPress={() => setSoreness(SorenessLevel.LIGHT)}
            />
            <RadioButton
              label="Moderate"
              selected={soreness === SorenessLevel.MODERATE}
              onPress={() => setSoreness(SorenessLevel.MODERATE)}
            />
            <RadioButton
              label="Severe"
              selected={soreness === SorenessLevel.SEVERE}
              onPress={() => setSoreness(SorenessLevel.SEVERE)}
            />
          </View>
        </View>

        {/* Sharp Pain */}
        <View style={styles.section}>
          <Text style={styles.label}>Sharp Pain?</Text>
          <View style={styles.radioGroup}>
            <RadioButton
              label="No"
              selected={!hasSharpPain}
              onPress={() => setHasSharpPain(false)}
            />
            <RadioButton
              label="Yes"
              selected={hasSharpPain}
              onPress={() => setHasSharpPain(true)}
            />
          </View>

          {hasSharpPain && (
            <View style={styles.conditionalInput}>
              <Text style={styles.label}>Pain Location</Text>
              <TextInput
                style={styles.input}
                value={sharpPainLocation}
                onChangeText={setSharpPainLocation}
                placeholder="e.g., left knee, right shoulder"
              />
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Check-In"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// RADIO BUTTON COMPONENT
// ============================================================================

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function RadioButton({ label, selected, onPress }: RadioButtonProps) {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      <View
        style={[styles.radioCircle, selected && styles.radioCircleSelected]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// BASIC STYLES (NO THEMING YET)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
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
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#000",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  radioGroup: {
    gap: 8,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCC",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#4CAF50",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  radioLabel: {
    fontSize: 16,
    color: "#000",
  },
  conditionalInput: {
    marginTop: 12,
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
