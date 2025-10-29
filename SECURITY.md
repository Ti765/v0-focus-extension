# Security Documentation - Focus Extension

## Visão Geral de Segurança

A Focus Extension implementa múltiplas camadas de segurança seguindo os princípios de **Defense in Depth**, **Least Privilege** e **Fail-Safe Defaults**. Este documento detalha todas as medidas de proteção implementadas, análise de superfície de ataque e práticas recomendadas.

### Princípios de Segurança

- **Defense in Depth**: Múltiplas camadas de proteção independentes
- **Least Privilege**: Permissões mínimas necessárias para funcionalidade
- **Fail-Safe Defaults**: Configurações seguras por padrão
- **Privacy by Design**: Dados processados localmente quando possível

### Compliance

- **LGPD**: Lei Geral de Proteção de Dados (Brasil)
- **GDPR**: General Data Protection Regulation (Europa)
- **Chrome Web Store**: Políticas de segurança e privacidade

## Análise de Superfície de Ataque

### Vetores de Ataque Identificados

#### 1. Content Script Injection
**Risco**: Scripts maliciosos injetados em páginas web
**Mitigação**: 
- Validação de origem das mensagens
- Sanitização com DOMPurify
- Verificação de contexto de execução

#### 2. Message Passing Exploits
**Risco**: Mensagens maliciosas entre contextos da extensão
**Mitigação**:
- Validação de tipo e origem das mensagens
- Branded types para type safety
- Schema validation de payloads

#### 3. Storage Tampering
**Risco**: Modificação maliciosa de dados no chrome.storage
**Mitigação**:
- Validação de schema antes de salvar
- Type guards para verificação de tipos
- Backup e restore de configurações

#### 4. DNR Rule Manipulation
**Risco**: Bypass ou manipulação de regras de bloqueio
**Mitigação**:
- Validação de domínios antes de criar regras
- Sanitização de regex patterns
- Verificação de integridade das regras

#### 5. XSS via Zen Mode
**Risco**: Execução de scripts via DOM manipulado
**Mitigação**:
- DOMPurify strict mode (implementado)
- Detecção de plain text
- Escape de caracteres especiais

#### 6. Race Conditions
**Risco**: Estados inconsistentes entre Service Worker e UI
**Mitigação**:
- Mensagens com timestamps
- Flag skipNotify para otimização
- Validação de estado antes de operações

## Proteções Implementadas

### 1. XSS Protection (Zen Mode)

**Localização**: `src/content/index.ts` (linhas 200-350)

**Configuração DOMPurify**:
```typescript
DOMPurify.sanitize(content, {
  // Apenas protocolos seguros
  ALLOWED_URI_REGEXP: /^(https?:|mailto:|data:image\/)/i,
  
  // Tags perigosas proibidas
  FORBID_TAGS: ['base', 'meta', 'link', 'script', 'iframe', 
                'object', 'embed', 'form', 'input', 'button'],
  
  // Atributos perigosos proibidos
  FORBID_ATTR: ['style', 'formaction', 'action', 'srcdoc', 
                'onload', 'onerror', 'onclick', 'onmouseover'],
  
  // Configurações adicionais de segurança
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false
});
```

**Detecção de Plain Text**: Fallback automático para `textContent` quando não há HTML tags

**Testes de Segurança Validados**:
- ✅ Payload `<img src=x onerror=alert(1)>` → Bloqueado
- ✅ Payload `<script>alert(1)</script>` → Bloqueado
- ✅ Payload `javascript:void(0)` → Bloqueado
- ✅ Payload `data:text/html,<script>alert(1)</script>` → Bloqueado

### 2. Content Security Policy

**Localização**: `public/manifest.json`

**Recomendações para Fortalecer**:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; base-uri 'none';"
}
```

**Nota**: Manifest V3 já aplica CSP estrito por padrão, mas configurações adicionais podem ser implementadas.

### 3. Message Validation

**Localização**: `src/background/modules/message-handler.ts`

**Validações Implementadas**:
1. **Type checking** com discriminated unions
2. **Source validation** (service-worker, popup-ui, content-script)
3. **Payload schema validation**
4. **MessageId uniqueness** (UUID v4)

**Recomendação de Melhoria**:
```typescript
// Adicionar verificação de origem do sender
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Validar que mensagem vem de contexto legítimo
  if (!sender.tab && msg.source === 'content-script') {
    console.error('[Security] Invalid message source');
    return false;
  }
  // ... resto do handler
});
```

### 4. Storage Encryption (Recomendação)

**Problema**: Dados sensíveis armazenados em plaintext
**Solução Proposta**: Encriptar blacklist e timeLimits antes de salvar

```typescript
// Futuro: src/shared/crypto-utils.ts
async function encryptData(data: any, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  // ... implementar AES-GCM
}
```

### 5. Regex Injection Prevention

**Localização**: `src/shared/regex-utils.ts`

**Proteção**: Escape de caracteres especiais em domínios
```typescript
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

