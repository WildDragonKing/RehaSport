import { functions } from "./config";
import { httpsCallable } from "firebase/functions";
import { logEvent } from "firebase/analytics";
import { analytics } from "./config";

interface ErrorContext {
  type?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  [key: string]: unknown;
}

interface ErrorLogData {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
}

// Cloud Function zum Loggen von Fehlern
const logErrorToCloud = httpsCallable<ErrorLogData, { success: boolean }>(
  functions,
  "logClientError",
);

// Fehler an Google Cloud Logging senden
export async function logError(
  error: Error,
  context: ErrorContext = {},
): Promise<void> {
  const errorData: ErrorLogData = {
    message: error.message,
    stack: error.stack,
    context: {
      ...context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
    timestamp: new Date().toISOString(),
  };

  // Auch an Google Analytics senden
  try {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, "exception", {
        description: error.message,
        fatal: context.type === "uncaught",
      });
    }
  } catch {
    // Analytics nicht verfügbar, ignorieren
  }

  // An Cloud Function senden für Google Cloud Logging
  try {
    await logErrorToCloud(errorData);
  } catch (e) {
    // Fallback: Console logging wenn Cloud Function nicht erreichbar
    console.error("[Error Logging] Failed to send to cloud:", e);
    console.error("[Original Error]", error, context);
  }
}

// Für React Error Boundary
export function logComponentError(
  error: Error,
  errorInfo: { componentStack?: string },
): void {
  logError(error, {
    type: "react-error-boundary",
    componentStack: errorInfo.componentStack,
  });
}
