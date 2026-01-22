"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSleepHours = validateSleepHours;
exports.validateBodyweight = validateBodyweight;
exports.validateExerciseName = validateExerciseName;
exports.validateDate = validateDate;
exports.validateWaterIntake = validateWaterIntake;
exports.validateSodiumIntake = validateSodiumIntake;
exports.sanitizeString = sanitizeString;
exports.sanitizeNotes = sanitizeNotes;
exports.validateEmail = validateEmail;
exports.validateForm = validateForm;
exports.isValidUUID = isValidUUID;
exports.validateNumberRange = validateNumberRange;
exports.validateRequired = validateRequired;
// ============================================================================
// SLEEP HOURS VALIDATION
// ============================================================================
function validateSleepHours(hours) {
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
function validateBodyweight(kg) {
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
function validateExerciseName(name, validExercises) {
    if (!name || name.trim().length === 0) {
        return {
            field: "exerciseName",
            message: "Exercise name is required",
        };
    }
    if (!validExercises.includes(name)) {
        return {
            field: "exerciseName",
            message: "Exercise \"".concat(name, "\" not found in program"),
        };
    }
    return null;
}
// ============================================================================
// DATE VALIDATION
// ============================================================================
function validateDate(dateString) {
    if (!dateString || dateString.trim().length === 0) {
        return {
            field: "date",
            message: "Date is required",
        };
    }
    // Check YYYY-MM-DD format
    var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return {
            field: "date",
            message: "Date must be in YYYY-MM-DD format",
        };
    }
    // Check if valid date
    var date = new Date(dateString);
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
function validateWaterIntake(litres) {
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
function validateSodiumIntake(grams) {
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
function sanitizeString(input) {
    if (!input)
        return "";
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
function sanitizeNotes(notes) {
    if (!notes)
        return "";
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
function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return {
            field: "email",
            message: "Email is required",
        };
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
function validateForm(fields) {
    var errors = [];
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var field = fields_1[_i];
        var error = field.validator(field.value);
        if (error) {
            errors.push(error);
        }
    }
    return errors;
}
// ============================================================================
// CHECK IF VALID UUID
// ============================================================================
function isValidUUID(id) {
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
// ============================================================================
// NUMBER RANGE VALIDATION
// ============================================================================
function validateNumberRange(value, min, max, fieldName) {
    if (isNaN(value)) {
        return {
            field: fieldName,
            message: "".concat(fieldName, " must be a number"),
        };
    }
    if (value < min || value > max) {
        return {
            field: fieldName,
            message: "".concat(fieldName, " must be between ").concat(min, " and ").concat(max),
        };
    }
    return null;
}
// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================
function validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === "") {
        return {
            field: fieldName,
            message: "".concat(fieldName, " is required"),
        };
    }
    return null;
}
