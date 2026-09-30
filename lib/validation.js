import { HttpError } from "./http";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal declarative validator for request bodies.
//
//   const data = validate(body, {
//     title: { type: "string", required: true, max: 120 },
//     capacity: { type: "int", min: 1 },
//   });
//
// Returns a new object containing only the declared fields (trimmed/coerced),
// or throws HttpError(422) with per-field messages. Omitted optional fields are
// left out, empty optional strings become null. With { partial: true } required
// checks are skipped (for PATCH-style updates).
export function validate(input, rules, { partial = false } = {}) {
  const out = {};
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const label = rule.label ?? field.replace(/_/g, " ");
    let value = input?.[field];

    if (typeof value === "string" && rule.type !== "password") value = value.trim();
    const empty = value === undefined || value === null || value === "";

    if (empty) {
      if (rule.required && !partial) errors[field] = `${capitalize(label)} is required`;
      else if (value !== undefined) out[field] = rule.type === "bool" ? false : null;
      continue;
    }

    const error = check(value, rule, label);
    if (typeof error === "string") errors[field] = error;
    else out[field] = error.value;
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(422, Object.values(errors)[0], errors);
  }
  return out;
}

function check(value, rule, label) {
  switch (rule.type) {
    case "string":
    case "password": {
      if (typeof value !== "string") return `${capitalize(label)} must be text`;
      if (rule.min && value.length < rule.min) return `${capitalize(label)} must be at least ${rule.min} characters`;
      if (rule.max && value.length > rule.max) return `${capitalize(label)} must be at most ${rule.max} characters`;
      return { value };
    }
    case "email": {
      if (typeof value !== "string" || !EMAIL_RE.test(value) || value.length > 254) return "Enter a valid email address";
      return { value: value.toLowerCase() };
    }
    case "url": {
      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        return { value: url.toString() };
      } catch {
        return `${capitalize(label)} must be a valid http(s) URL`;
      }
    }
    case "int": {
      const n = Number(value);
      if (!Number.isInteger(n)) return `${capitalize(label)} must be a whole number`;
      if (rule.min !== undefined && n < rule.min) return `${capitalize(label)} must be at least ${rule.min}`;
      if (rule.max !== undefined && n > rule.max) return `${capitalize(label)} must be at most ${rule.max}`;
      return { value: n };
    }
    case "bool":
      return { value: value === true || value === "true" || value === 1 || value === "1" };
    case "enum":
      if (!rule.values.includes(value)) return `${capitalize(label)} must be one of: ${rule.values.join(", ")}`;
      return { value };
    case "datetime": {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return `${capitalize(label)} must be a valid date and time`;
      return { value: d.toISOString() };
    }
    default:
      throw new Error(`Unknown validation type: ${rule.type}`);
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const PASSWORD_RULE = { type: "password", required: true, min: 8, max: 72 };

export function assertStrongPassword(password) {
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(422, "Password must contain at least one letter and one number", {
      password: "Password must contain at least one letter and one number",
    });
  }
}
