import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { getTimerSnapshot } from "../utils/timing";

// Wall-clock deadlines survive delayed ticks and backgrounding. Completion is
// delivered once, in the foreground, so a confirmation dialog is not lost.
export function useWorkoutTimer(targetSeconds: number, openEnded: boolean, onComplete: (seconds: number) => void) {
  const startedAt = useRef(Date.now());
  const completed = useRef(false);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const [snapshot, setSnapshot] = useState(() => getTimerSnapshot(startedAt.current, targetSeconds, startedAt.current, openEnded));
  const [running, setRunning] = useState(true);

  function stop() {
    if (completed.current) return;
    const value = getTimerSnapshot(startedAt.current, targetSeconds, Date.now(), openEnded);
    completed.current = true;
    setSnapshot(value);
    setRunning(false);
    callback.current(value.elapsedSeconds);
  }

  useEffect(() => {
    startedAt.current = Date.now();
    completed.current = false;
    setRunning(true);
    const tick = () => {
      if (completed.current || (AppState.currentState && AppState.currentState !== "active")) return;
      const value = getTimerSnapshot(startedAt.current, targetSeconds, Date.now(), openEnded);
      setSnapshot(value);
      if (value.complete) {
        completed.current = true;
        setRunning(false);
        callback.current(value.elapsedSeconds);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [targetSeconds, openEnded]);

  return { ...snapshot, running, stop };
}
