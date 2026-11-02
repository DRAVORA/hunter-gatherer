// Zero means an open-ended stopwatch only when explicitly requested.
export function getTimerSnapshot(startedAt: number, targetSeconds: number, now: number, openEnded = false) {
  const elapsedMs = Math.max(0, now - startedAt);
  const durationMs = Math.max(0, targetSeconds) * 1000;
  return {
    elapsedSeconds: Math.floor((openEnded ? elapsedMs : Math.min(elapsedMs, durationMs)) / 1000),
    remainingSeconds: openEnded ? 0 : Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000)),
    complete: !openEnded && elapsedMs >= durationMs,
  };
}

export function isPerSideDuration(exercise: { targetDuration?: number; targetDescription?: string }): boolean {
  return exercise.targetDuration !== undefined && /each side|per side/i.test(exercise.targetDescription ?? "");
}
