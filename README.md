# Focus Extension - Extensão de Navegador para Manutenção de Foco

Extensão Chrome Manifest V3 para produtividade e gerenciamento de foco, construída com TypeScript, React e Vite.

## 🚀 Funcionalidades

### 1. Gestão de Acesso Inteligente
- **Bloqueio de Sites**: Bloqueie sites distrativos usando `declarativeNetRequest` (MV3)
- **Análise de Conteúdo**: Análise automática de páginas para detectar conteúdo distrativo
- **Limites de Tempo**: Defina limites diários para sites específicos

### 2. Temporizador Pomodoro
- **Máquina de Estados**: Ciclos de foco e pausa gerenciados por alarmes
- **Bloqueio Adaptativo**: Sites da blacklist são bloqueados durante sessões de foco
- **Progressão Adaptativa**: Aumento gradual do tempo de foco após ciclos completos

### 3. Modo Zen
- **Transformação do DOM**: Visualização limpa e focada de páginas web
- **Presets Personalizados**: Remova elementos específicos de sites favoritos

### 4. Dashboards e Análise
- **Rastreamento de Uso**: Monitoramento automático do tempo gasto em cada site
- **Visualizações**: Gráficos de pizza e barras com Chart.js
- **Privacidade**: Todos os dados armazenados localmente

## 🛠️ Stack de Tecnologia

- **TypeScript**: Segurança de tipos e melhor DX
- **Vite**: Build tool rápida com HMR
- **React**: Framework de UI para o popup
- **Zustand**: Gerenciamento de estado leve
- **Tailwind CSS**: Estilização utility-first
- **Chart.js**: Visualizações de dados
- **Chrome APIs**: storage, alarms, declarativeNetRequest, tabs, notifications

## 📦 Instalação

### Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Execute o build de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

4. Carregue a extensão no Chrome:
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `dist`

### Produção

\`\`\`bash
npm run build
\`\`\`

## 🏗️ Arquitetura

### Service Worker (background/index.ts)
- Orquestrador central orientado a eventos
- Gerencia estado persistente via `chrome.storage`
- Coordena todos os módulos

### Content Scripts (content/index.ts)
- Análise de conteúdo de páginas
- Implementação do Modo Zen
- Manipulação do DOM

### Popup UI (popup/)
- Interface React com Zustand
- Comunicação com service worker via mensagens
- Visualizações de dados com Chart.js

## 📋 Protocolo de Mensagens

Todas as mensagens seguem o formato: `{ type: string, payload?: any }`

Tipos principais:
- `GET_INITIAL_STATE`: Solicita estado completo da aplicação
- `ADD_TO_BLACKLIST`: Adiciona domínio à blacklist
- `START_POMODORO`: Inicia sessão Pomodoro
- `CONTENT_ANALYSIS_RESULT`: Resultado da análise de conteúdo

## 🔒 Privacidade e LGPD

- **Privacy by Design**: Processamento local de dados
- **Consentimento Explícito**: Opt-in para análise opcional
- **Minimização de Dados**: Apenas dados agregados
- **Direitos do Titular**: Acesso e exclusão de dados

## 🧪 Testes

\`\`\`bash
npm run test
\`\`\`

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.
