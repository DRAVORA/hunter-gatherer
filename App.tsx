import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// Database
import { initDatabase } from "./src/database/init";

// Screens
import DailyCheckInScreen from "./src/screens/DailyCheckInScreen";
import SessionReadinessScreen from "./src/screens/SessionReadinessScreen";
import ExerciseExecutionScreen from "./src/screens/ExerciseExecutionScreen";
import PostSessionScreen from "./src/screens/PostSessionScreen";
import SessionHistoryScreen from "./src/screens/SessionHistoryScreen";

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  DailyCheckIn: undefined;
  SessionReadiness: {
    checkInId: string;
    readinessStatus: string;
    volumeAdjustment: number;
    message: string;
    allowTraining: boolean;
  };
  ExerciseExecution: {
    sessionId: string;
    programExercises: any[];
    volumeAdjustment: number;
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

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log("[App] Initializing database...");
      await initDatabase();
      console.log("[App] Database initialized successfully");
      setIsDbReady(true);
    } catch (err) {
      console.error("[App] Database initialization failed:", err);
      setDbError(String(err));
    }
  };

  // Show loading screen while database initializes
  if (!isDbReady) {
    if (dbError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Database Error</Text>
          <Text style={styles.errorText}>{dbError}</Text>
          <Text style={styles.errorHint}>
            Please restart the app. If the problem persists, reinstall.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="DailyCheckIn"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#FFF",
            },
            headerTintColor: "#000",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="DailyCheckIn"
            component={DailyCheckInScreen}
            options={{
              title: "Daily Check-In",
              headerLeft: () => null, // Prevent going back
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
              title: "Training",
              headerLeft: () => null, // Prevent going back during workout
            }}
          />

          <Stack.Screen
            name="PostSession"
            component={PostSessionScreen}
            options={{
              title: "Session Complete",
              headerLeft: () => null, // Prevent going back
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
    </>
  );
}

// ============================================================================
// BASIC STYLES
// ============================================================================

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
});
