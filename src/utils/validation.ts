import { ValidationError } from "../types";

// ============================================================================
// SLEEP HOURS VALIDATION
// ============================================================================

export function validateSleepHours(hours: number): ValidationError | null {
  if (isNaN(hours)) {
    return {
      field: "sleepHours",
      message: "Sleep hours must be a number",
    };
  }

  if (hours < 0 || hours > 24) {
    return {
      field: "sleepHours",
      message: "Sleep hours must be between 0 and 24",
    };
  }

  return null;
}

// ============================================================================
// BODYWEIGHT VALIDATION
// ============================================================================

export function validateBodyweight(kg: number): ValidationError | null {
  if (isNaN(kg)) {
    return {
      field: "bodyweight",
      message: "Bodyweight must be a number",
    };
  }

  if (kg < 30 || kg > 300) {
    return {
      field: "bodyweight",
      message: "Bodyweight must be between 30 and 300 kg",
    };
  }

  return null;
}

// ============================================================================
// EXERCISE NAME VALIDATION
// ============================================================================

export function validateExerciseName(
  name: string,
  validExercises: string[],
): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: "exerciseName",
      message: "Exercise name is required",
    };
  }

  if (!validExercises.includes(name)) {
    return {
      field: "exerciseName",
      message: `Exercise "${name}" not found in program`,
    };
  }

  return null;
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

export function validateDate(dateString: string): ValidationError | null {
  if (!dateString || dateString.trim().length === 0) {
    return {
      field: "date",
      message: "Date is required",
    };
  }

  // Check YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return {
      field: "date",
      message: "Date must be in YYYY-MM-DD format",
    };
  }

  // Check if valid date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      field: "date",
      message: "Invalid date",
    };
  }

  return null;
}

// ============================================================================
// WATER INTAKE VALIDATION
// ============================================================================

export function validateWaterIntake(litres: number): ValidationError | null {
  if (isNaN(litres)) {
    return {
      field: "waterIntake",
      message: "Water intake must be a number",
    };
  }

  if (litres < 0 || litres > 15) {
    return {
      field: "waterIntake",
      message: "Water intake must be between 0 and 15 litres",
    };
  }

  return null;
}

// ============================================================================
// SODIUM INTAKE VALIDATION
// ============================================================================

export function validateSodiumIntake(grams: number): ValidationError | null {
  if (isNaN(grams)) {
    return {
      field: "sodiumIntake",
      message: "Sodium intake must be a number",
    };
  }

  if (grams < 0 || grams > 20) {
    return {
      field: "sodiumIntake",
      message: "Sodium intake must be between 0 and 20 grams",
    };
  }

  return null;
}

// ============================================================================
// STRING SANITIZATION
// ============================================================================

/**
 * Sanitizes user input strings to prevent injection attacks.
 * Removes dangerous characters while preserving normal punctuation.
 */
export function sanitizeString(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .slice(0, 1000); // Max 1000 characters
}

// ============================================================================
// NOTES SANITIZATION
// ============================================================================

/**
 * Sanitizes notes/text fields while preserving line breaks.
 */
export function sanitizeNotes(notes: string): string {
  if (!notes) return "";

  return notes
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .slice(0, 2000); // Max 2000 characters for notes
}

// ============================================================================
// EMAIL VALIDATION (FOR FUTURE USE)
// ============================================================================

export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return {
      field: "email",
      message: "Email is required",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: "email",
      message: "Invalid email format",
    };
  }

  return null;
}

// ============================================================================
// FORM VALIDATION HELPER
// ============================================================================

/**
 * Validates multiple fields and returns all errors.
 */
export function validateForm(
  fields: Array<{
    value: any;
    validator: (value: any) => ValidationError | null;
  }>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const error = field.validator(field.value);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

// ============================================================================
// CHECK IF VALID UUID
// ============================================================================

export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ============================================================================
// NUMBER RANGE VALIDATION
// ============================================================================

export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
): ValidationError | null {
  if (isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a number`,
    };
  }

  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return null;
}

// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================

export function validateRequired(
  value: any,
  fieldName: string,
): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }

  return null;
}
