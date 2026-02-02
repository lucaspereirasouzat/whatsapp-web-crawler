// WhatsApp Web Content Script
// Este script roda no contexto da página do WhatsApp Web

console.log('WhatsApp Web Crawler - Content Script carregado');

// Verificar se o WhatsApp Web está carregado
function isWhatsAppLoaded() {
  const chatList = document.querySelector('div[data-testid="chat-list"]') || 
                   document.querySelector('#pane-side');
  return chatList !== null;
}

// Aguardar WhatsApp carregar
function waitForWhatsApp(maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (isWhatsAppLoaded()) {
        clearInterval(checkInterval);
        console.log('WhatsApp Web carregado com sucesso');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('Timeout: WhatsApp Web não carregou');
        reject(new Error('WhatsApp Web não carregou'));
      }
    }, 500);
  });
}

// Extrair contatos da barra lateral
function extractContacts() {
  const contacts = [];
  
  try {
    // Tentar múltiplos seletores para encontrar a lista de chats
    const chatList = document.querySelector('div[data-testid="chat-list"]') || 
                     document.querySelector('#pane-side') ||
                     document.querySelector('[aria-label*="lista"]') ||
                     document.querySelector('[aria-label*="Lista"]') ||
                     document.querySelector('div[role="navigation"]');
    
    if (!chatList) {
      console.error('Lista de contatos não encontrada');
      return contacts;
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
        if (avatarElement && avatarElement.src && !avatarElement.src.includes('blob:')) {
          avatar = avatarElement.src;
        }

        // Adicionar apenas se tiver nome válido e não for "WhatsApp"
        const trimmedName = name.trim();
        if (trimmedName && !trimmedName.toLowerCase().includes('whatsapp')) {
          contacts.push({
            id: `contact_${index}_${extractionTimestamp}_${Math.random().toString(36).slice(2, 11)}`,
            name: trimmedName,
            lastMessage: lastMessage.substring(0, 50).trim(),
            avatar: avatar
          });
        }
      } catch (err) {
        console.error('Erro ao processar contato:', err);
      }
    });

  } catch (error) {
    console.error('Erro na extração de contatos:', error);
  }

  console.log(`Extraídos ${contacts.length} contatos`);
  return contacts;
}

