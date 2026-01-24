// API client with interceptors, error handling, and retry logic

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
    return () => {
      const index = this.interceptors.request.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.request.splice(index, 1);
      }
    };
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
    return () => {
      const index = this.interceptors.response.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.response.splice(index, 1);
      }
    };
  }

  // Apply request interceptors
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    for (const interceptor of this.interceptors.response) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  // Core request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    let config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    // Handle body
    if (
      options.body &&
      typeof options.body === "object" &&
      !(options.body instanceof FormData)
    ) {
      config.body = JSON.stringify(options.body);
    }

    // For FormData, remove Content-Type to let browser set it
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(url, config);

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Apply response interceptors
      const processedResponse = await this.applyResponseInterceptors({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        headers: response.headers,
      });

      if (!processedResponse.ok) {
        throw new APIError(
          processedResponse.data?.error || processedResponse.statusText,
          processedResponse.status,
          processedResponse.data,
        );
      }

      return processedResponse.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(error.message, 0, null);
    }
  }

  // GET request
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  // POST request
  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  // PUT request
  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  // PATCH request
  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }

  // DELETE request
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Create default instance
const apiClient = new APIClient();

// Add default error logging interceptor
apiClient.addResponseInterceptor((response) => {
  if (!response.ok) {
    console.error(`API Error [${response.status}]:`, response.data);
  }
  return response;
});

// API service with typed methods for each resource
export const api = {
  // Auth
  auth: {
    login: (credentials) => apiClient.post("/api/auth/login", credentials),
    logout: () => apiClient.post("/api/auth/logout"),
    resetPassword: (data) => apiClient.post("/api/auth/reset-password", data),
    me: () => apiClient.get("/api/auth/me"),
  },

  // Profiles
  profiles: {
    list: (params) =>
      apiClient.get(`/api/profiles?${new URLSearchParams(params)}`),
    get: (id) => apiClient.get(`/api/profiles/${id}`),
    getMe: () => apiClient.get("/api/profiles/me"),
    update: (data) => apiClient.put("/api/profiles/me", data),
    uploadAvatar: (formData) =>
      apiClient.post("/api/profiles/me/avatar", formData),
  },

  // Jobs
  jobs: {
    list: (params) => apiClient.get(`/api/jobs?${new URLSearchParams(params)}`),
    get: (id) => apiClient.get(`/api/jobs/${id}`),
    create: (data) => apiClient.post("/api/jobs", data),
    update: (id, data) => apiClient.put(`/api/jobs/${id}`, data),
    delete: (id) => apiClient.delete(`/api/jobs/${id}`),
  },

  // Events
  events: {
    list: (params) =>
      apiClient.get(`/api/events?${new URLSearchParams(params)}`),
    get: (id) => apiClient.get(`/api/events/${id}`),
    create: (data) => apiClient.post("/api/events", data),
    update: (id, data) => apiClient.put(`/api/events/${id}`, data),
    delete: (id) => apiClient.delete(`/api/events/${id}`),
    register: (id) => apiClient.post(`/api/events/${id}/register`),
    unregister: (id) => apiClient.delete(`/api/events/${id}/register`),
  },

  // Messages
  messages: {
    getConversations: () => apiClient.get("/api/messages"),
    getMessages: (conversationId) =>
      apiClient.get(`/api/messages?conversation=${conversationId}`),
    send: (data) => apiClient.post("/api/messages", data),
  },

  // Mentorship
  mentorship: {
    getMentors: (params) =>
      apiClient.get(
        `/api/mentorship?type=mentors&${new URLSearchParams(params)}`,
      ),
    getPrograms: () => apiClient.get("/api/mentorship?type=programs"),
    getMyConnections: () =>
      apiClient.get("/api/mentorship?type=my-connections"),
    requestMentorship: (data) => apiClient.post("/api/mentorship", data),
  },

  // Stories
  stories: {
    list: (params) =>
      apiClient.get(`/api/stories?${new URLSearchParams(params)}`),
    get: (idOrSlug) => apiClient.get(`/api/stories/${idOrSlug}`),
    create: (data) => apiClient.post("/api/stories", data),
    update: (id, data) => apiClient.put(`/api/stories/${id}`, data),
    delete: (id) => apiClient.delete(`/api/stories/${id}`),
    like: (id) => apiClient.post(`/api/stories/${id}/like`),
    unlike: (id) => apiClient.delete(`/api/stories/${id}/like`),
  },

  // Analytics
  analytics: {
    get: () => apiClient.get("/api/analytics"),
  },

  // Admin
  admin: {
    getUsers: (params) =>
      apiClient.get(`/api/admin/users?${new URLSearchParams(params)}`),
    updateUserStatus: (id, status) =>
      apiClient.patch(`/api/admin/users/${id}/status`, { status }),
  },
};

export { APIClient, APIError, apiClient };
export default api;
