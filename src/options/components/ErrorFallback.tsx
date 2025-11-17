/**
 * Error Fallback Component for Options Page
 *
 * Displayed when an error is caught by Sentry's ErrorBoundary
 * Provides user-friendly error message and recovery options
 */

import { getEnvironment } from "../../lib/sentry-config";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = getEnvironment() === "development";

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              margin: "0 0 16px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: "#dc2626",
            }}
          >
            Ops! Algo deu errado
          </h1>

          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: "16px",
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            Detectamos uma falha inesperada. Nossa equipe já foi notificada automaticamente e está trabalhando em uma
            correção.
          </p>

          {error && (
            <details
              style={{
                marginBottom: "20px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  marginBottom: "12px",
                  color: "#4b5563",
                }}
              >
                Detalhes técnicos
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                {error.message}
                {isDevelopment && error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {resetError && (
              <button
                onClick={resetError}
                className="error-fallback__retry"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease-in-out",
                }}
              >
                Tentar novamente
              </button>
            )}
            <button
              onClick={() => chrome.runtime.reload()}
              className="error-fallback__reload"
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s ease-in-out",
              }}
            >
              Recarregar extensão
            </button>
          </div>

          <p
            style={{
              marginTop: "16px",
              fontSize: "13px",
              color: "#888",
              textAlign: "center",
            }}
          >
            Se o problema persistir, tente desinstalar e reinstalar a extensão.
          </p>
        </div>
      </div>
      <style>
        {`
          .error-fallback__retry:hover {
            background-color: #2563eb !important;
          }
          .error-fallback__reload:hover {
            background-color: #4b5563 !important;
          }
        `}
      </style>
    </>
  );
}
