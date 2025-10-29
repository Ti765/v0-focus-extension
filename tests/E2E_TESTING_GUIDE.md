# E2E Testing Guide - Chrome Extension

## Overview

Este guia explica como usar os testes E2E (End-to-End) que utilizam os MCPs Chrome DevTools e Playwright para testar a extensão Chrome.

## Pré-requisitos

1. **Build da extensão**
   ```bash
   npm run build
   ```

2. **Carregar extensão no Chrome**
   - Abra `chrome://extensions`
   - Ative "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione o diretório `dist/`
   - **Anote o Extension ID** (ex: `kdemencfgieackiihjdgdjimmkefelbi`)

## Executando Testes E2E

### Opção 1: Teste Automatizado (Recomendado)

```bash
npm run test:e2e
```

Este script:
- Valida que a extensão está construída
- Executa todos os testes E2E
- Coleta logs do console
- Gera relatórios

### Opção 2: Execução Manual com MCPs

Você pode executar testes individuais usando os MCPs diretamente através do Cursor/Claude.

## Estrutura dos Testes

### 1. Setup e Configuração
- Verifica extensão instalada
- Obtém Extension ID
- Inicializa coleta de logs

### 2. Service Worker (Background)
- Testa inicialização dos módulos
- Captura logs do console do background
- Verifica criação de alarms

### 3. Popup UI
- Abre popup
- Captura snapshot da UI
- Testa interações
- Verifica comunicação com background

### 4. Options Page
- Testa navegação
- Testa configurações
- Verifica persistência

### 5. Content Scripts
- Verifica injeção em sites reais
- Captura logs do content script
- Testa análise de conteúdo

### 6. Simulação de Uso Real
- **Bloqueio**: Testa blacklist e bloqueio de sites
- **Tracking**: Testa rastreamento de uso
- **Limites**: Testa bloqueio automático por limite de tempo

## Usando Chrome DevTools MCP

### Exemplo: Capturar logs do console

```typescript
// Listar páginas abertas
const pages = await mcp_chrome-devtools_list_pages();

// Selecionar página do service worker
await mcp_chrome-devtools_select_page({ pageIdx: 0 });

// Capturar mensagens do console
const consoleMessages = await mcp_chrome-devtools_list_console_messages();
```

### Exemplo: Navegar e capturar snapshot

```typescript
// Navegar para popup
await mcp_chrome-devtools_navigate_page({ 
  url: `chrome-extension://${extensionId}/popup.html` 
});

// Capturar snapshot da UI
const snapshot = await mcp_chrome-devtools_take_snapshot();

// Capturar screenshot
await mcp_chrome-devtools_take_screenshot({ 
  fullPage: true,
  filePath: 'test-logs/e2e/popup-screenshot.png'
});
```

### Exemplo: Interagir com elementos

```typescript
// Clicar em botão
await mcp_chrome-devtools_click({ uid: 'button-uid-from-snapshot' });

// Preencher formulário
await mcp_chrome-devtools_fill({ 
  uid: 'input-uid', 
  value: 'youtube.com' 
});
```

## Usando Playwright MCP

Para testes mais complexos ou múltiplas abas:

```typescript
// Navegar para site
await mcp_cursor-playwright_browser_navigate({ 
  url: 'https://www.youtube.com' 
});

// Capturar snapshot
const snapshot = await mcp_cursor-playwright_browser_snapshot();

// Capturar mensagens do console
const consoleMessages = await mcp_cursor-playwright_browser_console_messages();
```

## Logs e Relatórios

Todos os logs são salvos em `test-logs/e2e/`:

```
test-logs/e2e/
├── setup/              # Informações de setup
├── background/         # Logs do service worker
├── popup/              # Logs e snapshots do popup
├── options/            # Logs da página de opções
├── content-scripts/    # Logs dos content scripts
├── user-simulation/    # Logs das simulações
├── network/            # Logs de requisições HTTP
└── reports/            # Relatórios gerados
```

### Gerar Relatório

```bash
npm run test:e2e:report
```

Isso analisa todos os logs e gera um relatório markdown com:
- Sumário executivo
- Problemas identificados
- Logs relevantes
- Recomendações de correção

## Fluxo de Teste Completo Recomendado

1. **Build**
   ```bash
   npm run build
   ```

2. **Carregar extensão no Chrome**
   - Obter Extension ID

3. **Executar testes E2E**
   ```bash
   npm run test:e2e
   ```

4. **Gerar relatório**
   ```bash
   npm run test:e2e:report
   ```

5. **Analisar relatório**
   - Abrir `test-logs/e2e/reports/full-test-report-[timestamp].md`
   - Verificar problemas identificados
   - Corrigir problemas encontrados
   - Re-executar testes

## Notas Importantes

- Os testes E2E requerem que o Chrome esteja rodando com a extensão carregada
- O Extension ID deve ser obtido manualmente ou via script que lê chrome://extensions
- Alguns testes podem levar tempo (simulação de uso real)
- Logs do console são capturados continuamente durante os testes
- Screenshots são salvos quando aplicável

## Troubleshooting

**Problema:** Extension not found
- **Solução:** Execute `npm run build` primeiro

**Problema:** Extension ID not found
- **Solução:** Certifique-se de que a extensão está carregada no Chrome

**Problema:** Console logs não capturados
- **Solução:** Verifique se está usando Chrome DevTools MCP corretamente
- Verifique se a página do service worker está acessível

**Problema:** Testes falhando
- **Solução:** Verifique os logs em `test-logs/e2e/`
- Execute `npm run test:e2e:report` para análise detalhada

