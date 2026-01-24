/**
 * Testing Utilities
 * Helper functions for testing components and API routes
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

export const mockPathname = jest.fn(() => "/");
export const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams(),
}));

// Mock fetch
export function mockFetch(responses = {}) {
  const defaultResponse = {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
  };

  global.fetch = jest.fn((url, options = {}) => {
    const method = options.method || "GET";
    const key = `${method} ${url}`;

    const response = responses[key] || responses[url] || defaultResponse;

    if (typeof response === "function") {
      return Promise.resolve(response(url, options));
    }

    return Promise.resolve({
      ok: response.status ? response.status < 400 : true,
      status: response.status || 200,
      json: async () => response.data || response,
      text: async () => JSON.stringify(response.data || response),
      headers: new Headers(response.headers || {}),
    });
  });

  return global.fetch;
}

// Reset all mocks
export function resetMocks() {
  jest.clearAllMocks();
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockPathname.mockReturnValue("/");
  mockSearchParams.mockReturnValue(new URLSearchParams());
}

// Create test wrapper with providers
export function createTestWrapper(options = {}) {
  const { initialState = {}, theme = "light", user = null } = options;

  return function TestWrapper({ children }) {
    return (
      <MockProviders initialState={initialState} theme={theme} user={user}>
        {children}
      </MockProviders>
    );
  };
}

// Mock providers component
function MockProviders({ children, initialState, theme, user }) {
  return (
    <div data-theme={theme} data-testid="test-wrapper">
      {children}
    </div>
  );
}

// Render with providers
export function renderWithProviders(ui, options = {}) {
  const Wrapper = createTestWrapper(options);
  return render(ui, { wrapper: Wrapper, ...options });
}

// Wait for element to appear
export async function waitForElement(testId, options = {}) {
  return waitFor(() => expect(screen.getByTestId(testId)).toBeInTheDocument(), {
    timeout: 5000,
    ...options,
  });
}

// Wait for element to disappear
export async function waitForElementToDisappear(testId, options = {}) {
  return waitFor(
    () => expect(screen.queryByTestId(testId)).not.toBeInTheDocument(),
    { timeout: 5000, ...options },
  );
}

// Fill form fields
export async function fillForm(fields, user = userEvent.setup()) {
  for (const [name, value] of Object.entries(fields)) {
    const input =
      screen.getByLabelText(name) || screen.getByPlaceholderText(name);
    await user.clear(input);
    await user.type(input, value);
  }
}

// Submit form
export async function submitForm(
  buttonText = "Submit",
  user = userEvent.setup(),
) {
  const button = screen.getByRole("button", { name: buttonText });
  await user.click(button);
}

// Create mock user
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "alumni",
    graduationYear: 2020,
    department: "Computer Science",
    profileComplete: true,
    avatar: null,
    ...overrides,
  };
}

// Create mock job
export function createMockJob(overrides = {}) {
  return {
    id: 1,
    title: "Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    type: "full-time",
    salary: "$120,000 - $150,000",
    description: "We are looking for a talented engineer...",
    requirements: ["React", "Node.js", "3+ years experience"],
    postedBy: createMockUser(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// Create mock event
export function createMockEvent(overrides = {}) {
  return {
    id: 1,
    title: "Alumni Networking Event",
    description: "Join us for an evening of networking...",
    type: "networking",
    location: "Main Hall",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    ).toISOString(),
    capacity: 100,
    registeredCount: 45,
    organizer: createMockUser(),
    ...overrides,
  };
}

// Create mock notification
export function createMockNotification(overrides = {}) {
  return {
    id: 1,
    type: "connection_request",
    title: "New Connection Request",
    message: "John Doe wants to connect with you",
    read: false,
    createdAt: new Date().toISOString(),
    data: {},
    ...overrides,
  };
}

// API test helpers
export function createMockRequest(options = {}) {
  const {
    method = "GET",
    url = "http://localhost:3000/api/test",
    body = null,
    headers = {},
  } = options;

  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
}

export function createMockResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// Database test helpers
export const mockDb = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

export function mockDbQuery(results) {
  mockDb.query.mockImplementation((query, params) => {
    if (typeof results === "function") {
      return Promise.resolve(results(query, params));
    }
    return Promise.resolve({ rows: results, rowCount: results.length });
  });
}

// Session mock
export const mockSession = {
  user: null,
  expires: null,
};

export function setMockSession(user) {
  mockSession.user = user;
  mockSession.expires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function clearMockSession() {
  mockSession.user = null;
  mockSession.expires = null;
}

// Snapshot testing helpers
export function expectMatchSnapshot(component) {
  const { container } = render(component);
  expect(container.firstChild).toMatchSnapshot();
}

// Performance testing
export function measureRenderTime(component, iterations = 10) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { unmount } = render(component);
    const end = performance.now();
    times.push(end - start);
    unmount();
  }

  return {
    min: Math.min(...times),
    max: Math.max(...times),
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    times,
  };
}

// Accessibility testing helper
export async function checkAccessibility(container) {
  const { axe, toHaveNoViolations } = await import("jest-axe");
  expect.extend(toHaveNoViolations);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

export default {
  mockRouter,
  mockPathname,
  mockSearchParams,
  mockFetch,
  resetMocks,
  createTestWrapper,
  renderWithProviders,
  waitForElement,
  waitForElementToDisappear,
  fillForm,
  submitForm,
  createMockUser,
  createMockJob,
  createMockEvent,
  createMockNotification,
  createMockRequest,
  createMockResponse,
  mockDb,
  mockDbQuery,
  mockSession,
  setMockSession,
  clearMockSession,
  expectMatchSnapshot,
  measureRenderTime,
  checkAccessibility,
};
