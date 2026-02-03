import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "reader-theme-mode";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(() =>
    mode === "system" ? getSystemPreference() : mode,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (mode === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
      setResolvedMode(getSystemPreference());
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, mode);
    setResolvedMode(mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateFromMediaQuery = () => {
      if (mode === "system") {
        setResolvedMode(mediaQuery.matches ? "dark" : "light");
      }
    };

    updateFromMediaQuery();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateFromMediaQuery);
      return () =>
        mediaQuery.removeEventListener("change", updateFromMediaQuery);
    }

    mediaQuery.addListener(updateFromMediaQuery);
    return () => mediaQuery.removeListener(updateFromMediaQuery);
  }, [mode]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.dataset.colorMode = mode;
    root.dataset.theme = resolvedMode;
    root.style.colorScheme = resolvedMode;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      const styles = window.getComputedStyle(root);
      const background = styles.getPropertyValue("--color-background").trim();
      themeColor.setAttribute(
        "content",
        background || (resolvedMode === "dark" ? "#0b1220" : "#f4f7fb"),
      );
    }
  }, [mode, resolvedMode]);

  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      setMode,
    }),
    [mode, resolvedMode, setMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme muss innerhalb von ThemeProvider verwendet werden",
    );
  }
  return context;
}

export { ThemeProvider, useTheme };
