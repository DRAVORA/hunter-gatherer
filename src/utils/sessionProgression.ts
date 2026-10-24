import { ProgramExercise } from "../types";

export interface SessionPosition {
  exerciseIndex: number;
  setNumber: number;
}

// Superset members must be adjacent. Each keeps its own set number and log.
export function getNextStrengthPosition(
  exercises: ProgramExercise[],
  exerciseIndex: number,
  setNumber: number,
): SessionPosition | null {
  const current = exercises[exerciseIndex];
  if (current.supersetId) {
    let first = exerciseIndex;
    let last = exerciseIndex;
    while (first > 0 && exercises[first - 1].supersetId === current.supersetId) first--;
    while (last + 1 < exercises.length && exercises[last + 1].supersetId === current.supersetId) last++;

    for (let i = exerciseIndex + 1; i <= last; i++) {
      if (exercises[i].targetSets >= setNumber) return { exerciseIndex: i, setNumber };
    }
    for (let i = first; i <= last; i++) {
      if (exercises[i].targetSets > setNumber) return { exerciseIndex: i, setNumber: setNumber + 1 };
    }
    return last + 1 < exercises.length ? { exerciseIndex: last + 1, setNumber: 1 } : null;
  }
  if (setNumber < current.targetSets) return { exerciseIndex, setNumber: setNumber + 1 };
  return exerciseIndex + 1 < exercises.length ? { exerciseIndex: exerciseIndex + 1, setNumber: 1 } : null;
}

export function getRestAfterSet(
  current: ProgramExercise,
  next: SessionPosition | null,
  exerciseIndex: number,
): number {
  if (!next) return 0;
  // Superset rest belongs to the exercise just completed, even when switching.
  return current.supersetId || next.exerciseIndex === exerciseIndex
    ? current.restTimeSeconds
    : 0;
}
