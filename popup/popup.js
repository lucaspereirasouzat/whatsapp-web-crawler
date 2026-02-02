// Estado global
let contacts = [];
let selectedContacts = new Set();

// Elementos DOM
const extractBtn = document.getElementById('extractBtn');
const contactsSection = document.getElementById('contactsSection');
const messageSection = document.getElementById('messageSection');
const contactsList = document.getElementById('contactsList');
const contactCount = document.getElementById('contactCount');
const selectAllBtn = document.getElementById('selectAllBtn');
const selectNoneBtn = document.getElementById('selectNoneBtn');
const exportBtn = document.getElementById('exportBtn');
const messageTemplate = document.getElementById('messageTemplate');
const delayInput = document.getElementById('delayInput');
const sendBtn = document.getElementById('sendBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const activityLog = document.getElementById('activityLog');
const clearLogBtn = document.getElementById('clearLogBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  setupEventListeners();
  addLog('Sistema iniciado. Aguardando ações...', 'info');
});

// Configurar listeners de eventos
function setupEventListeners() {
  extractBtn.addEventListener('click', extractContacts);
  selectAllBtn.addEventListener('click', selectAllContacts);
  selectNoneBtn.addEventListener('click', selectNoneContacts);
  exportBtn.addEventListener('click', exportContacts);
  sendBtn.addEventListener('click', sendMessages);
  clearLogBtn.addEventListener('click', clearLog);
}

// Extrair contatos do WhatsApp Web
async function extractContacts() {
  try {
    extractBtn.disabled = true;
    extractBtn.textContent = '⏳ Extraindo...';
    addLog('Iniciando extração de contatos...', 'info');

    // Obter tab ativa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Validação segura do hostname do WhatsApp Web
    if (!tab.url || !tab.url.startsWith('https://web.whatsapp.com/')) {
      addLog('❌ Erro: Você precisa estar no WhatsApp Web!', 'error');
      alert('Por favor, abra o WhatsApp Web primeiro!');
      extractBtn.disabled = false;
      extractBtn.innerHTML = '<span class="btn-icon">📱</span> Extrair Contatos';
      return;
    }

    // Injetar e executar script de extração
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractContactsFromPage
    });

    // The function now returns a Promise, so we await the result
    const extractedContacts = results[0].result;

    if (extractedContacts && extractedContacts.length > 0) {
      contacts = extractedContacts;
      saveToStorage();
      renderContacts();
      contactsSection.style.display = 'block';
      messageSection.style.display = 'block';
      addLog(`✅ ${contacts.length} contatos extraídos com sucesso!`, 'success');
    } else {
      addLog('⚠️ Nenhum contato encontrado. Certifique-se de que o WhatsApp está totalmente carregado e que você possui conversas na lista.', 'warning');
      addLog('💡 Dica: Role a lista de conversas para baixo e tente novamente.', 'info');
    }

  } catch (error) {
    console.error('Erro ao extrair contatos:', error);
    addLog(`❌ Erro ao extrair: ${error.message}`, 'error');
  } finally {
    extractBtn.disabled = false;
    extractBtn.innerHTML = '<span class="btn-icon">📱</span> Extrair Contatos';
  }
}

