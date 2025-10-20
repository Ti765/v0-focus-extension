import App from "../src/popup/App"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Focus Extension</h1>
          <p className="text-lg text-gray-600">Extensão Chrome para Manutenção de Foco e Produtividade</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Info Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Sobre o Projeto</h2>
              <p className="text-gray-700 leading-relaxed">
                Esta é uma extensão de navegador Manifest V3 construída com TypeScript, React e Vite. O projeto
                implementa técnicas avançadas de gerenciamento de foco e produtividade.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">✨ Funcionalidades</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Bloqueio Inteligente:</strong> Bloqueie sites distrativos com análise de conteúdo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Pomodoro Timer:</strong> Sessões de foco com bloqueio adaptativo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Modo Zen:</strong> Visualização limpa de páginas web
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Dashboard:</strong> Análise de uso com gráficos interativos
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Stack Técnica</h3>
              <div className="flex flex-wrap gap-2">
                {["TypeScript", "React", "Vite", "Zustand", "Tailwind CSS", "Chart.js", "Chrome APIs"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">📦 Como Instalar</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>
                  Execute <code className="bg-yellow-100 px-1 rounded">npm install</code>
                </li>
                <li>
                  Execute <code className="bg-yellow-100 px-1 rounded">npm run build</code>
                </li>
                <li>
                  Abra <code className="bg-yellow-100 px-1 rounded">chrome://extensions/</code>
                </li>
                <li>Ative o "Modo do desenvolvedor"</li>
                <li>Clique em "Carregar sem compactação"</li>
                <li>
                  Selecione a pasta <code className="bg-yellow-100 px-1 rounded">dist</code>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">🔒 Privacidade & LGPD</h3>
              <p className="text-sm text-green-800">
                Todos os dados são processados localmente no dispositivo do usuário. Coleta de análise opcional requer
                consentimento explícito e segue rigorosamente as diretrizes da LGPD.
              </p>
            </div>
          </div>

          {/* Extension Popup Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">👁️ Preview do Popup da Extensão</h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Esta é a interface que aparece quando você clica no ícone da extensão
              </p>

              {/* Popup Container - mimics extension popup dimensions */}
              <div className="mx-auto" style={{ width: "400px" }}>
                <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-2xl">
                  <App />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                💡 <strong>Nota:</strong> Esta é uma demonstração da interface. Para funcionalidade completa, instale a
                extensão no Chrome.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🏗️ Arquitetura Manifest V3</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Service Worker</h4>
              <p className="text-sm text-gray-600">
                Orquestrador central orientado a eventos. Gerencia estado persistente via chrome.storage e coordena
                todos os módulos.
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Content Scripts</h4>
              <p className="text-sm text-gray-600">
                Análise de conteúdo de páginas, implementação do Modo Zen e manipulação do DOM em páginas web.
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Popup UI</h4>
              <p className="text-sm text-gray-600">
                Interface React com Zustand para gerenciamento de estado. Comunicação com service worker via mensagens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
