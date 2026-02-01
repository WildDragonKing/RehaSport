import React, { Component, ErrorInfo, ReactNode } from "react";
import { logComponentError } from "../firebase/errorLogging";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    // Log to Google Cloud Logging
    logComponentError(error, {
      componentStack: errorInfo.componentStack || undefined,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Etwas ist schiefgelaufen
            </h1>
            <div className="bg-red-100 rounded p-4 mb-4">
              <p className="text-red-800 font-mono text-sm whitespace-pre-wrap">
                {this.state.error?.message}
              </p>
            </div>
            {this.state.error?.stack && (
              <details className="mb-4">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Stack Trace
                </summary>
                <pre className="mt-2 bg-gray-100 rounded p-4 text-xs overflow-auto max-h-64">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            {this.state.errorInfo?.componentStack && (
              <details className="mb-4">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Component Stack
                </summary>
                <pre className="mt-2 bg-gray-100 rounded p-4 text-xs overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