// Função injetada na página para extrair contatos
function extractContactsFromPage() {
  return new Promise((resolve) => {
    const contacts = [];
    
    // Função para tentar extrair com retry
    function attemptExtraction(retriesLeft = 5) {
      try {
        // Tentar múltiplos seletores para encontrar a lista de chats
        const chatList = document.querySelector('div[data-testid="chat-list"]') || 
                         document.querySelector('#pane-side') ||
                         document.querySelector('[aria-label*="lista"]') ||
                         document.querySelector('[aria-label*="Lista"]') ||
                         document.querySelector('div[role="navigation"]');
        
        if (!chatList) {
          if (retriesLeft > 0) {
            console.log(`Lista de chats não encontrada. Tentando novamente... (${retriesLeft} tentativas restantes)`);
            setTimeout(() => attemptExtraction(retriesLeft - 1), 1000);
            return;
          } else {
            console.error('Lista de chats não encontrada após múltiplas tentativas');
            resolve(contacts);
            return;
          }
        }

        // Seletores atualizados e mais robustos para WhatsApp Web
        let contactElements = chatList.querySelectorAll('div[role="listitem"]');
        
        // Fallback: tentar outros seletores se não encontrar listitems
        if (contactElements.length === 0) {
          contactElements = chatList.querySelectorAll('div[data-testid^="cell-frame-container"]');
        }
        if (contactElements.length === 0) {
          contactElements = chatList.querySelectorAll('div[class*="chat"]');
        }

        if (contactElements.length === 0) {
          if (retriesLeft > 0) {
            console.log(`Nenhum contato encontrado ainda. Tentando novamente... (${retriesLeft} tentativas restantes)`);
            setTimeout(() => attemptExtraction(retriesLeft - 1), 1000);
            return;
          } else {
            console.error('Nenhum elemento de contato encontrado após múltiplas tentativas');
            resolve(contacts);
            return;
          }
        }

        console.log(`Encontrados ${contactElements.length} elementos de contato`);

        // Usar timestamp único para esta extração
        const extractionTimestamp = Date.now();

        contactElements.forEach((element, index) => {
          try {
            // Extrair nome do contato com múltiplos fallbacks
            let name = '';
            const nameElement = element.querySelector('span[dir="auto"][title]') || 
                               element.querySelector('span[title]') ||
                               element.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
                               element.querySelector('span[dir="auto"]');
            
            if (nameElement) {
              name = nameElement.getAttribute('title') || nameElement.textContent || '';
            }

            // Extrair última mensagem (opcional)
            let lastMessage = '';
            const messageElements = element.querySelectorAll('span[dir="ltr"], span[dir="auto"]');
            if (messageElements.length > 1) {
              // Filtrar para não pegar o nome novamente
              for (let i = messageElements.length - 1; i >= 0; i--) {
                const text = messageElements[i].textContent || '';
                if (text && text.trim() !== name.trim() && text.length > 0) {
                  lastMessage = text;
                  break;
                }
              }
            }

            // Extrair avatar (opcional)
            let avatar = '';
            const avatarElement = element.querySelector('img[src]');
            if (avatarElement && avatarElement.src) {
              avatar = avatarElement.src;
            }

            // Adicionar apenas se tiver nome válido e não for "WhatsApp"
            const trimmedName = name.trim();
            if (trimmedName && !trimmedName.toLowerCase().includes('whatsapp')) {
              contacts.push({
                // ID format: contact_{timestamp}_{index}_{9-char-random}
                // slice(2,11) extracts 9 characters (positions 2-10), padEnd ensures exactly 9 chars
                id: `contact_${extractionTimestamp}_${index}_${Math.random().toString(36).slice(2, 11).padEnd(9, '0')}`,
                name: trimmedName,
                lastMessage: lastMessage.substring(0, 50).trim(),
                avatar: avatar
              });
            }
          } catch (err) {
            console.error('Erro ao processar contato:', err);
          }
        });

        console.log(`Extraídos ${contacts.length} contatos válidos`);
        resolve(contacts);

      } catch (error) {
        console.error('Erro na extração:', error);
        if (retriesLeft > 0) {
          setTimeout(() => attemptExtraction(retriesLeft - 1), 1000);
        } else {
          resolve(contacts);
        }
      }
    }

    // Iniciar extração
    attemptExtraction();
  });
}

