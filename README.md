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
- **Sync (Opcional)**: Firebase ou Supabase para sincronização cross-device

## 📦 Instalação

### Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. **Configure o Sentry** (monitoramento de erros):

Crie um arquivo `.env` na raiz do projeto:
```bash
# Windows PowerShell
cd v0-focus-extension
@"
VITE_SENTRY_DSN_REACT=your-react-dsn-here
VITE_SENTRY_DSN_BROWSER=your-browser-dsn-here
VITE_SENTRY_SEND_DEFAULT_PII=false
VITE_SENTRY_ENABLE_BROWSER_TRACING=false
"@ | Out-File -FilePath .env -Encoding UTF8
```

⚠️ **IMPORTANTE**: 
- Substitua `your-react-dsn-here` e `your-browser-dsn-here` pelos seus DSNs reais do Sentry
- Os DSNs são sensíveis e nunca devem ser commitados no repositório
- O arquivo `.env` está no `.gitignore` e não será versionado

4. Execute o build de desenvolvimento:
```bash
npm run dev
```

5. Carregue a extensão no Chrome:
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `dist`

### Produção

```bash
npm run build
```

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

```bash
npm run test
```

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.

---

# Documentação Técnica Detalhada

## Stack Tecnológica e Requisitos

### Frontend
- **React 18**: Framework de UI com hooks e functional components
- **TypeScript (strict mode)**: Segurança de tipos e melhor DX
- **Zustand**: Gerenciamento de estado leve e performático
- **Tailwind CSS**: Estilização utility-first com tema customizado

### Build System
- **Vite**: Build tool rápida com 3 configurações separadas:
  - `vite.config.ts`: UI (popup + options)
  - `vite.background.config.ts`: Service Worker
  - `vite.content.config.ts`: Content scripts

### Visualização e Dados
- **Chart.js**: Gráficos de pizza e barras para dashboards
- **DOMPurify**: Sanitização XSS para Modo Zen

### APIs Chrome
- `storage`: Persistência local de dados
- `alarms`: Timers Pomodoro e sincronização diária
- `declarativeNetRequest*`: Bloqueio de sites da blacklist
- `tabs`: Rastreamento de uso e injeção de content scripts
- `notifications`: Alertas de fim de ciclo Pomodoro
- `scripting`: Injeção dinâmica de content scripts

### Sincronização Cloud (Opcional)
- **Firebase**: Firestore + Authentication + Realtime updates
- **Supabase**: PostgreSQL + Auth + Realtime subscriptions

## Instalação e Setup

### Para Desenvolvedores

```bash
# Instalação completa
npm install

# Build completo
npm run build

# Builds específicos
npm run build:ui          # Apenas popup/options
npm run build:background  # Service worker
npm run build:content     # Content scripts

# Desenvolvimento
npm run dev
```

### Scripts de Build Disponíveis

```bash
npm run test                    # Todos os testes
npm run test:debug             # Output verbose
npm run test:communication     # Comunicação entre contextos
npm run test:initialization    # Bootstrap do SW
npm run test:storage           # Persistência
npm run test:dnr               # declarativeNetRequest
npm run test:integration       # End-to-end
```

## Arquitetura Técnica Detalhada

