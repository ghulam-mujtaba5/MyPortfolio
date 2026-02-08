import React from "react";

/**
 * ErrorBoundary — Catches unhandled React rendering errors so the entire page
 * does not crash. Provides a user-friendly fallback UI with a retry button.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Oops</p>}>...</ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log to console in development; in production you could send to an
    // error-reporting service (e.g. Sentry, LogRocket).
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Allow a custom fallback via props
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({
              error: this.state.error,
              retry: this.handleRetry,
            })
          : this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            padding: "2rem",
            textAlign: "center",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              fontSize: 28,
            }}
            aria-hidden="true"
          >
            ⚠️
          </div>
          <h2
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              margin: "0 0 1.5rem",
              color: "#6b7280",
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred. You can try again or refresh the page.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: "0.6rem 1.4rem",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: "0.6rem 1.4rem",
                background: "transparent",
                color: "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <details
              style={{
                marginTop: 24,
                textAlign: "left",
                maxWidth: 600,
                width: "100%",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 500 }}>
                Error details (dev only)
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: "#f9fafb",
                  borderRadius: 6,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