// Renderizar lista de contatos
function renderContacts() {
  contactsList.innerHTML = '';
  contactCount.textContent = contacts.length;

  contacts.forEach(contact => {
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = contact.id;
    checkbox.checked = selectedContacts.has(contact.id);
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedContacts.add(contact.id);
      } else {
        selectedContacts.delete(contact.id);
      }
      saveToStorage();
    });

    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    if (contact.avatar) {
      const img = document.createElement('img');
      img.src = contact.avatar;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      avatar.appendChild(img);
    } else {
      avatar.textContent = contact.name.charAt(0).toUpperCase();
    }

    const contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info';
    
    const contactName = document.createElement('div');
    contactName.className = 'contact-name';
    contactName.textContent = contact.name;
    
    const contactMessage = document.createElement('div');
    contactMessage.className = 'contact-message';
    contactMessage.textContent = contact.lastMessage || 'Sem mensagens recentes';

    contactInfo.appendChild(contactName);
    contactInfo.appendChild(contactMessage);

    contactItem.appendChild(checkbox);
    contactItem.appendChild(avatar);
    contactItem.appendChild(contactInfo);
    
    contactItem.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.click();
      }
    });

    contactsList.appendChild(contactItem);
  });
}

// Selecionar todos os contatos
function selectAllContacts() {
  contacts.forEach(contact => selectedContacts.add(contact.id));
  saveToStorage();
  renderContacts();
  addLog('✅ Todos os contatos selecionados', 'info');
}

// Limpar seleção
function selectNoneContacts() {
  selectedContacts.clear();
  saveToStorage();
  renderContacts();
  addLog('✅ Seleção limpa', 'info');
}

