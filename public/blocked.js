// blocked.js - Script para extrair e exibir o domínio bloqueado
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get('domain');
  const domainElement = document.getElementById('blocked-domain');
  
  if (domain && domainElement) {
    domainElement.textContent = domain;
  }
})();