### Diagrama de Contextos

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
├─────────────────┬─────────────────┬─────────────────────┤
│  Service Worker │   Content Script │   UI (Popup/Options)│
│  (background/)  │   (content/)     │   (popup/, options/)│
└─────────────────┴─────────────────┴─────────────────────┘
```

### Service Worker (background/index.ts)

**Arquitetura modular** com 6 módulos principais:

1. **`blocker.ts`**: Gerenciamento de declarativeNetRequest
   - Adiciona/remove regras de bloqueio
   - Validação de domínios e regex
   - Cleanup automático de regras órfãs

2. **`pomodoro.ts`**: Máquina de estados do timer
   - Estados: idle, focus, short_break, long_break
   - Gerenciamento de alarmes Chrome
   - Transições automáticas entre fases

3. **`usage-tracker.ts`**: Monitoramento de tempo por domínio
   - Rastreamento em tempo real (30s interval)
   - Agregação diária de dados
   - Reset automático à meia-noite

4. **`content-analyzer.ts`**: Análise de páginas web
   - Scoring baseado em keywords do usuário
   - Detecção de conteúdo distrativo
   - Integração com sistema de blacklist

5. **`message-handler.ts`**: Protocolo de comunicação
   - Validação de mensagens entre contextos
   - Broadcasting de atualizações de estado
   - Error handling e logging

6. **`firebase-sync.ts`**: Sincronização opcional
   - Suporte a Firebase e Supabase
   - Sincronização de perfil e configurações
   - **NÃO sincroniza**: blacklist (privacidade)

**Responsabilidades**:
- Orquestração central de eventos
- Persistência via `chrome.storage.local`
- Gerenciamento de alarmes (Pomodoro, reset diário)
- Injeção de content scripts em abas existentes

### Content Scripts (content/index.ts)

**Funcionalidades**:
- **Análise de conteúdo distrativo**: Scoring baseado em keywords
- **Modo Zen**: Transformação do DOM com sanitização DOMPurify
- **Customizações específicas**: YouTube, redes sociais, etc.
- **Comunicação bidirecional**: Com Service Worker via messages

**Segurança**: Proteção XSS robusta com configuração strict DOMPurify

### UI Components

#### Popup (`src/popup/`)
- **Tabs**: Pomodoro, Blacklist, Dashboard
- **Store Zustand**: State management reativo
- **Visualizações**: Gráficos em tempo real

#### Options (`src/options/`)
- **4 views**: Dashboard, Time Limits, Site Blocking, Settings
- **Interface full-page**: Navegação lateral responsiva
- **Gráficos Chart.js**: Pizza e barras para análise de uso

## Sistema de Tipos e Mensageria

### Protocolo de Mensagens (src/shared/types.ts)

```typescript
interface BaseMessage<T, P> {
  type: T;
  id: MessageId;
  source: ContextSource;
  ts: number;
  payload?: P;
  skipNotify?: boolean;  // Otimização de broadcasts
}
```

**Tipos principais** (do MESSAGE constant):
- **Estado**: `GET_INITIAL_STATE`, `STATE_UPDATED`, `STATE_PATCH`
- **Blacklist**: `ADD_TO_BLACKLIST`, `REMOVE_FROM_BLACKLIST`
- **Limites**: `TIME_LIMIT_SET`, `TIME_LIMIT_REMOVE`
- **Pomodoro**: `POMODORO_START/PAUSE/RESUME/STOP`
- **Análise**: `CONTENT_ANALYSIS_RESULT`, `TOGGLE_ZEN_MODE`

### Storage Schema

```typescript
StorageSnapshot = {
  blacklist: string[];
  timeLimits: TimeLimitEntry[];
  dailyUsage: Record<string, DailyUsage>;
  siteCustomizations: SiteCustomizationMap;
  pomodoro: { config, state };
  settings: UserSettings;
}
```

## Fluxo de Dados

### Exemplo: Adicionar Site à Blacklist

```
UI (popup) → MESSAGE.ADD_TO_BLACKLIST → Service Worker
  ↓
blocker.ts: addToBlacklist()
  ↓
updateDNRRules() → chrome.declarativeNetRequest
  ↓
chrome.storage.local.set()
  ↓
STATE_UPDATED broadcast → Todas UIs abertas
```

### Exemplo: Ciclo Pomodoro

```
UI → POMODORO_START → Service Worker
  ↓
pomodoro.ts: startFocusPhase()
  ↓
chrome.alarms.create("pomodoro-phase")
  ↓
[Timer corre...]
  ↓
alarm listener → transitionPhase()
  ↓
Se focus: ativa bloqueios da blacklist
Se break: remove bloqueios
  ↓
