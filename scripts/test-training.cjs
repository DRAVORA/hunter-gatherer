const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'atavia-training-'));
try {
  execFileSync(process.execPath, [
    require.resolve('typescript/bin/tsc'),
    'src/data/programs.ts', 'src/data/programOptions.ts', 'src/data/exercises.ts',
    'src/utils/sessionProgression.ts', 'src/utils/calculations.ts',
    '--outDir', output, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck',
  ], { cwd: root, stdio: 'inherit' });
  const { PROGRAMS, getProgramById, getSessionByProgramAndName } = require(path.join(output, 'data/programs.js'));
  const { PROGRAM_OPTIONS, getProgramOptionByName } = require(path.join(output, 'data/programOptions.js'));
  const { getExerciseRules } = require(path.join(output, 'data/exercises.js'));
  const { getNextStrengthPosition, getRestAfterSet } = require(path.join(output, 'utils/sessionProgression.js'));
  const { applyVolumeAdjustment } = require(path.join(output, 'utils/calculations.js'));

  function trace(exercises) {
    const steps = [];
    let position = { exerciseIndex: 0, setNumber: 1 };
    while (position) {
      assert.ok(steps.length < 200, 'Session must terminate');
      const { exerciseIndex, setNumber } = position;
      const next = getNextStrengthPosition(exercises, exerciseIndex, setNumber);
      steps.push({ exerciseIndex, setNumber, rest: getRestAfterSet(exercises[exerciseIndex], next, exerciseIndex) });
      position = next;
    }
    return steps;
  }

  // Independent prescriptions from the updated PDF: sets, reps/seconds, timer seconds.
  const expected = [
    [[3,8,180],[3,10,180],[3,20,60],[3,12,15],[3,15,90],[3,15,45],[3,15,45],[3,15,60],[2,30,30]],
    [[3,10,180],[3,10,180],[3,20,60],[3,12,15],[3,15,90],[3,12,90],[3,30,30],[2,30,30],[2,10,30]],
  ];
  const rehab = getProgramById('upper-body-atfl');
  assert.equal(rehab.sessions.length, 2);
  rehab.sessions.forEach((session, index) => {
    assert.deepEqual(session.exercises.map(e => [e.targetSets, e.targetDuration ?? e.targetReps, e.restTimeSeconds]), expected[index]);
    assert.ok(session.exercises.every(e => !/crunch|abdominal|neck/i.test(e.exerciseName)));
    for (const e of session.exercises) {
      const rules = getExerciseRules(e.exerciseName);
      assert.ok(rules.setup.length > 0, e.exerciseName);
      assert.ok(rules.perform?.length >= 2, `Missing how-to: ${e.exerciseName}`);
      assert.ok(rules.executionFocus.length > 0);
      assert.equal(e.targetDuration !== undefined, /balance/.test(e.exerciseName));
    }
    for (const percent of [0, 30, 50]) {
      const exercises = session.exercises.map(e => ({ ...e, targetSets: applyVolumeAdjustment(e.targetSets, percent).adjustedSets }));
      const steps = trace(exercises);
      const rounds = exercises[3].targetSets;
      const pairs = steps.filter(s => s.exerciseIndex === 3 || s.exerciseIndex === 4);
      assert.deepEqual(pairs, Array.from({ length: rounds }, (_, i) => [
        { exerciseIndex: 3, setNumber: i + 1, rest: 15 },
        { exerciseIndex: 4, setNumber: i + 1, rest: 90 },
      ]).flat());
      exercises.forEach((e, i) => assert.deepEqual(steps.filter(s => s.exerciseIndex === i).map(s => s.setNumber), Array.from({ length: e.targetSets }, (_, n) => n + 1)));
      assert.equal(steps.at(-1).rest, 0);
    }
  });

  const standalone = getProgramById('atfl-standalone');
  assert.equal(standalone.sessions.length, 1);
  const ankleExercises = standalone.sessions[0].exercises;
  assert.deepEqual(ankleExercises.map(e => [e.exerciseName, e.targetSets, e.targetDuration ?? e.targetReps, e.restTimeSeconds]), [
    ['ATFL: Band eversion', 3, 15, 45],
    ['ATFL: Band dorsiflexion', 3, 15, 45],
    ['ATFL: Seated calf raises', 3, 15, 60],
    ['ATFL: Supported single-leg balance', 2, 30, 30],
    ['ATFL: Supported double-leg calf raises', 3, 12, 90],
    ['ATFL: Tandem balance', 2, 30, 30],
    ['ATFL: Knee-to-wall mobility', 2, 10, 30],
  ]);
  assert.ok(ankleExercises.every(e => !e.supersetId));
  assert.equal(new Set(ankleExercises.map(e => e.exerciseName)).size, 7);
  assert.equal(trace(ankleExercises).length, 18);

  const ids = [];
  for (const option of PROGRAM_OPTIONS) {
    const program = getProgramById(option.programId);
    assert.equal(program.name, option.databaseName);
    assert.equal(getProgramOptionByName(program.name).id, option.id);
    for (const session of program.sessions) {
      assert.equal(getSessionByProgramAndName(program.name, session.name), session);
      session.exercises.forEach((e, i) => {
        ids.push(e.id);
        assert.equal(e.orderInSession, i + 1);
        assert.equal(e.sessionId, session.id);
        const rules = getExerciseRules(e.exerciseName);
        assert.ok(rules?.setup.length && rules?.perform?.length, `Missing how-to: ${e.exerciseName}`);
      });
      if (option.id !== 'atfl-rehab' && option.id !== 'mobility') {
        assert.deepEqual(trace(session.exercises).map(s => [s.exerciseIndex, s.setNumber]), session.exercises.flatMap((e, i) => Array.from({ length: e.targetSets }, (_, n) => [i, n + 1])));
      }
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  // A superset at the end of a session must finish without another rest timer.
  const pair = rehab.sessions[0].exercises.slice(3, 5);
  assert.equal(trace(pair).at(-1).rest, 0);
  // Unequal set counts must not repeat or omit completed work.
  assert.deepEqual(trace([{ ...pair[0], targetSets: 2 }, pair[1]]).map(s => [s.exerciseIndex,s.setNumber]), [[0,1],[1,1],[0,2],[1,2],[1,3]]);
  console.log(`PASS: updated PDF prescriptions, full/reduced superset order and rests, logging positions, all ${PROGRAMS.length} programs, and how-to coverage.`);
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
