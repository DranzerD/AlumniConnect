/**
 * Error Handling Library
 * Centralized error handling for the AlumniConnect application
 */

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "APP_ERROR", details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, "VALIDATION_ERROR", { fields });
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Permission denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super("Too many requests", 429, "RATE_LIMIT", { retryAfter });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", originalError = null) {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message = "External service unavailable") {
    super(`${service}: ${message}`, 503, "EXTERNAL_SERVICE_ERROR");
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

// Error handler for API routes
export function handleApiError(error, request) {
  console.error("[API Error]", {
    message: error.message,
    code: error.code,
    stack: error.stack,
    url: request?.url,
    method: request?.method,
  });

  // Already an AppError
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
    };
  }

  // Database errors
  if (error.code === "23505") {
    // Unique violation
    return {
      status: 409,
      body: {
        error: {
          message: "Resource already exists",
          code: "DUPLICATE_ENTRY",
        },
      },
    };
  }

  if (error.code === "23503") {
    // Foreign key violation
    return {
      status: 400,
      body: {
        error: {
          message: "Invalid reference",
          code: "INVALID_REFERENCE",
        },
      },
    };
  }

  // Default internal error
  return {
    status: 500,
    body: {
      error: {
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        code: "INTERNAL_ERROR",
      },
    },
  };
}

// Async handler wrapper for API routes
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const { status, body } = handleApiError(error, request);

      // Log to error tracking service
      await logError(error, request);

      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

// Error logging
async function logError(error, request) {
  try {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          code: error.code,
          url: request?.url,
          method: request?.method,
          severity: error.statusCode >= 500 ? "critical" : "error",
        }),
      });
    }
  } catch (logError) {
    console.error("Failed to log error:", logError);
  }
}

// Result type for functional error handling
export class Result {
  constructor(value, error) {
    this._value = value;
    this._error = error;
    this.isOk = error === null;
    this.isErr = error !== null;
  }

  static ok(value) {
    return new Result(value, null);
  }

  static err(error) {
    return new Result(null, error);
  }

  unwrap() {
    if (this.isErr) {
      throw this._error;
    }
    return this._value;
  }

  unwrapOr(defaultValue) {
    return this.isOk ? this._value : defaultValue;
  }

  map(fn) {
    if (this.isErr) {
      return this;
    }
    return Result.ok(fn(this._value));
  }

  mapErr(fn) {
    if (this.isOk) {
      return this;
    }
    return Result.err(fn(this._error));
  }

  andThen(fn) {
    if (this.isErr) {
      return this;
    }
    return fn(this._value);
  }

  match({ ok, err }) {
    return this.isOk ? ok(this._value) : err(this._error);
  }
}

// Try-catch wrapper that returns Result
export async function tryCatch(asyncFn) {
  try {
    const result = await asyncFn();
    return Result.ok(result);
  } catch (error) {
    return Result.err(error);
  }
}

// Retry with exponential backoff
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  throw lastError;
}

// Circuit breaker pattern
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new ExternalServiceError("Service", "Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  handleApiError,
  withErrorHandler,
  Result,
  tryCatch,
  retryWithBackoff,
  CircuitBreaker,
};
