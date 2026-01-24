/**
 * Validation Library - Form validation utilities
 * Resume-worthy validation patterns with custom rules and error messages
 */

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Password strength regex patterns
const PASSWORD_PATTERNS = {
  minLength: /.{8,}/,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

// Phone number regex (international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validation rules factory
 */
export const rules = {
  required: (message = "This field is required") => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  email: (message = "Please enter a valid email address") => ({
    validate: (value) => !value || EMAIL_REGEX.test(value),
    message,
  }),

  minLength: (min, message) => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max, message) => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  min: (min, message) => ({
    validate: (value) => value === "" || value === null || Number(value) >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max, message) => ({
    validate: (value) => value === "" || value === null || Number(value) <= max,
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (regex, message = "Invalid format") => ({
    validate: (value) => !value || regex.test(value),
    message,
  }),

  password: (message = "Password does not meet requirements") => ({
    validate: (value) => {
      if (!value) return true;
      return (
        PASSWORD_PATTERNS.minLength.test(value) &&
        PASSWORD_PATTERNS.hasUppercase.test(value) &&
        PASSWORD_PATTERNS.hasLowercase.test(value) &&
        PASSWORD_PATTERNS.hasNumber.test(value)
      );
    },
    message,
  }),

  passwordStrong: (
    message = "Password must include uppercase, lowercase, number, and special character",
  ) => ({
    validate: (value) => {
      if (!value) return true;
      return Object.values(PASSWORD_PATTERNS).every((pattern) =>
        pattern.test(value),
      );
    },
    message,
  }),

  match: (fieldName, getMessage = (name) => `Must match ${name}`) => ({
    validate: (value, allValues) => !value || value === allValues[fieldName],
    message: getMessage(fieldName),
    fieldName,
  }),

  phone: (message = "Please enter a valid phone number") => ({
    validate: (value) =>
      !value || PHONE_REGEX.test(value.replace(/[\s()-]/g, "")),
    message,
  }),

  url: (message = "Please enter a valid URL") => ({
    validate: (value) => !value || URL_REGEX.test(value),
    message,
  }),

  date: (message = "Please enter a valid date") => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),

  dateBefore: (beforeDate, message) => ({
    validate: (value) => {
      if (!value) return true;
      return new Date(value) < new Date(beforeDate);
    },
    message:
      message || `Must be before ${new Date(beforeDate).toLocaleDateString()}`,
  }),

  dateAfter: (afterDate, message) => ({
    validate: (value) => {
      if (!value) return true;
      return new Date(value) > new Date(afterDate);
    },
    message:
      message || `Must be after ${new Date(afterDate).toLocaleDateString()}`,
  }),

  custom: (validateFn, message = "Invalid value") => ({
    validate: validateFn,
    message,
  }),

  oneOf: (options, message) => ({
    validate: (value) => !value || options.includes(value),
    message: message || `Must be one of: ${options.join(", ")}`,
  }),

  numeric: (message = "Must be a number") => ({
    validate: (value) =>
      value === "" || value === null || !isNaN(Number(value)),
    message,
  }),

  integer: (message = "Must be a whole number") => ({
    validate: (value) =>
      value === "" || value === null || Number.isInteger(Number(value)),
    message,
  }),

  alphanumeric: (message = "Only letters and numbers allowed") => ({
    validate: (value) => !value || /^[a-zA-Z0-9]+$/.test(value),
    message,
  }),

  noWhitespace: (message = "No spaces allowed") => ({
    validate: (value) => !value || !/\s/.test(value),
    message,
  }),
};

/**
 * Validate a single value against rules
 */
export function validateField(value, fieldRules, allValues = {}) {
  for (const rule of fieldRules) {
    if (!rule.validate(value, allValues)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate an entire form object
 */
export function validateForm(values, schema) {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(schema)) {
    const error = validateField(values[field], fieldRules, values);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Create a form validator with schema
 */
export function createValidator(schema) {
  return {
    validateField: (field, value, allValues = {}) => {
      const fieldRules = schema[field];
      if (!fieldRules) return null;
      return validateField(value, fieldRules, allValues);
    },

    validateForm: (values) => validateForm(values, schema),

    getFieldRules: (field) => schema[field] || [],
  };
}

/**
 * Password strength calculator
 */
export function calculatePasswordStrength(password) {
  if (!password) return { score: 0, level: "none", checks: {} };

  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    uppercase: PASSWORD_PATTERNS.hasUppercase.test(password),
    lowercase: PASSWORD_PATTERNS.hasLowercase.test(password),
    number: PASSWORD_PATTERNS.hasNumber.test(password),
    special: PASSWORD_PATTERNS.hasSpecial.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let level = "weak";
  if (score >= 5) level = "strong";
  else if (score >= 4) level = "good";
  else if (score >= 3) level = "fair";

  return { score, level, checks };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitize(value) {
  if (typeof value !== "string") return value;

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors) {
  return Object.entries(errors).map(([field, error]) => ({
    field,
    message: error,
    label:
      field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
  }));
}

export default { rules, validateField, validateForm, createValidator };
