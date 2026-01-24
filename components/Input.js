"use client";

import { forwardRef, useState } from "react";
import styles from "./Input.module.css";

const Input = forwardRef(function Input(
  {
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    helperText,
    icon,
    iconPosition = "left",
    disabled = false,
    required = false,
    fullWidth = false,
    size = "medium",
    variant = "outlined",
    className = "",
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${styles[variant]} ${styles[size]} ${
          isFocused ? styles.focused : ""
        } ${error ? styles.error : ""} ${disabled ? styles.disabled : ""}`}
      >
        {icon && iconPosition === "left" && (
          <span className={styles.icon}>{icon}</span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        )}

        {icon && iconPosition === "right" && !isPassword && (
          <span className={styles.icon}>{icon}</span>
        )}
      </div>

      {(error || helperText) && (
        <span
          className={`${styles.helperText} ${error ? styles.errorText : ""}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
});

export default Input;

// Textarea Component
export const Textarea = forwardRef(function Textarea(
  {
    label,
    placeholder,
    value,
    onChange,
    error,
    helperText,
    disabled = false,
    required = false,
    fullWidth = false,
    rows = 4,
    maxLength,
    showCount = false,
    className = "",
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value?.length || 0;

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${styles.outlined} ${
          isFocused ? styles.focused : ""
        } ${error ? styles.error : ""} ${disabled ? styles.disabled : ""}`}
      >
        <textarea
          ref={ref}
          className={`${styles.input} ${styles.textarea}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>

      <div className={styles.bottomRow}>
        {(error || helperText) && (
          <span
            className={`${styles.helperText} ${error ? styles.errorText : ""}`}
          >
            {error || helperText}
          </span>
        )}
        {showCount && maxLength && (
          <span className={styles.charCount}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

// Select Component
export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    error,
    helperText,
    disabled = false,
    required = false,
    fullWidth = false,
    size = "medium",
    className = "",
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${styles.outlined} ${styles[size]} ${
          isFocused ? styles.focused : ""
        } ${error ? styles.error : ""} ${disabled ? styles.disabled : ""}`}
      >
        <select
          ref={ref}
          className={`${styles.input} ${styles.select}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.selectIcon}>▼</span>
      </div>

      {(error || helperText) && (
        <span
          className={`${styles.helperText} ${error ? styles.errorText : ""}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
});

// Checkbox Component
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = "",
}) {
  return (
    <label
      className={`${styles.checkboxContainer} ${
        disabled ? styles.disabled : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={`${styles.checkmark} ${error ? styles.error : ""}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {label && <span className={styles.checkboxLabel}>{label}</span>}
    </label>
  );
}

// Radio Component
export function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={`${styles.radioContainer} ${
        disabled ? styles.disabled : ""
      } ${className}`}
    >
      <input
        type="radio"
        className={styles.radioInput}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.radioDot} />
      {label && <span className={styles.radioLabel}>{label}</span>}
    </label>
  );
}

// Toggle/Switch Component
export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  size = "medium",
  className = "",
}) {
  return (
    <label
      className={`${styles.toggleContainer} ${styles[`toggle-${size}`]} ${
        disabled ? styles.disabled : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.toggleTrack}>
        <span className={styles.toggleThumb} />
      </span>
      {label && <span className={styles.toggleLabel}>{label}</span>}
    </label>
  );
}
