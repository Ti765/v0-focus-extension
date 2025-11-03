/**
 * Error Fallback Component for Options Page
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#dc2626',
        }}>
          ⚠️ Erro nas Configurações
        </h1>
        
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.6',
        }}>
          Ocorreu um erro inesperado ao carregar as configurações. 
          A equipe foi notificada automaticamente e investigará o problema.
        </p>
        
        {error && (
          <details style={{
            marginBottom: '20px',
            fontSize: '14px',
            color: '#888',
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              marginBottom: '12px',
              fontWeight: '500',
            }}>
              Detalhes técnicos
            </summary>
            <pre style={{
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid #e5e5e5',
            }}>
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {resetError && (
            <button
              onClick={resetError}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Tentar Novamente
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Recarregar Página
          </button>
        </div>
        
        <p style={{
          marginTop: '16px',
          fontSize: '13px',
          color: '#888',
          textAlign: 'center',
        }}>
          Se o problema persistir, tente desabilitar e reabilitar a extensão
        </p>
      </div>
    </div>
  );
}

