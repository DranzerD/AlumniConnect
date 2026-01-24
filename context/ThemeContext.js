"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

// Theme Context
const ThemeContext = createContext(null);

/**
 * ThemeProvider - Provides theme management across the application
 * Supports light, dark, and system themes with localStorage persistence
 */
export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Resolve the actual theme based on setting
  const resolveTheme = useCallback(
    (themeSetting) => {
      if (themeSetting === "system") {
        return getSystemTheme();
      }
      return themeSetting;
    },
    [getSystemTheme],
  );

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") || defaultTheme;
    setTheme(stored);
    setResolvedTheme(resolveTheme(stored));
    setMounted(true);
  }, [defaultTheme, resolveTheme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const resolved = resolveTheme(theme);

    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.setAttribute("data-theme", resolved);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolved === "dark" ? "#0f172a" : "#ffffff",
      );
    }

    setResolvedTheme(resolved);
  }, [theme, mounted, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, getSystemTheme]);

  // Change theme
  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  }, [resolvedTheme, changeTheme]);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    changeTheme(nextTheme);
  }, [theme, changeTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    toggleTheme,
    cycleTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system",
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme - Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

/**
 * ThemeScript - Inline script to prevent flash of unstyled content
 * Add this to the <head> of your document
 */
export function ThemeScript({ defaultTheme = "system" }) {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('theme') || '${defaultTheme}';
        var resolved = theme;
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

export default ThemeProvider;
