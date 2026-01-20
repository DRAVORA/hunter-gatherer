import { useState } from "react";
import { useDatabase } from "./useDatabase";
import {
  AppetiteStatus,
  SorenessLevel,
  ReadinessStatus,
  ReadinessCalculation,
} from "../types";
import {
  calculateReadiness,
  getConsecutivePoorNights,
} from "../utils/calculations";
import { getTodayDate } from "../utils/formatting";

// ============================================================================
// USE DAILY CHECK-IN HOOK
// ============================================================================
// Manages check-in form state and readiness calculation
// ============================================================================

interface CheckInResult {
  checkInId: string;
  readinessStatus: ReadinessStatus;
  volumeAdjustment: number;
  message: string;
  allowTraining: boolean;
}

export function useDailyCheckIn() {
  const db = useDatabase();

  // Form state
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [morningHydration, setMorningHydration] = useState(false);
  const [appetite, setAppetite] = useState<AppetiteStatus>(
    AppetiteStatus.NORMAL,
  );
  const [soreness, setSoreness] = useState<SorenessLevel>(SorenessLevel.NONE);
  const [hasSharpPain, setHasSharpPain] = useState(false);
  const [sharpPainLocation, setSharpPainLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<CheckInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Get recent sleep history for consecutive poor nights calculation
      const recentSleep = await db.getRecentSleepHours(2);
      const consecutivePoorNights = getConsecutivePoorNights([
        sleepHours,
        ...recentSleep,
      ]);

      // 2. Calculate readiness
      const readiness: ReadinessCalculation = calculateReadiness(
        sleepHours,
        hasSharpPain,
        consecutivePoorNights,
      );

      // 3. Save to database
      const checkInId = await db.saveDailyCheckIn({
        date: getTodayDate(),
        sleepHours,
        morningHydrationComplete: morningHydration,
        appetiteStatus: appetite,
        sorenessLevel: soreness,
        hasSharpPain,
        sharpPainLocation: hasSharpPain ? sharpPainLocation : undefined,
        readinessStatus: readiness.status,
        volumeAdjustmentPercent: readiness.volumeAdjustmentPercent,
        notes,
      });

      return {
        checkInId,
        readinessStatus: readiness.status,
        volumeAdjustment: readiness.volumeAdjustmentPercent,
        message: readiness.message,
        allowTraining: readiness.allowTraining,
      };
    } catch (err) {
      console.error("[useDailyCheckIn] Submit error:", err);
      setError(String(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSleepHours(7.5);
    setMorningHydration(false);
    setAppetite(AppetiteStatus.NORMAL);
    setSoreness(SorenessLevel.NONE);
    setHasSharpPain(false);
    setSharpPainLocation("");
    setNotes("");
    setError(null);
  };

  return {
    // Form state
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
    // Actions
    handleSubmit,
    reset,
    // Status
    isSubmitting,
    error,
  };
}