STATE_UPDATED → UI atualiza interface
```

## Sincronização Cloud (Firebase/Supabase)

### Arquitetura Flexível

O módulo `firebase-sync.ts` é preparado para suportar ambos:

**Firebase** (Implementação atual):
```typescript
- Firestore: dados estruturados
- Authentication: Google Auth
- Realtime updates com onSnapshot
```

**Supabase** (Alternativa):
```typescript
- PostgreSQL: dados relacionais
- Auth: múltiplos providers
- Realtime subscriptions
```

### Dados Sincronizados
- Perfil do usuário
- Histórico de uso agregado
- Configurações cross-device
- **NÃO sincroniza**: blacklist (privacidade local)

### Migração Firebase → Supabase

1. Trocar SDK: `firebase` → `@supabase/supabase-js`
2. Adaptar autenticação
3. Mapear Firestore collections → PostgreSQL tables
4. Converter onSnapshot → realtime subscriptions

## Testes

### Estrutura (tests/)

```
tests/
├── debug-*.test.ts       # Testes modulares
├── loop-prevention.test.tsx
├── options.*.test.tsx
├── popup.store.test.tsx
└── test-utils.ts
```

### Ferramentas
- **Vitest**: Test runner
- **@testing-library/react**: Component testing
- **Chrome mocks**: `src/shared/chrome-mock.ts`

## Segurança e Privacidade

### Princípios LGPD
- **Privacy by Design**: Dados processados localmente
- **Consentimento**: Opt-in para análise/sync
- **Minimização**: Apenas agregados
- **Transparência**: SECURITY.md documenta práticas

### Implementações de Segurança
1. **XSS Protection**: DOMPurify com configuração strict
2. **CSP**: Content Security Policy no manifest
3. **Permissões**: Princípio do menor privilégio
4. **Storage**: Dados sensíveis em chrome.storage.local

Ver: `SECURITY.md` para detalhes completos

## Build e Deploy

### Estrutura de Build

```
dist/
├── manifest.json          # Manifest V3
├── background.js          # Service Worker bundle
├── content.js             # Content script bundle
├── popup.html + assets/   # Popup UI
├── options.html + assets/ # Options UI
├── blocked.html           # Página de bloqueio
├── rules.json             # DNR rules
└── icons/                 # Extension icons
```

### Scripts de Build
- 3 configurações Vite separadas:
  - `vite.config.ts`: UI (popup + options)
  - `vite.background.config.ts`: Service Worker
  - `vite.content.config.ts`: Content scripts

### Deploy
1. `npm run build`
2. Zipar pasta `dist/`
3. Upload no Chrome Web Store Developer Dashboard

## Desenvolvimento

### Estrutura de Diretórios

```
src/
├── background/
│   ├── index.ts           # Bootstrap
│   └── modules/           # 6 módulos principais
├── content/
│   └── index.ts           # Content script único
├── popup/
│   ├── App.tsx
│   ├── store.ts           # Zustand
│   └── components/
├── options/
│   ├── OptionsApp.tsx
│   └── views/             # 4 views principais
└── shared/
    ├── types.ts           # Sistema de tipos completo
    ├── constants.ts
    └── utils.ts
```

### Padrões de Código
- TypeScript strict mode
- Functional components com hooks
- Zustand para estado global
- Message passing para comunicação
- Branded types para type safety

### Debug
- Chrome DevTools: Service Worker inspector
- Console logs estruturados: `[v0]` prefix
- Debug flags: `settings.debugDNR`
- `tests/browser-debug.js`: Scripts de diagnóstico

## Roadmap e Contribuições

### Features Planejadas
- [ ] Sincronização Supabase completa
- [ ] Mais presets de customização de sites
- [ ] Estatísticas avançadas e metas
- [ ] Exportação de dados
- [ ] Temas customizáveis

### Como Contribuir
1. Fork do repositório
2. Criar branch feature
3. Seguir convenções em `.cursor/rules`
4. Adicionar testes
5. Abrir Pull Request

## Recursos Adicionais

- **SECURITY.md**: Documentação de segurança
- **BUILD-FIX.md**: Troubleshooting de build
- **.cursor/rules**: Convenções do projeto
- **Manifest V3**: Chrome Extension docs