**Usado em**: `src/background/modules/blocker.ts` para construir regras DNR

### 6. Rate Limiting (Recomendação)

**Problema**: Sem proteção contra spam de mensagens
**Solução Proposta**:
```typescript
// Implementar debounce/throttle em operações críticas
const addToBlacklistThrottled = throttle(addToBlacklist, 1000);
```

## Permissões e Justificativas

### Permissões Declaradas (`manifest.json`)

| Permissão | Justificativa | Uso |
|-----------|---------------|-----|
| `storage` | Persistência local de configurações e dados de uso | Armazenar blacklist, limites, histórico |
| `tabs` | Rastreamento de uso e injeção de content scripts | Monitorar tempo por aba, injetar CS |
| `alarms` | Timers Pomodoro e sincronização diária | Ciclos de foco/pausa, reset diário |
| `notifications` | Alertas de fim de ciclo Pomodoro | Notificar usuário sobre transições |
| `declarativeNetRequest*` | Bloqueio de sites da blacklist | Implementar bloqueio eficiente |
| `scripting` | Injeção dinâmica de content scripts | Injetar CS em abas existentes |
| `<all_urls>` | Análise de conteúdo e Modo Zen | Funcionar em todos os sites |

**Princípio do Menor Privilégio**: Todas as permissões são justificadas por funcionalidades core da extensão.

## Práticas de Desenvolvimento Seguro

### Code Review Checklist

- [ ] **Validação de inputs**: Domínios, regex patterns, user data
- [ ] **Sanitização**: Dados antes de renderizar (DOMPurify)
- [ ] **Type safety**: TypeScript strict mode ativado
- [ ] **Error handling**: Try-catch adequado, defensive programming
- [ ] **Logs seguros**: Não expor dados sensíveis em console
- [ ] **Testes de segurança**: Adicionar casos de teste para vulnerabilidades

### Debug Flags Seguros

```typescript
// src/shared/constants.ts
DEFAULT_SETTINGS = {
  debugDNR: false,              // Logs de bloqueio
  debugTracking: false,         // Logs de rastreamento
  debugContentAnalysis: false,  // Logs de análise
  debugPomodoro: false,         // Logs do timer
  debugZenMode: false           // Logs do Modo Zen
}
```

**Padrão**: Todas as flags de debug desabilitadas por padrão em produção.

### Validação de Inputs

```typescript
// Exemplo de validação de domínio
function validateDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.?[a-zA-Z]{2,}$/;
  return domainRegex.test(domain) && domain.length <= 253;
}
```

## Privacidade e LGPD

### Dados Coletados

#### Localmente (chrome.storage.local)
- **Blacklist de domínios**: Sites bloqueados pelo usuário
- **Limites de tempo**: Configurações por domínio
- **Histórico de uso diário**: Tempo gasto por site (agregado)
- **Configurações do usuário**: Preferências e customizações
- **Estado do Pomodoro**: Timer atual e configurações

#### Cloud Sync (Opcional - Firebase/Supabase)
- **Perfil do usuário**: Email, displayName, foto
- **Histórico de uso agregado**: Estatísticas sem URLs específicas
- **Configurações sincronizadas**: Preferências cross-device
- **NÃO sincroniza**: Blacklist (mantida local por privacidade)

### Direitos do Titular (LGPD)

| Direito | Implementação |
|---------|---------------|
| **Acesso** | UI mostra todos os dados coletados |
| **Correção** | Usuário pode editar configurações via interface |
| **Exclusão** | Botão "Limpar Todos os Dados" na UI |
| **Portabilidade** | Export JSON (feature planejada) |
| **Revogação** | Desabilitar sync a qualquer momento |

### Consentimento

- **Análise de conteúdo**: Opt-in via settings
- **Sincronização cloud**: Opt-in via settings
- **Telemetria**: Desabilitada por padrão

## Auditoria e Monitoramento

### Logs de Segurança

Todos os eventos críticos são logados com prefixo `[v0]`:

```typescript
console.log('[v0][Security] DNR rules updated:', ruleIds);
console.warn('[v0][Security] Invalid message source detected');
console.error('[v0][Security] Storage tampering attempt');
```

### Métricas de Segurança (Sugeridas)

- Número de tentativas de mensagens inválidas
- Falhas de sanitização XSS
- Erros de validação de storage
- Rate limit violations
- Tentativas de bypass de DNR

### Eventos Críticos Rastreados

- Tentativas de injeção de scripts
- Mensagens de origem suspeita
- Violações de schema de storage
- Tentativas de manipulação de DNR
- Erros de validação de domínio

## Resposta a Incidentes

### Processo de Divulgação

