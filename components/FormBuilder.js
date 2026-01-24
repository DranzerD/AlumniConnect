"use client";

import { useState, useCallback } from "react";
import styles from "./FormBuilder.module.css";

/**
 * FormBuilder - Dynamic form generation component
 * Supports various field types with validation
 */
export function FormBuilder({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  showCancel = true,
  loading = false,
  className = "",
}) {
  const [values, setValues] = useState(() => {
    const defaults = {};
    fields.forEach((field) => {
      defaults[field.name] =
        initialValues[field.name] ?? field.defaultValue ?? "";
    });
    return defaults;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate field on blur
      const field = fields.find((f) => f.name === name);
      if (field) {
        const error = validateField(field, values[name], values);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
      }
    },
    [fields, values],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, values[field.name], values);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, values]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = {};
      fields.forEach((f) => {
        allTouched[f.name] = true;
      });
      setTouched(allTouched);

      if (validateForm()) {
        await onSubmit(values);
      }
    },
    [fields, validateForm, onSubmit, values],
  );

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${className}`}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          error={touched[field.name] ? errors[field.name] : null}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          allValues={values}
        />
      ))}

      <div className={styles.actions}>
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Processing..." : submitText}
        </button>
      </div>
    </form>
  );
}

/**
 * Individual form field renderer
 */
function FormField({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
  allValues,
}) {
  const {
    name,
    label,
    type = "text",
    placeholder,
    options = [],
    required,
    helpText,
    rows = 4,
    min,
    max,
    step,
    accept,
    multiple,
    condition,
  } = field;

  // Check if field should be visible
  if (condition && !condition(allValues)) {
    return null;
  }

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Handle specific input types
    if (type === "checkbox") {
      newValue = e.target.checked;
    } else if (type === "file") {
      newValue = multiple ? Array.from(e.target.files) : e.target.files[0];
    } else if (type === "number") {
      newValue = e.target.value === "" ? "" : Number(e.target.value);
    } else if (type === "multiselect") {
      newValue = Array.from(e.target.selectedOptions, (option) => option.value);
    }

    onChange(name, newValue);
  };

  const commonProps = {
    id: name,
    name,
    disabled,
    placeholder,
    className: `${styles.input} ${error ? styles.inputError : ""}`,
    onBlur: () => onBlur(name),
    "aria-describedby": error
      ? `${name}-error`
      : helpText
        ? `${name}-help`
        : undefined,
    "aria-invalid": !!error,
  };

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={value || ""}
            onChange={handleChange}
            rows={rows}
          />
        );

      case "select":
        return (
          <select {...commonProps} value={value || ""} onChange={handleChange}>
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <select
            {...commonProps}
            value={value || []}
            onChange={handleChange}
            multiple
            size={Math.min(options.length, 5)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={!!value}
              onChange={handleChange}
              disabled={disabled}
              className={styles.checkbox}
            />
            <span>{label}</span>
          </label>
        );

      case "radio":
        return (
          <div className={styles.radioGroup}>
            {options.map((opt) => (
              <label key={opt.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={handleChange}
                  disabled={disabled}
                  className={styles.radio}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <div className={styles.fileInput}>
            <input
              type="file"
              {...commonProps}
              onChange={handleChange}
              accept={accept}
              multiple={multiple}
            />
            {value && (
              <span className={styles.fileName}>
                {multiple ? `${value.length} file(s) selected` : value.name}
              </span>
            )}
          </div>
        );

      case "date":
      case "datetime-local":
      case "time":
        return (
          <input
            type={type}
            {...commonProps}
            value={value || ""}
            onChange={handleChange}
            min={min}
            max={max}
          />
        );

      case "number":
      case "range":
        return (
          <input
            type={type}
            {...commonProps}
            value={value ?? ""}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
          />
        );

      case "color":
        return (
          <input
            type="color"
            {...commonProps}
            value={value || "#000000"}
            onChange={handleChange}
          />
        );

      default:
        return (
          <input
            type={type}
            {...commonProps}
            value={value || ""}
            onChange={handleChange}
          />
        );
    }
  };

  // For checkbox, the label is rendered inside
  if (type === "checkbox") {
    return (
      <div className={styles.field}>
        {renderInput()}
        {error && (
          <span id={`${name}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
        {helpText && !error && (
          <span id={`${name}-help`} className={styles.helpText}>
            {helpText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {renderInput()}
      {error && (
        <span id={`${name}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {helpText && !error && (
        <span id={`${name}-help`} className={styles.helpText}>
          {helpText}
        </span>
      )}
    </div>
  );
}

/**
 * Validate a single field
 */
function validateField(field, value, allValues) {
  const { required, validation, minLength, maxLength, min, max, pattern } =
    field;

  // Required validation
  if (required) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return `${field.label} is required`;
    }
  }

  // Skip other validations if empty and not required
  if (!value && !required) return null;

  // Min/Max length for strings
  if (typeof value === "string") {
    if (minLength && value.length < minLength) {
      return `${field.label} must be at least ${minLength} characters`;
    }
    if (maxLength && value.length > maxLength) {
      return `${field.label} must be no more than ${maxLength} characters`;
    }
  }

  // Min/Max for numbers
  if (typeof value === "number") {
    if (min !== undefined && value < min) {
      return `${field.label} must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${field.label} must be no more than ${max}`;
    }
  }

  // Pattern validation
  if (pattern && typeof value === "string") {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      return field.patternMessage || `${field.label} format is invalid`;
    }
  }

  // Email validation
  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
  }

  // URL validation
  if (field.type === "url" && value) {
    try {
      new URL(value);
    } catch {
      return "Please enter a valid URL";
    }
  }

  // Custom validation
  if (validation) {
    const customError = validation(value, allValues);
    if (customError) return customError;
  }

  return null;
}

/**
 * Pre-built field configurations
 */
export const fieldTemplates = {
  email: (name = "email", label = "Email") => ({
    name,
    label,
    type: "email",
    required: true,
    placeholder: "Enter your email",
  }),

  password: (name = "password", label = "Password") => ({
    name,
    label,
    type: "password",
    required: true,
    minLength: 8,
    placeholder: "Enter your password",
  }),

  name: (name = "name", label = "Full Name") => ({
    name,
    label,
    type: "text",
    required: true,
    placeholder: "Enter your full name",
  }),

  phone: (name = "phone", label = "Phone Number") => ({
    name,
    label,
    type: "tel",
    pattern: "^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$",
    patternMessage: "Please enter a valid phone number",
    placeholder: "+1 (555) 123-4567",
  }),

  url: (name = "url", label = "Website URL") => ({
    name,
    label,
    type: "url",
    placeholder: "https://example.com",
  }),

  date: (name = "date", label = "Date") => ({
    name,
    label,
    type: "date",
    required: true,
  }),

  textarea: (name = "content", label = "Content") => ({
    name,
    label,
    type: "textarea",
    rows: 4,
    placeholder: "Enter your text...",
  }),
};

export default FormBuilder;
