# Testes de Debug da Extensão

Este diretório contém testes abrangentes para diagnosticar problemas na extensão v0-focus-extension.

## 🎯 Objetivo

Identificar e corrigir falhas que impedem o funcionamento correto da extensão, incluindo:
- Comunicação entre frontend e backend
- Inicialização de módulos
- Storage e persistência de dados
- Injeção de content scripts
- Aplicação de regras DNR (Declarative Net Request)

## 📁 Arquivos de Teste

### 1. `debug-communication.test.ts`
**Testa comunicação frontend-backend**
- Envio e recebimento de mensagens
- Port-based communication
- Tratamento de erros na comunicação
- Storage communication

### 2. `debug-initialization.test.ts`
**Testa inicialização dos módulos**
- Bootstrap function execution
- Module initialization com erros
- onInstalled/onStartup listeners
- Storage initialization
- Content script injection

### 3. `debug-storage.test.ts`
**Testa storage e persistência**
- Local storage operations
- Sync storage operations
- Session storage operations
- Error handling
- Storage change listeners
- Complex data persistence
- Storage quota limits

### 4. `debug-content-script.test.ts`
**Testa injeção de content script**
- Content script injection em tabs
- Content script communication
- Error handling
- State management
- Domain extraction
- Blacklist checking
- Time limit checking
- Protected pages handling

### 5. `debug-dnr.test.ts`
**Testa regras DNR**
- Blacklist rule creation
- Time limit rule creation
- Rule removal
- Rule listing
- Priority handling
- Regex pattern generation
- Rule cleanup
- Error handling
- Rule ID generation
- Complex rule scenarios

### 6. `debug-integration.test.ts`
**Testa integração completa**
- Complete extension lifecycle
- Blacklist functionality end-to-end
- Time limit functionality end-to-end
- Pomodoro functionality end-to-end
- Error recovery scenarios
- Performance under load

## 🚀 Como Executar os Testes

### Opção 1: Testes Automatizados (Recomendado)
```bash
# Executa todos os testes
npm run test

# Executa um teste específico
npx vitest run tests/debug-communication.test.ts

# Executa com relatório detalhado
npx vitest run tests/ --reporter=verbose
```

### Opção 2: Script de Execução
```bash
# Executa o script de diagnóstico
node tests/run-debug-tests.js
```

### Opção 3: Diagnóstico no Browser
1. Abra a extensão no Chrome
2. Vá para as Ferramentas do Desenvolvedor (F12)
3. Na aba "Console", cole e execute o conteúdo de `browser-debug.js`
4. Aguarde os resultados do diagnóstico

## 📊 Interpretando os Resultados

### ✅ Testes que Passaram
- Funcionalidade está funcionando corretamente
- Não há problemas identificados nesta área

### ❌ Testes que Falharam
- Identifica problemas específicos
- Verifique os logs de erro para detalhes
- Consulte as recomendações abaixo

## 🔧 Soluções para Problemas Comuns

### Comunicação Frontend-Backend
**Sintomas**: Mensagens não são enviadas/recebidas
**Soluções**:
- Verificar se o service worker está ativo
- Verificar se as mensagens têm o formato correto
- Verificar se os listeners estão registrados

### Inicialização de Módulos
**Sintomas**: Módulos não são carregados
**Soluções**:
- Verificar se há erros nos imports
- Verificar se as dependências estão corretas
- Verificar se o bootstrap está sendo chamado

### Storage
**Sintomas**: Dados não são salvos/recuperados
**Soluções**:
- Verificar permissões de storage
- Verificar se o storage não está cheio
- Verificar se as chaves estão corretas

### Content Script
**Sintomas**: Script não é injetado
**Soluções**:
- Verificar se o manifest.json está correto
- Verificar se as URLs são suportadas
- Verificar se há páginas protegidas

### DNR Rules
**Sintomas**: Regras não são aplicadas
**Soluções**:
- Verificar se as regras têm formato correto
- Verificar se não excedeu o limite de regras
- Verificar se as permissões estão corretas

## 📝 Logs de Debug

### Console do Navegador
- Abra F12 → Console
- Procure por mensagens que começam com `[v0]` ou `[DEBUG-TEST]`
- Verifique a aba "Service Worker" para logs do background

### Logs Específicos
- `[v0] Service Worker starting up...` - Extensão iniciando
- `[v0] Message received:` - Mensagem recebida
- `[v0] Failed to initialize` - Falha na inicialização
- `[DEBUG-TEST]` - Logs dos testes de debug

## 🎯 Próximos Passos

1. **Execute os testes** para identificar problemas
2. **Analise os resultados** e identifique falhas
3. **Corrija os problemas** identificados
4. **Re-execute os testes** para verificar correções
5. **Monitore os logs** durante o uso normal

## 📞 Suporte

Se os testes não resolverem o problema:
1. Verifique os logs detalhados
2. Execute o diagnóstico no browser
3. Verifique se todas as permissões estão corretas
4. Consulte a documentação do Chrome Extensions API

---

**Nota**: Estes testes são específicos para a extensão v0-focus-extension e podem precisar de ajustes para outras extensões.
