# 📱 WhatsApp Web Crawler

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow)

Extensão do Google Chrome para extrair contatos e enviar mensagens em massa no WhatsApp Web. Ferramenta educacional para automação de tarefas no WhatsApp.

## ⚠️ Avisos Legais IMPORTANTES

**LEIA ATENTAMENTE ANTES DE USAR:**

- 🚨 **O uso de automação pode violar os Termos de Serviço do WhatsApp**
- 🚫 **Existe RISCO REAL de bloqueio ou banimento permanente da sua conta**
- ⚖️ **Use com MODERAÇÃO e RESPONSABILIDADE**
- 📚 **Esta é uma ferramenta para fins EDUCACIONAIS e de pesquisa**
- 🛡️ **O desenvolvedor NÃO se responsabiliza por quaisquer consequências do uso desta ferramenta**
- 🤝 **Respeite a privacidade e o consentimento dos destinatários das mensagens**
- 📬 **NÃO use para SPAM, assédio ou atividades ilegais**

## 🌟 Funcionalidades

### ✅ Extração de Contatos
- Extrai contatos da barra lateral do WhatsApp Web
- Captura nome, última mensagem e avatar
- Suporte para múltiplos contatos simultaneamente

### 📨 Envio de Mensagens em Massa
- Envie mensagens personalizadas para múltiplos contatos
- Sistema de template com variável `{nome}`
- Seleção individual ou em massa de contatos

### ⏱️ Controle de Delay
- Delay configurável entre envios (1-60 segundos)
- Recomendado: 5-10 segundos para evitar detecção
- Previne bloqueios por atividade suspeita

### 💾 Exportação de Dados
- Exporte contatos para formato JSON
- Backup completo das informações extraídas
- Integração fácil com outras ferramentas

### 📊 Log de Atividades
- Acompanhe todas as ações em tempo real
- Registro de sucessos e falhas
- Histórico detalhado de envios

### 💪 Interface Moderna
- Design responsivo e intuitivo
- Cores temáticas do WhatsApp
- Barra de progresso animada
- Experiência de usuário otimizada

## 📋 Requisitos

- Google Chrome (versão 88 ou superior)
- Conta ativa do WhatsApp
- WhatsApp Web configurado e funcionando

## 🚀 Instalação

### Passo 1: Baixar o Código

```bash
# Clone o repositório
git clone https://github.com/lucaspereirasouzat/whatsapp-web-crawler.git

# Ou baixe o ZIP e extraia
```

### Passo 2: Carregar no Chrome

1. Abra o Google Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta do projeto (`whatsapp-web-crawler`)
6. A extensão será instalada e aparecerá na barra de ferramentas

### Passo 3: Verificar Instalação

- Você verá o ícone verde da extensão na barra do Chrome
- Clique no ícone para abrir o popup
- Se houver erros, verifique o console de extensões

## 📖 Como Usar

### 1️⃣ Extrair Contatos

