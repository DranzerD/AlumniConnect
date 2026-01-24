"use client";

import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
      eventId: Date.now().toString(36),
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      await fetch("/api/errors/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to log error:", e);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReport = () => {
    const { error, eventId } = this.state;
    const subject = encodeURIComponent(`Error Report - ${eventId}`);
    const body = encodeURIComponent(`
Error ID: ${eventId}
URL: ${window.location.href}
Error: ${error?.message}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:


    `);
    window.location.href = `mailto:support@alumniconnect.com?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, eventId } = this.state;
      const isDev = process.env.NODE_ENV === "development";

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>⚠️</span>
            </div>

            <h1 className={styles.title}>Something went wrong</h1>

            <p className={styles.message}>
              We're sorry, but something unexpected happened. Our team has been
              notified and is working to fix the issue.
            </p>

            {eventId && (
              <p className={styles.eventId}>
                Error ID: <code>{eventId}</code>
              </p>
            )}

            <div className={styles.actions}>
              <button
                onClick={this.handleReload}
                className={styles.primaryButton}
              >
                🔄 Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className={styles.secondaryButton}
              >
                🏠 Go Home
              </button>

              <button
                onClick={this.handleReport}
                className={styles.tertiaryButton}
              >
                📧 Report Issue
              </button>
            </div>

            {isDev && error && (
              <details className={styles.devInfo}>
                <summary>Developer Info</summary>
                <div className={styles.errorDetails}>
                  <h4>Error Message:</h4>
                  <pre>{error.message}</pre>

                  <h4>Stack Trace:</h4>
                  <pre>{error.stack}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <p className={styles.helpText}>
              If this problem persists, please contact{" "}
              <a href="mailto:support@alumniconnect.com">
                support@alumniconnect.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for Server Components
 */
export function AsyncErrorBoundary({ children, fallback }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary(Component, fallback = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
