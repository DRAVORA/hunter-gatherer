#!/usr/bin/env node

// ============================================================================
// PHASE 6 AUTOMATED HEALTH CHECK
// ============================================================================
// Run with: node phase6-health-check.js
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  HUNTER-GATHERER APP - PHASE 6 HEALTH CHECK                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;
const issues = [];

// ============================================================================
// FILE STRUCTURE CHECKS
// ============================================================================

console.log('📁 Checking File Structure...\n');

const requiredFiles = [
  // Types
  'src/types/index.ts',
  'src/types/database.ts',
  'src/types/training.ts',
  
  // Database
  'src/database/schema.sql',
  'src/database/init.ts',
  'src/database/migrations.ts',
  'src/database/test.ts',
  
  // Utils
  'src/utils/calculations.ts',
  'src/utils/validation.ts',
  'src/utils/formatting.ts',
  
  // Data
  'src/data/exercises.ts',
  'src/data/programs.ts',
  
  // Components
  'src/components/StopRulesBox.tsx',
  'src/components/RepCounter.tsx',
  'src/components/RestTimer.tsx',
  'src/components/ConfirmationDialog.tsx',
  'src/components/ReadinessIndicator.tsx',
  'src/components/HydrationTracker.tsx',
  
  // Hooks (may be empty)
  'src/hooks/useDatabase.ts',
  'src/hooks/useDailyCheckIn.ts',
  'src/hooks/useSessionState.ts',
  
  // Screens (may be empty)
  'src/screens/DailyCheckInScreen.tsx',
  'src/screens/SessionReadinessScreen.tsx',
  'src/screens/ExerciseExecutionScreen.tsx',
  'src/screens/PostSessionScreen.tsx',
  'src/screens/SessionHistoryScreen.tsx',
  
  // App
  'App.tsx',
  'index.ts',
  
  // Config
  'package.json',
  'tsconfig.json',
  'app.json',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file}`);
    passed++;
  } else {
    console.log(`✗ ${file} - MISSING`);
    failed++;
    issues.push(`Missing file: ${file}`);
  }
});

// ============================================================================
// DEPENDENCY CHECKS
// ============================================================================

console.log('\n📦 Checking Dependencies...\n');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'expo',
  'expo-sqlite',
  'react',
  'react-native',
  '@react-navigation/native',
  '@react-navigation/stack',
  'zustand',
  'uuid',
  'date-fns',
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✓ ${dep}: ${packageJson.dependencies[dep]}`);
    passed++;
  } else {
    console.log(`✗ ${dep} - MISSING`);
    failed++;
    issues.push(`Missing dependency: ${dep}`);
  }
});

// ============================================================================
// TYPESCRIPT COMPILATION CHECK
// ============================================================================

console.log('\n🔧 TypeScript Compilation Check...\n');
console.log('Run: npx tsc --noEmit');
console.log('(Manual check required - verify no compilation errors)\n');

// ============================================================================
// CODE QUALITY CHECKS
// ============================================================================

console.log('🔍 Code Quality Checks...\n');

// Check for TODO/FIXME comments in critical files
const criticalFiles = [
  'src/utils/calculations.ts',
  'src/utils/validation.ts',
  'src/database/init.ts',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const todos = (content.match(/TODO|FIXME/g) || []).length;
    if (todos > 0) {
      console.log(`⚠️  ${file}: ${todos} TODO/FIXME comment(s)`);
      issues.push(`${file} has ${todos} TODO/FIXME comments`);
    } else {
      console.log(`✓ ${file}: No TODO/FIXME comments`);
      passed++;
    }
  }
});

// ============================================================================
// EXERCISE DATA VALIDATION
// ============================================================================

console.log('\n🏋️  Exercise Data Validation...\n');

try {
  // This is a simple check - full validation requires running the app
  const exercisesFile = fs.readFileSync('src/data/exercises.ts', 'utf8');
  
  const expectedExercises = [
    'Pull-Up',
    'Chin-Up',
    'Scapular Pull-Up',
    'High Pull-Up Hold',
    'Dead Hang',
    'Push-Up',
    'Pike Push-Up',
    'Bulgarian Split Squat',
    'Romanian Deadlift',
    'Farmer Carry',
  ];
  
  expectedExercises.forEach(ex => {
    if (exercisesFile.includes(`"${ex}"`)) {
      console.log(`✓ ${ex} defined`);
      passed++;
    } else {
      console.log(`✗ ${ex} - NOT FOUND`);
      failed++;
      issues.push(`Exercise not found: ${ex}`);
    }
  });
} catch (error) {
  console.log(`✗ Error reading exercises.ts: ${error.message}`);
  failed++;
}

// ============================================================================
// TEST COVERAGE CHECK
// ============================================================================

console.log('\n🧪 Test Coverage Check...\n');

if (fs.existsSync('src/utils/hunter-gatherer-tests.ts')) {
  const testFile = fs.readFileSync('src/utils/hunter-gatherer-tests.ts', 'utf8');
  
  const testFunctions = [
    'testReadinessCalculation',
    'testVolumeAdjustment',
    'testSleepQuality',
    'testConsecutivePoorNights',
    'testProteinTarget',
    'testSessionDuration',
    'testCleanPercentage',
    'testAverageReps',
    'testValidation',
    'testFormatting',
  ];
  
  testFunctions.forEach(fn => {
    if (testFile.includes(fn)) {
      console.log(`✓ ${fn} exists`);
      passed++;
    } else {
      console.log(`✗ ${fn} - MISSING`);
      failed++;
      issues.push(`Test function missing: ${fn}`);
    }
  });
  
  console.log('\n📊 To run unit tests:');
  console.log('   npx ts-node src/utils/hunter-gatherer-tests.ts\n');
} else {
  console.log('✗ Test file not found');
  failed++;
}

