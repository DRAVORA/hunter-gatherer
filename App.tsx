import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initDatabase, checkDatabaseHealth, getDatabase } from "./src/database/init";

// Import screens
import DisclaimerScreen from "./src/screens/DisclaimerScreen";
import ProgramSelectionScreen from "./src/screens/ProgramSelectionScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DailyCheckInScreen from "./src/screens/DailyCheckInScreen";
import SessionReadinessScreen from "./src/screens/SessionReadinessScreen";
import ExerciseExecutionScreen from "./src/screens/ExerciseExecutionScreen";
import PostSessionScreen from "./src/screens/PostSessionScreen";
import SessionHistoryScreen from "./src/screens/SessionHistoryScreen";
import TrainingManualScreen from "./src/screens/TrainingManualScreen";

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Disclaimer: undefined;
  ProgramSelection: undefined;
  Home: { programId?: string }; // Make optional
  TrainingManual: undefined;
  DailyCheckIn: undefined;
  SessionReadiness: {
    sessionId: string;
    checkInId: string;
    readinessStatus: string;
    volumeAdjustmentPercent: number;
  };
  ExerciseExecution: {
    sessionId: string;
    programName: string;
    sessionName: string;
  };
  PostSession: {
    sessionId: string;
  };
  SessionHistory: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  async function initializeDatabase() {
    try {
      console.log("[App] Initializing database...");
      await initDatabase();

      const health = await checkDatabaseHealth();
      console.log("[App] Database health:", health);

      if (!health.healthy) {
        throw new Error(
          `Database unhealthy: version=${health.version}, tables=${health.tableCount}`,
        );
      }

      // Check if disclaimer has been accepted
      const db = getDatabase();
      const result = await db.getFirstAsync<{ disclaimer_accepted: number }>(
        "SELECT disclaimer_accepted FROM app_settings WHERE id = 'app_settings'"
      );
      const accepted = result?.disclaimer_accepted === 1;
      console.log("[App] Disclaimer accepted:", accepted);
      setDisclaimerAccepted(accepted);

      setIsDbReady(true);
      console.log("[App] Database ready");
    } catch (error) {
      console.error("[App] Database initialization failed:", error);
      setDbError(String(error));
    }
  }

  // Loading state
  if (!isDbReady && !dbError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2635" />
        <Text style={styles.loadingText}>Loading ATAVIA...</Text>
      </View>
    );
  }

  // Still checking disclaimer status
  if (disclaimerAccepted === null && !dbError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2635" />
        <Text style={styles.loadingText}>Loading ATAVIA...</Text>
      </View>
    );
  }

  // Error state
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
        <Text style={styles.errorHint}>
          Try restarting the app. If the problem persists, the database may need
          to be reset.
        </Text>
      </View>
    );
  }

  // Determine initial route based on disclaimer acceptance
  const initialRouteName = disclaimerAccepted ? "ProgramSelection" : "Disclaimer";

  // Main app navigation
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2B2B2B",
          },
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen
          name="Disclaimer"
          component={DisclaimerScreen}
          options={{
            title: "Health & Safety",
            headerLeft: () => null, // No back button on disclaimer
          }}
        />

        <Stack.Screen
          name="ProgramSelection"
          component={ProgramSelectionScreen}
          options={{
            title: "Select Program",
            headerLeft: () => null, // No back button on program selection
          }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "ATAVIA",
          }}
        />

        <Stack.Screen
          name="TrainingManual"
          component={TrainingManualScreen}
          options={{
            title: "Training Manual",
          }}
        />

        <Stack.Screen
          name="DailyCheckIn"
          component={DailyCheckInScreen}
          options={{
            title: "Daily Check-In",
          }}
        />

        <Stack.Screen
          name="SessionReadiness"
          component={SessionReadinessScreen}
          options={{
            title: "Session Readiness",
          }}
        />

        <Stack.Screen
          name="ExerciseExecution"
          component={ExerciseExecutionScreen}
          options={{
            title: "Training Session",
            headerLeft: () => null, // Prevent back navigation during session
          }}
        />

        <Stack.Screen
          name="PostSession"
          component={PostSessionScreen}
          options={{
            title: "Session Complete",
            headerLeft: () => null, // No back button on post-session
          }}
        />

        <Stack.Screen
          name="SessionHistory"
          component={SessionHistoryScreen}
          options={{
            title: "Session History",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
