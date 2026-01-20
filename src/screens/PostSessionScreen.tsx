import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useDatabase } from "../hooks/useDatabase";
import { SessionFeel } from "../types";
import { getCurrentTimestamp } from "../utils/formatting";

// ============================================================================
// POST SESSION SCREEN
// ============================================================================
// Collects post-session feedback
// Updates training session and navigates to history
// ============================================================================

interface PostSessionScreenProps {
  route: any;
  navigation: any;
}

export default function PostSessionScreen({
  route,
  navigation,
}: PostSessionScreenProps) {
  const { sessionId } = route.params;
  const db = useDatabase();

  const [appetiteReturned, setAppetiteReturned] = useState<boolean | null>(
    null,
  );
  const [sessionFeel, setSessionFeel] = useState<SessionFeel | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogSession = async () => {
    // Validation
    if (appetiteReturned === null) {
      Alert.alert("Missing Info", "Please indicate if appetite returned.");
      return;
    }

    if (sessionFeel === null) {
      Alert.alert("Missing Info", "Please indicate how the session felt.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update training session with post-session data
      await db.updateTrainingSession(sessionId, {
        endTime: getCurrentTimestamp(),
        appetiteReturnedWithin60Min: appetiteReturned,
        sessionFeel,
        notes: notes || undefined,
      });

      // Show success message
      Alert.alert("Session Logged", "Great work! Session saved successfully.", [
        {
          text: "View History",
          onPress: () => navigation.navigate("SessionHistory"),
        },
        {
          text: "OK",
          onPress: () => navigation.navigate("SessionHistory"),
        },
      ]);
    } catch (err) {
      console.error("[PostSession] Failed to log session:", err);
      Alert.alert("Error", "Failed to log session. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Session Complete</Text>
          <Text style={styles.subtitle}>How did it go?</Text>
        </View>

        {/* Appetite Return Check */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Did appetite return within 60 minutes?
          </Text>
          <Text style={styles.hint}>
            Appetite return indicates good recovery tolerance
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                appetiteReturned === true && styles.optionButtonSelected,
              ]}
              onPress={() => setAppetiteReturned(true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  appetiteReturned === true && styles.optionButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                appetiteReturned === false && styles.optionButtonSelected,
              ]}
              onPress={() => setAppetiteReturned(false)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  appetiteReturned === false && styles.optionButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {appetiteReturned === false && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Consider reducing volume next session
              </Text>
            </View>
          )}
        </View>

        {/* Session Feel */}
        <View style={styles.section}>
          <Text style={styles.label}>Session felt:</Text>
          <Text style={styles.hint}>
            Be honest - this helps adjust future sessions
          </Text>

          <TouchableOpacity
            style={[
              styles.feelOption,
              sessionFeel === SessionFeel.CONTROLLED &&
                styles.feelOptionSelected,
            ]}
            onPress={() => setSessionFeel(SessionFeel.CONTROLLED)}
          >
            <View style={styles.feelContent}>
              <Text style={styles.feelTitle}>Controlled</Text>
              <Text style={styles.feelDescription}>
                All reps clean, could have done more
              </Text>
            </View>
            {sessionFeel === SessionFeel.CONTROLLED && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feelOption,
              sessionFeel === SessionFeel.PUSHED && styles.feelOptionSelected,
            ]}
            onPress={() => setSessionFeel(SessionFeel.PUSHED)}
          >
            <View style={styles.feelContent}>
              <Text style={styles.feelTitle}>Pushed</Text>
              <Text style={styles.feelDescription}>
                Final sets challenging, form held
              </Text>
            </View>
            {sessionFeel === SessionFeel.PUSHED && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feelOption,
              sessionFeel === SessionFeel.EASY && styles.feelOptionSelected,
            ]}
            onPress={() => setSessionFeel(SessionFeel.EASY)}
          >
            <View style={styles.feelContent}>
              <Text style={styles.feelTitle}>Easy</Text>
              <Text style={styles.feelDescription}>
                Felt light, ready for more volume
              </Text>
            </View>
            {sessionFeel === SessionFeel.EASY && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <Text style={styles.hint}>
            Compensation patterns, pain, or other observations
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Right shoulder felt tight on overhead press..."
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting ||
              appetiteReturned === null ||
              sessionFeel === null) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleLogSession}
          disabled={
            isSubmitting || appetiteReturned === null || sessionFeel === null
          }
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Logging..." : "Log Session"}
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
    backgroundColor: "#FFF",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  hint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  optionButtonSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  optionButtonTextSelected: {
    color: "#FFF",
  },
  warningBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  warningText: {
    fontSize: 14,
    color: "#333",
  },
  feelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCC",
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  feelOptionSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  feelContent: {
    flex: 1,
  },
  feelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  feelDescription: {
    fontSize: 14,
    color: "#666",
  },
  checkmark: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 12,
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
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 18,
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
    fontSize: 20,
    fontWeight: "bold",
  },
});
