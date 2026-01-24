"use client";

import { createContext, useContext, useReducer, useCallback } from "react";

// Action types
const actions = {
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  MARK_NOTIFICATION_READ: "MARK_NOTIFICATION_READ",
  SET_THEME: "SET_THEME",
};

// Initial state
const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  notifications: [],
  theme: "light",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actions.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case actions.LOGOUT:
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
      };

    case actions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case actions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case actions.UPDATE_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };

    case actions.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Keep max 50
      };

    case actions.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload,
        ),
      };

    case actions.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n,
        ),
      };

    case actions.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setUser = useCallback((user) => {
    dispatch({ type: actions.SET_USER, payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: actions.LOGOUT });
  }, []);

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: actions.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: actions.SET_ERROR, payload: error });
  }, []);

  const updateProfile = useCallback((profileData) => {
    dispatch({ type: actions.UPDATE_PROFILE, payload: profileData });
  }, []);

  const addNotification = useCallback((notification) => {
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      },
    });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: actions.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const markNotificationRead = useCallback((id) => {
    dispatch({ type: actions.MARK_NOTIFICATION_READ, payload: id });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatch({ type: actions.SET_THEME, payload: theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  const value = {
    ...state,
    setUser,
    logout,
    setLoading,
    setError,
    updateProfile,
    addNotification,
    removeNotification,
    markNotificationRead,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Selector hooks for performance optimization
export function useUser() {
  const { user, isAuthenticated, isLoading } = useApp();
  return { user, isAuthenticated, isLoading };
}

export function useNotifications() {
  const {
    notifications,
    addNotification,
    removeNotification,
    markNotificationRead,
  } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;
  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markNotificationRead,
  };
}

export function useTheme() {
  const { theme, setTheme } = useApp();
  return { theme, setTheme };
}