1. Abra o [WhatsApp Web](https://web.whatsapp.com/) no Chrome
2. Faça login com seu telefone (se necessário)
3. Aguarde a lista de conversas carregar completamente
4. Clique no ícone da extensão na barra do Chrome
5. Clique no botão **"Extrair Contatos"**
6. Aguarde a extração (pode levar alguns segundos)

### 2️⃣ Selecionar Destinatários

- **Selecionar Todos**: Clique em "Selecionar Todos" para marcar todos os contatos
- **Selecionar Manualmente**: Clique nos checkboxes individuais
- **Limpar Seleção**: Clique em "Limpar Seleção" para desmarcar todos

### 3️⃣ Compor Mensagem

1. Digite sua mensagem no campo de texto
2. Use `{nome}` para personalizar (exemplo: "Olá {nome}, tudo bem?")
3. Configure o delay entre mensagens (recomendado: 5-10 segundos)

### 4️⃣ Enviar Mensagens

1. Clique no botão **"Enviar Mensagens"**
2. Confirme o envio na caixa de diálogo
3. Acompanhe o progresso na barra de progresso
4. Verifique o log para sucessos/falhas

### 5️⃣ Exportar Contatos

- Clique em **"Exportar Contatos (JSON)"**
- Um arquivo JSON será baixado automaticamente
- Use para backup ou integração com outras ferramentas

## 📁 Estrutura de Arquivos

```
whatsapp-web-crawler/
│
├── manifest.json              # Configuração da extensão
├── README.md                  # Este arquivo
│
├── popup/                     # Interface do usuário
│   ├── popup.html            # Estrutura HTML
│   ├── popup.css             # Estilos CSS
│   └── popup.js              # Lógica JavaScript
│
├── content/                   # Scripts de conteúdo
│   └── content.js            # Interage com WhatsApp Web
│
└── icons/                     # Ícones da extensão
    ├── icon16.png            # 16x16 pixels
    ├── icon48.png            # 48x48 pixels
    ├── icon128.png           # 128x128 pixels
    └── README.md             # Instruções para ícones
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da interface
- **CSS3**: Estilização moderna e responsiva
- **JavaScript (ES6+)**: Lógica da aplicação
- **Chrome Extensions API**: Integração com navegador
  - `chrome.tabs`: Gerenciamento de abas
  - `chrome.storage`: Armazenamento local
  - `chrome.scripting`: Injeção de scripts
- **Content Scripts**: Interação com WhatsApp Web
- **DOM Manipulation**: Extração e envio de dados

## 🔍 Seletores do WhatsApp Web (2026)

A extensão usa os seguintes seletores atualizados:

```javascript
// Lista de conversas
'div[data-testid="chat-list"]'

// Item de conversa individual
'div[role="listitem"]'

// Nome do contato
'span[dir="auto"][title]'

// Campo de mensagem
'div[contenteditable="true"][data-tab="10"]'

// Botão de enviar
'button[data-testid="send"]'

// Avatar do contato
'img[src]'
```

## 🐛 Solução de Problemas

### Extensão não carrega
- Verifique se o modo desenvolvedor está ativado
- Verifique se todos os arquivos estão presentes
- Veja o console de extensões para erros

### Não extrai contatos
- Certifique-se de estar no WhatsApp Web
- Aguarde a página carregar completamente
- Atualize a página e tente novamente

### Mensagens não são enviadas
- Verifique se o contato ainda existe
- Aumente o delay entre envios
- Verifique sua conexão com a internet
- Certifique-se de que o WhatsApp Web está ativo

### Conta foi bloqueada
- Isso pode acontecer se usar excessivamente
- Aguarde algumas horas/dias
- Entre em contato com o suporte do WhatsApp
- Use delays maiores no futuro

## 🔒 Privacidade e Segurança

- ✅ **Execução Local**: Todo o código roda localmente no seu navegador
- ✅ **Sem Servidor**: Não há comunicação com servidores externos
- ✅ **Sem Coleta de Dados**: Nenhum dado é coletado ou enviado
- ✅ **Open Source**: Código aberto para auditoria
- ⚠️ **Use por Sua Conta**: Você é responsável pelo uso da ferramenta

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Boas Práticas de Uso

1. **Intervalo Adequado**: Use delays de pelo menos 5-10 segundos
2. **Volume Moderado**: Não envie mais que 20-30 mensagens por hora
3. **Conteúdo Relevante**: Envie apenas mensagens úteis e relevantes
4. **Consentimento**: Certifique-se de ter permissão dos destinatários
5. **Horário Apropriado**: Evite envios em horários inconvenientes
6. **Monitoramento**: Fique atento a sinais de bloqueio (mensagens não entregues)

## 🔄 Atualizações Futuras

Possíveis melhorias planejadas:

- [ ] Suporte para envio de imagens e arquivos
- [ ] Agendamento de mensagens
- [ ] Estatísticas detalhadas de envio
- [ ] Múltiplos templates de mensagem
- [ ] Importação de contatos de CSV
- [ ] Filtros avançados de contatos
- [ ] Modo escuro

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido para fins educacionais.

## 🙏 Agradecimentos

- Comunidade Chrome Extensions
- Usuários e contribuidores
- WhatsApp (marca registrada da Meta)

---

**⚠️ DISCLAIMER**: Esta extensão não é afiliada, associada, autorizada, endossada ou de qualquer forma oficialmente conectada com WhatsApp, Meta Platforms, Inc., ou qualquer uma de suas subsidiárias ou afiliadas. O nome WhatsApp, assim como nomes, marcas, emblemas e imagens relacionadas são marcas registradas de seus respectivos proprietários.

**Use esta ferramenta de forma ética e responsável. O desenvolvedor não se responsabiliza por qualquer uso indevido ou consequências decorrentes do uso desta extensão.**

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

📧 Para dúvidas e sugestões, abra uma issue no repositório.
