# Icons Directory

Este diretório deve conter os ícones da extensão nos seguintes tamanhos:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Como Adicionar os Ícones

### Opção 1: Criar seus próprios ícones

1. Use ferramentas como:
   - [Canva](https://www.canva.com/) (online, gratuito)
   - [Figma](https://www.figma.com/) (online, gratuito)
   - [GIMP](https://www.gimp.org/) (desktop, gratuito)
   - [Photoshop](https://www.adobe.com/photoshop) (desktop, pago)

2. Crie imagens PNG com fundo transparente nos tamanhos especificados

3. Use as cores do WhatsApp para manter a identidade visual:
   - Verde principal: `#25D366`
   - Verde escuro: `#128C7E`
   - Azul: `#34B7F1`

### Opção 2: Usar geradores online

1. Acesse um gerador de ícones como:
   - [Icon Generator](https://icon.kitchen/)
   - [App Icon Generator](https://appicon.co/)
   - [Favicon Generator](https://favicon.io/)

2. Faça upload de uma imagem base ou crie um design simples

3. Gere os ícones nos tamanhos necessários

### Opção 3: Ícones placeholder temporários

Para testes, você pode criar ícones simples usando qualquer editor de imagem ou até mesmo converter texto para imagem online.

## Exemplo de Estrutura Final

```
icons/
├── icon16.png
├── icon48.png
└── icon128.png
```

## Recomendações de Design

- Use símbolos relacionados ao WhatsApp (balão de conversa, telefone, etc)
- Mantenha o design simples e recognizível em tamanhos pequenos
- Use cores contrastantes para boa visibilidade
- Certifique-se de que o ícone funciona bem em backgrounds claros e escuros

## Nota Importante

A extensão **NÃO FUNCIONARÁ** sem os ícones. O Chrome requer que todos os ícones especificados no `manifest.json` estejam presentes.

Se você não tiver os ícones prontos, pode temporariamente criar arquivos PNG vazios ou com cores sólidas apenas para permitir o carregamento da extensão durante o desenvolvimento.
