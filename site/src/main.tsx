import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import "./index.css";
import { logError } from "./firebase/errorLogging";

// Service Worker registrieren
if ("serviceWorker" in navigator) {
  registerSW({
    onNeedRefresh() {
      // Optional: Benutzer informieren über Update
      console.log("Neue Version verfügbar. Seite neu laden für Update.");
    },
    onOfflineReady() {
      console.log("App bereit für Offline-Nutzung.");
    },
  });
}

// Globale Error Handler für unbehandelte Fehler
window.onerror = (message, source, lineno, colno, error) => {
  logError(error || new Error(String(message)), {
    type: "uncaught",
    source,
    lineno,
    colno,
  });
};

window.onunhandledrejection = (event) => {
  logError(
    event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason)),
    {
      type: "unhandledrejection",
    },
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
