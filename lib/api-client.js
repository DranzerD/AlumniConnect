/**
 * API Client - Centralized API utility with type safety and error handling
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Custom API error class
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Request configuration
const defaultConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Include cookies for auth
};

/**
 * Make an API request with automatic error handling
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const config = {
    ...defaultConfig,
    ...options,
    headers: {
      ...defaultConfig.headers,
      ...options.headers,
    },
  };

  // Handle request body
  if (
    config.body &&
    typeof config.body === "object" &&
    !(config.body instanceof FormData)
  ) {
    config.body = JSON.stringify(config.body);
  }

  // Remove Content-Type for FormData (let browser set it with boundary)
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const response = await fetch(url, config);

    // Handle no content responses
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || `HTTP error ${response.status}`,
        response.status,
        data?.code || "UNKNOWN_ERROR",
        data?.details,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(error.message || "Network error", 0, "NETWORK_ERROR");
  }
}

/**
 * API client with typed methods
 */
const apiClient = {
  // Generic HTTP methods
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),

  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post("/api/auth/login", credentials),
    logout: () => apiClient.post("/api/auth/logout"),
    register: (data) => apiClient.post("/api/auth/register", data),
    resetPassword: (data) => apiClient.post("/api/auth/reset-password", data),
    verifyEmail: (token) => apiClient.post("/api/auth/verify-email", { token }),
  },

  // User/Profile endpoints
  profiles: {
    me: () => apiClient.get("/api/profiles/me"),
    update: (data) => apiClient.patch("/api/profiles/me", data),
    get: (id) => apiClient.get(`/api/profiles/${id}`),
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/profiles?${searchParams}`);
    },
    uploadAvatar: (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return apiClient.post("/api/profiles/me/avatar", formData);
    },
  },

  // Jobs endpoints
  jobs: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/jobs?${searchParams}`);
    },
    get: (id) => apiClient.get(`/api/jobs/${id}`),
    create: (data) => apiClient.post("/api/jobs", data),
    update: (id, data) => apiClient.put(`/api/jobs/${id}`, data),
    delete: (id) => apiClient.delete(`/api/jobs/${id}`),
    apply: (id) => apiClient.post(`/api/jobs/${id}/apply`),
  },

  // Connections endpoints
  connections: {
    list: () => apiClient.get("/api/connections"),
    pending: () => apiClient.get("/api/connections/pending"),
    send: (userId) => apiClient.post("/api/connections", { userId }),
    accept: (id) => apiClient.post(`/api/connections/${id}/accept`),
    reject: (id) => apiClient.post(`/api/connections/${id}/reject`),
    remove: (id) => apiClient.delete(`/api/connections/${id}`),
  },

  // Notifications endpoints
  notifications: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/notifications?${searchParams}`);
    },
    markRead: (id) => apiClient.patch(`/api/notifications/${id}/read`),
    markAllRead: () => apiClient.patch("/api/notifications/read-all"),
    delete: (id) => apiClient.delete(`/api/notifications/${id}`),
  },

  // Discussions/Forums endpoints
  discussions: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/discussions?${searchParams}`);
    },
    get: (id) => apiClient.get(`/api/discussions/${id}`),
    create: (data) => apiClient.post("/api/discussions", data),
    update: (id, data) => apiClient.put(`/api/discussions/${id}`, data),
    delete: (id) => apiClient.delete(`/api/discussions/${id}`),
    like: (id) => apiClient.post(`/api/discussions/${id}/like`),
    bookmark: (id) => apiClient.post(`/api/discussions/${id}/bookmark`),
    reply: (id, data) => apiClient.post(`/api/discussions/${id}/replies`, data),
  },

  // Mentorship endpoints
  mentorship: {
    mentors: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/mentorship?${searchParams}`);
    },
    get: (id) => apiClient.get(`/api/mentorship/${id}`),
    request: (mentorId, data) =>
      apiClient.post(`/api/mentorship/${mentorId}/request`, data),
    updateRequest: (id, status) =>
      apiClient.patch(`/api/mentorship/requests/${id}`, { status }),
    scheduleSession: (id, data) =>
      apiClient.post(`/api/mentorship/${id}/sessions`, data),
  },

  // Events endpoints
  events: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/events?${searchParams}`);
    },
    get: (id) => apiClient.get(`/api/events/${id}`),
    create: (data) => apiClient.post("/api/events", data),
    register: (id) => apiClient.post(`/api/events/${id}/register`),
    unregister: (id) => apiClient.delete(`/api/events/${id}/register`),
  },

  // Analytics endpoints
  analytics: {
    dashboard: () => apiClient.get("/api/analytics"),
    alumni: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiClient.get(`/api/analytics/alumni?${searchParams}`);
    },
    engagement: () => apiClient.get("/api/analytics/engagement"),
  },
};

/**
 * Query builder for complex filters
 */
export function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else {
        query.set(key, String(value));
      }
    }
  });

  return query.toString();
}

/**
 * Retry wrapper for failed requests
 */
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

export default apiClient;
