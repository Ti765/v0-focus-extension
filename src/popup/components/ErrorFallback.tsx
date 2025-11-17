/**
 * Error Fallback Component for Popup
 * 
 * Displayed when an error is caught by Sentry's ErrorBoundary
 * Provides user-friendly error message and recovery options
 */

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#dc2626',
        }}>
          ⚠️ Erro na Extensão
        </h2>
        
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5',
        }}>
          Ocorreu um erro inesperado. A equipe foi notificada automaticamente.
        </p>
        
        {error && (
          <details style={{
            marginBottom: '16px',
            fontSize: '12px',
            color: '#888',
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              Detalhes técnicos
            </summary>
            <pre style={{
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '11px',
            }}>
              {error.message}
            </pre>
          </details>
        )}
        
        {resetError && (
          <button
            onClick={resetError}
            className="error-fallback__retry"
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            Tentar Novamente
          </button>
        )}
        
        <p style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#888',
          textAlign: 'center',
        }}>
          Se o problema persistir, tente recarregar a extensão
        </p>
      </div>
      </div>
      <style>
        {`
          .error-fallback__retry:hover {
            background-color: #2563eb !important;
          }
        `}
      </style>
    </>
  );
}