1. **Reportar**: Criar issue privada no GitHub (Security Advisory)
2. **Análise**: Equipe avalia severidade (24-48h)
3. **Patch**: Correção desenvolvida e testada
4. **Disclosure**: CVE publicado após patch disponível
5. **Update**: Usuários notificados via extension store

### Contato de Segurança

- **GitHub Security Advisories** (recomendado)
- **Email**: security@[seu-dominio] (se disponível)

### Timeline de Resposta

- **Crítico**: 24h para patch
- **Alto**: 48h para patch
- **Médio**: 1 semana para patch
- **Baixo**: Próxima release regular

## Dependências e Supply Chain

### Dependências de Segurança

| Dependência | Versão | Status | Justificativa |
|-------------|--------|--------|---------------|
| **DOMPurify** | v3.0.8 | ✅ Auditada | Sanitização XSS, sem CVEs conhecidas |
| **React** | 18 | ✅ Estável | Versão LTS, atualizada regularmente |
| **Vite** | 5 | ✅ Confiável | Build tool moderno e seguro |
| **Chart.js** | 4.5.1 | ✅ Atualizada | Visualizações, sem vulnerabilidades |
| **Zustand** | 5.0.8 | ✅ Leve | State management minimalista |

### Processo de Atualização

1. **Audit regular**: `npm audit` antes de cada release
2. **Dependabot**: Habilitado para security patches automáticos
3. **Review manual**: Dependências críticas revisadas manualmente
4. **Version pinning**: Versões específicas para evitar breaking changes

## Testes de Segurança

### Testes Automatizados (Recomendados)

```bash
# Adicionar ao package.json
"scripts": {
  "test:security": "npm audit && npm run test:xss",
  "test:xss": "vitest run tests/security-xss.test.ts",
  "test:injection": "vitest run tests/security-injection.test.ts"
}
```

### Casos de Teste

#### XSS Payloads (Zen Mode)
```typescript
const xssPayloads = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  'javascript:void(0)',
  'data:text/html,<script>alert(1)</script>',
  '<iframe src="javascript:alert(1)"></iframe>'
];
```

#### Message Injection Attacks
```typescript
const maliciousMessages = [
  { type: 'INVALID_TYPE', payload: { malicious: true } },
  { type: 'ADD_TO_BLACKLIST', payload: { domain: '<script>alert(1)</script>' } },
  { type: 'STATE_PATCH', payload: { blacklist: ['<img src=x onerror=alert(1)>'] } }
];
```

#### Storage Schema Violations
```typescript
const invalidStorageData = [
  { blacklist: '<script>alert(1)</script>' },  // String instead of array
  { timeLimits: 'invalid' },                   // Invalid type
  { settings: { theme: 'malicious' } }         // Invalid enum value
];
```

#### DNR Rule Bypass Attempts
```typescript
const bypassAttempts = [
  '*.evil.com',           // Wildcard abuse
  'evil.com/.*',          // Path manipulation
  'evil.com#fragment',    // Fragment bypass
  'evil.com?param=value'  // Query parameter bypass
];
```

## Roadmap de Segurança

### Melhorias Planejadas

#### Curto Prazo (1-3 meses)
- [ ] **Storage encryption**: Implementar AES-GCM para dados sensíveis
- [ ] **Rate limiting**: Adicionar throttling em message handlers
- [ ] **Sender validation**: Verificação aprimorada de origem de mensagens
- [ ] **Testes automatizados**: Suite completa de testes de segurança

#### Médio Prazo (3-6 meses)
- [ ] **CSP report-uri**: Implementar reporting de violações
- [ ] **Audit log**: Log estruturado para operações críticas
- [ ] **DNR integrity checks**: Verificação de integridade das regras
- [ ] **Input validation**: Validação mais rigorosa de todos os inputs

#### Longo Prazo (6+ meses)
- [ ] **Bug bounty program**: Programa de recompensas por vulnerabilidades
- [ ] **Security audit**: Auditoria externa por empresa especializada
- [ ] **Zero-trust architecture**: Implementar princípios de zero confiança
- [ ] **Automated security scanning**: CI/CD com scans de segurança

### Versões e Patches

- **Patches de segurança**: Released within 48h of discovery
- **Security updates**: Prioridade máxima no roadmap
- **Backward compatibility**: Mantida quando possível
- **Migration guides**: Documentação para breaking changes

## Conclusão

A Focus Extension implementa múltiplas camadas de segurança seguindo as melhores práticas da indústria. O foco em privacidade, validação rigorosa de dados e proteção contra XSS garante uma experiência segura para os usuários.

Para reportar vulnerabilidades ou sugerir melhorias de segurança, utilize o processo de Security Advisory do GitHub ou entre em contato através dos canais oficiais.

---

**Última atualização**: Dezembro 2024  
**Próxima revisão**: Março 2025