// Exportar contatos para JSON
function exportContacts() {
  const dataStr = JSON.stringify(contacts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `whatsapp-contacts-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  addLog(`✅ ${contacts.length} contatos exportados para JSON`, 'success');
}

// Enviar mensagens
async function sendMessages() {
  const message = messageTemplate.value.trim();
  const delay = parseInt(delayInput.value) * 1000;

  if (!message) {
    alert('Por favor, digite uma mensagem!');
    return;
  }

  if (selectedContacts.size === 0) {
    alert('Por favor, selecione ao menos um contato!');
    return;
  }

  const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id));
  
  if (!confirm(`Enviar mensagem para ${selectedContactsList.length} contato(s)?`)) {
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = '⏳ Enviando...';
  progressBar.style.display = 'block';
  
  addLog(`📤 Iniciando envio para ${selectedContactsList.length} contato(s)...`, 'info');

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < selectedContactsList.length; i++) {
    const contact = selectedContactsList[i];
    const personalizedMessage = message.replace(/{nome}/g, contact.name);

    try {
      // Obter tab ativa
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Enviar mensagem através do content script
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: sendMessageToContact,
        args: [contact.name, personalizedMessage]
      });

      if (result[0].result.success) {
        sent++;
        addLog(`✅ Enviado para ${contact.name}`, 'success');
      } else {
        failed++;
        addLog(`❌ Falha ao enviar para ${contact.name}: ${result[0].result.error}`, 'error');
      }

    } catch (error) {
      failed++;
      addLog(`❌ Erro ao enviar para ${contact.name}: ${error.message}`, 'error');
    }

    // Atualizar progresso
    const progress = ((i + 1) / selectedContactsList.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;

    // Aguardar delay entre mensagens (exceto na última)
    if (i < selectedContactsList.length - 1) {
      await sleep(delay);
    }
  }

  // Finalizar
  sendBtn.disabled = false;
  sendBtn.innerHTML = '<span class="btn-icon">📤</span> Enviar Mensagens';
  addLog(`🎉 Envio concluído! Sucesso: ${sent} | Falhas: ${failed}`, sent > 0 ? 'success' : 'error');
  
  // Esconder barra de progresso após 3 segundos
  setTimeout(() => {
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
  }, 3000);
}

// Função injetada para enviar mensagem para um contato
async function sendMessageToContact(contactName, message) {
  try {
    // Encontrar e clicar no contato
    // Tentar múltiplos seletores para encontrar a lista de chats
    const chatList = document.querySelector('div[data-testid="chat-list"]') || 
                     document.querySelector('#pane-side') ||
                     document.querySelector('[aria-label*="lista"]') ||
                     document.querySelector('[aria-label*="Lista"]') ||
                     document.querySelector('div[role="navigation"]');
    
    if (!chatList) {
      return { success: false, error: 'Lista de contatos não encontrada' };
    }

    // Tentar múltiplos seletores para encontrar contatos
    let contactElements = chatList.querySelectorAll('div[role="listitem"]');
    if (contactElements.length === 0) {
      contactElements = chatList.querySelectorAll('div[data-testid^="cell-frame-container"]');
    }
    if (contactElements.length === 0) {
      contactElements = chatList.querySelectorAll('div[class*="chat"]');
    }
    
    let foundContact = false;

    for (const element of contactElements) {
      const nameElement = element.querySelector('span[dir="auto"][title]') || 
                         element.querySelector('span[title]') ||
                         element.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
                         element.querySelector('span[dir="auto"]');
      
      if (nameElement) {
        const name = nameElement.getAttribute('title') || nameElement.textContent || '';
        if (name.trim() === contactName.trim()) {
          element.click();
          foundContact = true;
          break;
        }
      }
    }

    if (!foundContact) {
      return { success: false, error: 'Contato não encontrado' };
    }

    // Aguardar chat abrir
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Encontrar campo de mensagem com múltiplos seletores
    const messageBox = document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
                      document.querySelector('div[contenteditable="true"][data-tab="6"]') ||
                      document.querySelector('div[contenteditable="true"]') ||
                      document.querySelector('div[role="textbox"]');

    if (!messageBox) {
      return { success: false, error: 'Campo de mensagem não encontrado' };
    }

    // Digitar mensagem
    messageBox.focus();
    
    // Simular digitação
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', message);
    const event = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });
    messageBox.dispatchEvent(event);

    // Aguardar mensagem ser digitada
    await new Promise(resolve => setTimeout(resolve, 500));

    // Encontrar e clicar no botão de enviar com múltiplos seletores
    let sendButton = document.querySelector('button[data-testid="send"]');
    
    if (!sendButton) {
      const sendIcon = document.querySelector('span[data-icon="send"]');
      if (sendIcon) {
        // Try to find the button - first check immediate parent, then traverse up
        const parentElement = sendIcon.parentElement;
        if (parentElement && parentElement.tagName === 'BUTTON') {
          sendButton = parentElement;
        } else {
          sendButton = sendIcon.closest('button');
        }
      }
    }
    
    if (!sendButton) {
      sendButton = document.querySelector('button[aria-label*="Send"]') ||
                  document.querySelector('button[aria-label*="Enviar"]');
    }

    if (!sendButton) {
      return { success: false, error: 'Botão de enviar não encontrado' };
    }

    sendButton.click();

    // Aguardar envio
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Adicionar entrada no log
function addLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  entry.textContent = `[${timestamp}] ${message}`;
  
  activityLog.appendChild(entry);
  activityLog.scrollTop = activityLog.scrollHeight;
}

// Limpar log
function clearLog() {
  activityLog.innerHTML = '<div class="log-entry">Log limpo.</div>';
}

// Salvar no storage
function saveToStorage() {
  chrome.storage.local.set({
    contacts: contacts,
    selectedContacts: Array.from(selectedContacts),
    messageTemplate: messageTemplate.value,
    delay: delayInput.value
  });
}

// Carregar do storage
function loadFromStorage() {
  chrome.storage.local.get([
    'contacts',
    'selectedContacts',
    'messageTemplate',
    'delay'
  ], (data) => {
    if (data.contacts) {
      contacts = data.contacts;
      renderContacts();
      contactsSection.style.display = 'block';
      messageSection.style.display = 'block';
    }
    
    if (data.selectedContacts) {
      selectedContacts = new Set(data.selectedContacts);
      renderContacts();
    }
    
    if (data.messageTemplate) {
      messageTemplate.value = data.messageTemplate;
    }
    
    if (data.delay) {
      delayInput.value = data.delay;
    }
  });
}

// Função helper para sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-salvar mensagem e delay
messageTemplate.addEventListener('input', saveToStorage);
delayInput.addEventListener('change', saveToStorage);
