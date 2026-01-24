import { useReducer, useCallback, useMemo } from "react";

/**
 * Action types
 */
const ACTIONS = {
  SET_FIELD: "SET_FIELD",
  SET_FIELDS: "SET_FIELDS",
  SET_ERROR: "SET_ERROR",
  SET_ERRORS: "SET_ERRORS",
  CLEAR_ERROR: "CLEAR_ERROR",
  CLEAR_ERRORS: "CLEAR_ERRORS",
  SET_TOUCHED: "SET_TOUCHED",
  SET_SUBMITTING: "SET_SUBMITTING",
  RESET: "RESET",
  VALIDATE_FIELD: "VALIDATE_FIELD",
  VALIDATE_ALL: "VALIDATE_ALL",
};

/**
 * Form reducer
 */
function formReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FIELD:
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        touched: { ...state.touched, [action.field]: true },
      };
    case ACTIONS.SET_FIELDS:
      return {
        ...state,
        values: { ...state.values, ...action.values },
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors,
      };
    case ACTIONS.CLEAR_ERROR:
      const { [action.field]: _, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };
    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {},
      };
    case ACTIONS.SET_TOUCHED:
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.touched },
      };
    case ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    case ACTIONS.RESET:
      return {
        values: action.initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
      };
    default:
      return state;
  }
}

/**
 * Custom hook for advanced form management with validation
 * @param {Object} options - Form configuration
 * @returns {Object} - Form state and handlers
 */
export default function useForm({
  initialValues = {},
  validationSchema = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  // Validate a single field
  const validateField = useCallback(
    (field, value) => {
      const rules = validationSchema[field];
      if (!rules) return null;

      // Required validation
      if (
        rules.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        return rules.required === true
          ? "This field is required"
          : rules.required;
      }

      // Min length
      if (rules.minLength && value && value.length < rules.minLength.value) {
        return (
          rules.minLength.message ||
          `Minimum ${rules.minLength.value} characters required`
        );
      }

      // Max length
      if (rules.maxLength && value && value.length > rules.maxLength.value) {
        return (
          rules.maxLength.message ||
          `Maximum ${rules.maxLength.value} characters allowed`
        );
      }

      // Pattern/Regex
      if (rules.pattern && value && !rules.pattern.value.test(value)) {
        return rules.pattern.message || "Invalid format";
      }

      // Email validation
      if (rules.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return rules.email === true ? "Invalid email address" : rules.email;
        }
      }

      // Custom validation function
      if (rules.validate) {
        const error = rules.validate(value, state.values);
        if (error) return error;
      }

      return null;
    },
    [validationSchema, state.values],
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    const errors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const error = validateField(field, state.values[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    dispatch({ type: ACTIONS.SET_ERRORS, errors });
    return isValid;
  }, [validationSchema, state.values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      dispatch({ type: ACTIONS.SET_FIELD, field: name, value: fieldValue });

      if (validateOnChange) {
        const error = validateField(name, fieldValue);
        if (error) {
          dispatch({ type: ACTIONS.SET_ERROR, field: name, error });
        } else {
          dispatch({ type: ACTIONS.CLEAR_ERROR, field: name });
        }
      }
    },
    [validateOnChange, validateField],
  );

  // Handle blur
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      dispatch({ type: ACTIONS.SET_TOUCHED, field: name, touched: true });

      if (validateOnBlur) {
        const error = validateField(name, value);
        if (error) {
          dispatch({ type: ACTIONS.SET_ERROR, field: name, error });
        } else {
          dispatch({ type: ACTIONS.CLEAR_ERROR, field: name });
        }
      }
    },
    [validateOnBlur, validateField],
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field, value) => {
    dispatch({ type: ACTIONS.SET_FIELD, field, value });
  }, []);

  // Set multiple values
  const setValues = useCallback((values) => {
    dispatch({ type: ACTIONS.SET_FIELDS, values });
  }, []);

  // Set field error
  const setFieldError = useCallback((field, error) => {
    dispatch({ type: ACTIONS.SET_ERROR, field, error });
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      // Mark all fields as touched
      Object.keys(state.values).forEach((field) => {
        dispatch({ type: ACTIONS.SET_TOUCHED, field, touched: true });
      });

      // Validate all fields
      if (!validateAll()) {
        return;
      }

      dispatch({ type: ACTIONS.SET_SUBMITTING, isSubmitting: true });

      try {
        await onSubmit?.(state.values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        dispatch({ type: ACTIONS.SET_SUBMITTING, isSubmitting: false });
      }
    },
    [state.values, validateAll, onSubmit],
  );

  // Reset form
  const reset = useCallback(
    (values = initialValues) => {
      dispatch({ type: ACTIONS.RESET, initialValues: values });
    },
    [initialValues],
  );

  // Get field props helper
  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: state.values[name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [state.values, handleChange, handleBlur],
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(state.errors).length === 0;
  }, [state.errors]);

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(state.values) !== JSON.stringify(initialValues);
  }, [state.values, initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    setFieldError,
    reset,
    getFieldProps,
    validateField,
    validateAll,
  };
}
