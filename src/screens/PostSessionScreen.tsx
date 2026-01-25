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
// POST-SESSION SCREEN (PLACEHOLDER)
// ============================================================================

export default function PostSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;

  const [appetiteReturned, setAppetiteReturned] = useState<boolean | null>(
    null,
  );
  const [sessionFeel, setSessionFeel] = useState<SessionFeel | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programId, setProgramId] = useState<string>("no-gym"); // Default to no-gym

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
    marginBottom: 24,
    color: "#000",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#CCC",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  choiceButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  choiceButtonTextSelected: {
    color: "#FFF",
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
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: "#000",
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
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