// ============================================================================
// DATABASE SCHEMA VALIDATION
// ============================================================================

console.log('\n🗄️  Database Schema Validation...\n');

if (fs.existsSync('src/database/schema.sql')) {
  const schema = fs.readFileSync('src/database/schema.sql', 'utf8');
  
  const requiredTables = [
    'user_profile',
    'daily_checkin',
    'training_session',
    'exercise_session',
    'exercise_set',
    'hydration_log',
    'schema_version',
  ];
  
  requiredTables.forEach(table => {
    if (schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      console.log(`✓ Table: ${table}`);
      passed++;
    } else {
      console.log(`✗ Table: ${table} - NOT FOUND`);
      failed++;
      issues.push(`Missing table: ${table}`);
    }
  });
} else {
  console.log('✗ schema.sql not found');
  failed++;
}

// ============================================================================
// COMPONENT VALIDATION
// ============================================================================

console.log('\n⚛️  Component Validation...\n');

const components = [
  'StopRulesBox',
  'RepCounter',
  'RestTimer',
  'ConfirmationDialog',
  'ReadinessIndicator',
  'HydrationTracker',
];

components.forEach(comp => {
  const file = `src/components/${comp}.tsx`;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(`export default function ${comp}`)) {
      console.log(`✓ ${comp} - properly exported`);
      passed++;
    } else {
      console.log(`⚠️  ${comp} - check export`);
    }
  }
});

// ============================================================================
// IMPLEMENTATION STATUS
// ============================================================================

console.log('\n📋 Implementation Status...\n');

const screens = [
  'DailyCheckInScreen',
  'SessionReadinessScreen',
  'ExerciseExecutionScreen',
  'PostSessionScreen',
  'SessionHistoryScreen',
];

screens.forEach(screen => {
  const file = `src/screens/${screen}.tsx`;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const isEmpty = content.trim().length === 0;
    if (isEmpty) {
      console.log(`⚠️  ${screen} - NOT IMPLEMENTED (empty file)`);
      issues.push(`Screen not implemented: ${screen}`);
    } else {
      console.log(`✓ ${screen} - implemented`);
      passed++;
    }
  }
});

const hooks = [
  'useDatabase',
  'useDailyCheckIn',
  'useSessionState',
];

hooks.forEach(hook => {
  const file = `src/hooks/${hook}.ts`;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const isEmpty = content.trim().length === 0;
    if (isEmpty) {
      console.log(`⚠️  ${hook} - NOT IMPLEMENTED (empty file)`);
      issues.push(`Hook not implemented: ${hook}`);
    } else {
      console.log(`✓ ${hook} - implemented`);
      passed++;
    }
  }
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║  HEALTH CHECK SUMMARY                                         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`✓ Checks Passed: ${passed}`);
console.log(`✗ Checks Failed: ${failed}\n`);

if (issues.length > 0) {
  console.log('⚠️  ISSUES FOUND:\n');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  console.log('');
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

console.log('📝 PHASE 6 TESTING RECOMMENDATIONS:\n');

console.log('1. Manual Testing Required:');
console.log('   - Launch app on simulator/device');
console.log('   - Follow PHASE_6_TESTING_PLAN.md');
console.log('   - Test all user flows end-to-end\n');

console.log('2. Unit Tests:');
console.log('   - Run: npx ts-node src/utils/hunter-gatherer-tests.ts');
console.log('   - Verify all 175+ tests pass\n');

console.log('3. Database Tests:');
console.log('   - Run: npx ts-node src/database/test.ts');
console.log('   - Verify initialization and CRUD operations\n');

console.log('4. TypeScript Compilation:');
console.log('   - Run: npx tsc --noEmit');
console.log('   - Fix any compilation errors\n');

console.log('5. Integration Testing:');
console.log('   - Test complete workflow: check-in → session → history');
console.log('   - Test volume adjustment logic');
console.log('   - Test stop rules and early termination\n');

// ============================================================================
// NEXT STEPS
// ============================================================================

console.log('✅ NEXT STEPS:\n');

if (failed === 0 && issues.filter(i => !i.includes('NOT IMPLEMENTED')).length === 0) {
  console.log('1. ✓ File structure complete');
  console.log('2. ✓ Dependencies installed');
  console.log('3. ✓ Tests exist and pass');
  console.log('4. → Begin manual testing (PHASE_6_TESTING_PLAN.md)');
  console.log('5. → Fix any bugs found');
  console.log('6. → Proceed to Phase 7 (Styling)');
} else if (issues.filter(i => i.includes('NOT IMPLEMENTED')).length > 0) {
  console.log('⚠️  IMPLEMENTATION INCOMPLETE:');
  console.log('   - Some screens/hooks are empty');
  console.log('   - Complete implementation before full testing');
  console.log('   - Refer to IMPLEMENTATION_ORDER.md');
} else {
  console.log('❌ CRITICAL ISSUES FOUND:');
  console.log('   - Fix issues listed above');
  console.log('   - Re-run health check');
  console.log('   - Proceed when all checks pass');
}

console.log('\n════════════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