// Encontrar contato pelo nome
function findContactByName(contactName) {
  try {
    // Tentar múltiplos seletores para encontrar a lista de chats
    const chatList = document.querySelector('div[data-testid="chat-list"]') || 
                     document.querySelector('#pane-side') ||
                     document.querySelector('[aria-label*="lista"]') ||
                     document.querySelector('[aria-label*="Lista"]') ||
                     document.querySelector('div[role="navigation"]');
    
    if (!chatList) {
      console.error('Lista de contatos não encontrada');
      return null;
    }

    // Tentar múltiplos seletores para encontrar contatos
    let contactElements = chatList.querySelectorAll('div[role="listitem"]');
    if (contactElements.length === 0) {
      contactElements = chatList.querySelectorAll('div[data-testid^="cell-frame-container"]');
    }
    if (contactElements.length === 0) {
      contactElements = chatList.querySelectorAll('div[class*="chat"]');
    }

    for (const element of contactElements) {
      const nameElement = element.querySelector('span[dir="auto"][title]') || 
                         element.querySelector('span[title]') ||
                         element.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
                         element.querySelector('span[dir="auto"]');
      
      if (nameElement) {
        const name = nameElement.getAttribute('title') || nameElement.textContent || '';
        if (name.trim().toLowerCase() === contactName.trim().toLowerCase()) {
          return element;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao encontrar contato:', error);
    return null;
  }
}

// Clicar em um contato
function clickContact(contactName) {
  try {
    const contactElement = findContactByName(contactName);
    
    if (contactElement) {
      contactElement.click();
      console.log(`Contato "${contactName}" clicado`);
      return true;
    } else {
      console.error(`Contato "${contactName}" não encontrado`);
      return false;
    }
  } catch (error) {
    console.error('Erro ao clicar no contato:', error);
    return false;
  }
}

// Obter campo de mensagem
function getMessageBox() {
  // Tentar diferentes seletores
  const selectors = [
    'div[contenteditable="true"][data-tab="10"]',
    'div[contenteditable="true"][data-tab="6"]',
    'div[contenteditable="true"]',
    'div[role="textbox"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

// Digitar mensagem no campo de input
function typeMessage(message) {
  try {
    const messageBox = getMessageBox();

    if (!messageBox) {
      console.error('Campo de mensagem não encontrado');
      return false;
    }

    // Focar no campo
    messageBox.focus();

    // Método 1: Usar clipboard event (mais confiável)
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', message);
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });
    messageBox.dispatchEvent(pasteEvent);

    console.log('Mensagem digitada com sucesso');
    return true;

  } catch (error) {
    console.error('Erro ao digitar mensagem:', error);
    
    // Método 2: Fallback - inserir texto diretamente
    try {
      const messageBox = getMessageBox();
      if (messageBox) {
        messageBox.textContent = message;
        
        // Disparar evento de input
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: message
        });
        messageBox.dispatchEvent(inputEvent);
        
        return true;
      }
    } catch (fallbackError) {
      console.error('Erro no método fallback:', fallbackError);
    }
    
    return false;
  }
}

// Obter botão de enviar
function getSendButton() {
  // Tentar diferentes seletores
  const selectors = [
    'button[data-testid="send"]',
    'span[data-icon="send"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="Enviar"]'
  ];

  for (const selector of selectors) {
    let element = document.querySelector(selector);
    
    // Se for um span, pegar o botão pai
    if (element && element.tagName === 'SPAN') {
      element = element.closest('button');
    }
    
    if (element) {
      return element;
    }
  }

  return null;
}

// Clicar no botão de enviar
function clickSendButton() {
  try {
    const sendButton = getSendButton();

    if (!sendButton) {
      console.error('Botão de enviar não encontrado');
      return false;
    }

    sendButton.click();
    console.log('Botão de enviar clicado');
    return true;

  } catch (error) {
    console.error('Erro ao clicar no botão de enviar:', error);
    return false;
  }
}

// Enviar mensagem completa para um contato
async function sendMessageToContact(contactName, message, options = {}) {
  const { clickDelay = 1500, typeDelay = 500, sendDelay = 1000 } = options;

  try {
    console.log(`Iniciando envio para ${contactName}`);

    // 1. Clicar no contato
    if (!clickContact(contactName)) {
      return { success: false, error: 'Contato não encontrado' };
    }

    // 2. Aguardar chat abrir
    await sleep(clickDelay);

    // 3. Digitar mensagem
    if (!typeMessage(message)) {
      return { success: false, error: 'Erro ao digitar mensagem' };
    }

    // 4. Aguardar digitação
    await sleep(typeDelay);

    // 5. Clicar em enviar
    if (!clickSendButton()) {
      return { success: false, error: 'Erro ao enviar mensagem' };
    }

    // 6. Aguardar envio
    await sleep(sendDelay);

    console.log(`Mensagem enviada com sucesso para ${contactName}`);
    return { success: true };

  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${contactName}:`, error);
    return { success: false, error: error.message };
  }
}

// Helper para sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensagem recebida:', request);

  try {
    switch (request.action) {
      case 'extractContacts':
        waitForWhatsApp()
          .then(() => {
            const contacts = extractContacts();
            sendResponse({ success: true, contacts: contacts });
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        return true; // Indica resposta assíncrona

      case 'sendMessage':
        sendMessageToContact(request.contactName, request.message, request.options)
          .then(result => {
            sendResponse(result);
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        return true; // Indica resposta assíncrona

      case 'checkWhatsApp':
        sendResponse({ 
          success: true, 
          loaded: isWhatsAppLoaded() 
        });
        break;

      default:
        sendResponse({ success: false, error: 'Ação desconhecida' });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    sendResponse({ success: false, error: error.message });
  }

  return false; // Resposta síncrona para ações não assíncronas
});

// Notificar que o script está pronto
console.log('WhatsApp Web Crawler - Content Script pronto');

// Verificar estado inicial
if (isWhatsAppLoaded()) {
  console.log('WhatsApp Web já está carregado');
} else {
  console.log('Aguardando WhatsApp Web carregar...');
}
