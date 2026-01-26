import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

import { SessionFeel } from "../types";
import { getDatabase } from "../database/init";
import { theme } from "../styles/theme";

type PostSessionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PostSession"
>;

type PostSessionRouteProp = RouteProp<RootStackParamList, "PostSession">;

interface Props {
  navigation: PostSessionNavigationProp;
  route: PostSessionRouteProp;
}

// ============================================================================
// POST-SESSION SCREEN
// ============================================================================

export default function PostSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;

  const [appetiteReturned, setAppetiteReturned] = useState<boolean | null>(
    null,
  );
  const [sessionFeel, setSessionFeel] = useState<SessionFeel | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programId, setProgramId] = useState<string>("no-gym");

  // Load session data to get program info
  useEffect(() => {
    loadSessionData();
  }, []);

  async function loadSessionData() {
    try {
      const db = getDatabase();
      const session = await db.getFirstAsync<any>(
        "SELECT program_name FROM training_session WHERE id = ?",
        [sessionId],
      );
      
      // Determine programId from program_name
      if (session?.program_name?.includes("Gym")) {
        setProgramId("gym");
      } else if (session?.program_name?.includes("No-Gym")) {
        setProgramId("no-gym");
      }
    } catch (error) {
      console.error("[PostSession] Failed to load session data:", error);
    }
  }

  const canSubmit = appetiteReturned !== null && sessionFeel !== null;

  async function handleSubmit() {
    if (!canSubmit) {
      Alert.alert("Error", "Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getDatabase();

      // Update session with post-session data
      await db.runAsync(
        `UPDATE training_session 
         SET appetite_returned_within_60_min = ?, 
             session_feel = ?, 
             notes = ?
         WHERE id = ?`,
        [appetiteReturned ? 1 : 0, sessionFeel, notes || null, sessionId],
      );

      console.log("[PostSession] Session data saved:", sessionId);

      Alert.alert("Session Complete", "Your training session has been logged.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home", { programId }),
        },
      ]);
    } catch (error) {
      console.error("[PostSession] Failed to save:", error);
      Alert.alert("Error", "Failed to save session data. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Session Complete</Text>

        {/* Appetite Returned */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Did your appetite return within 60 minutes?
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                appetiteReturned === true && styles.choiceButtonSelected,
              ]}
              onPress={() => setAppetiteReturned(true)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  appetiteReturned === true && styles.choiceButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                appetiteReturned === false && styles.choiceButtonSelected,
              ]}
              onPress={() => setAppetiteReturned(false)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  appetiteReturned === false && styles.choiceButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Session Feel */}
        <View style={styles.section}>
          <Text style={styles.label}>How did the session feel?</Text>
          {Object.values(SessionFeel).map((feel) => (
            <TouchableOpacity
              key={feel}
              style={styles.radio}
              onPress={() => setSessionFeel(feel)}
            >
              <View style={styles.radioCircle}>
                {sessionFeel === feel && (
                  <View style={styles.radioCircleSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>{feel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any observations or concerns..."
            placeholderTextColor={theme.colors.text.disabled}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Saving..." : "Log Session"}
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
    marginBottom: theme.spacing[6],
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[3],
    color: theme.colors.text.emphasis,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  choiceButton: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  choiceButtonSelected: {
    backgroundColor: theme.colors.accent.secondary,
    borderColor: theme.colors.accent.secondaryDark,
  },
  choiceButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  choiceButtonTextSelected: {
    color: theme.colors.text.primary,
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
  textInput: {
    backgroundColor: theme.colors.surface.base,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    textAlignVertical: "top",
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: theme.colors.accent.secondary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.accent.secondaryDark,
    alignItems: "center",
    marginTop: theme.spacing[4],
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
