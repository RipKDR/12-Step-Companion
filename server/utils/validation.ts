/**
 * Shared validation utilities
 * Reusable validation functions for common patterns
 */

/**
 * Validate date string and check if it's in the past
 * @param dateString - Date string to validate
 * @returns Object with valid flag and optional error message
 */
export function validatePastDate(dateString: string): {
  valid: boolean;
  error?: string;
} {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }
  if (date > new Date()) {
    return { valid: false, error: "Date cannot be in the future" };
  }
  return { valid: true };
}

/**
 * Validate array length is within bounds
 * @param array - Array to validate
 * @param maxLength - Maximum allowed length
 * @param itemName - Name of the items for error message
 * @returns Object with valid flag and optional error message
 */
export function validateArrayLength<T>(
  array: T[],
  maxLength: number,
  itemName: string = "items"
): { valid: boolean; error?: string } {
  if (!Array.isArray(array)) {
    return { valid: false, error: `${itemName} must be an array` };
  }
  if (array.length > maxLength) {
    return {
      valid: false,
      error: `Maximum ${maxLength} ${itemName} allowed`,
    };
  }
  return { valid: true };
}

/**
 * Validate string length is within bounds
 * @param text - String to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @returns Object with valid flag and optional error message
 */
export function validateStringLength(
  text: string,
  maxLength: number,
  fieldName: string = "field"
): { valid: boolean; error?: string } {
  if (typeof text !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (text.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    };
  }
  return { valid: true };
}

