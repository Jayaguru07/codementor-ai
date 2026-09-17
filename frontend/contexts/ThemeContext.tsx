"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  monacoTheme: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  monacoTheme: "vs-dark",
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "codementor-theme";

function getMonacoTheme(theme: Theme): string {
  return theme === "dark" ? "vs-dark" : "vs-light";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount, read from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(preferred);
    setMounted(true);
  }, []);

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  // Prevent flash: render nothing until mounted so the theme is applied
  // (avoids dark→light flicker on light-theme users)
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden", minHeight: "100vh" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, monacoTheme: getMonacoTheme(theme) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
