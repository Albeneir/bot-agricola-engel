# 🌱 Bot Agrícola Engel — WhatsApp Autoatendimento

## Como subir no Railway (passo a passo)

### 1. Criar conta no Railway
- Acesse railway.app
- Clique em "Login" e entre com o GitHub
- Se não tiver GitHub, crie uma conta gratuita em github.com

### 2. Criar novo projeto no Railway
- No painel do Railway clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Se não tiver o código no GitHub, selecione "Empty Project"

### 3. Subir os arquivos (opção mais fácil)
- No projeto criado clique em "New Service"
- Selecione "GitHub Repo" ou arraste os arquivos

### 4. Configurar as variáveis de ambiente
No Railway vá em "Variables" e adicione:

| Nome | Valor |
|------|-------|
| WHATSAPP_TOKEN | Seu token gerado na Meta |
| PHONE_NUMBER_ID | 437599676107907 |
| VERIFY_TOKEN | engel_agricola_2024 |

### 5. Pegar a URL pública
- Após o deploy o Railway gera uma URL assim:
- `https://bot-agricola-engel.railway.app`
- Copie essa URL

### 6. Configurar o Webhook na Meta
- Acesse developers.facebook.com
- Abra o app AGRICOLA ENGEL
- Vá em WhatsApp → Configuração
- Em Webhooks clique em "Editar"
- Cole a URL: `https://sua-url.railway.app/webhook`
- Token de verificação: `engel_agricola_2024`
- Clique em "Verificar e Salvar"
- Ative os eventos: messages

## Setores configurados

1. 🔩 Venda de Peças — Douglas — 55 99977-8929
2. 🤝 Pós-venda — Eduardo — 55 99973-1468
3. 🛒 Compras — Luciano — 55 99606-8531
4. 💰 Financeiro — Fernando — 55 99963-4082
5. 📋 Fiscal — Leandro — 55 99682-6497
6. 🚜 Máquinas — Diego — 55 98138-6515
7. 🏢 Administrativo — Cesar — 55 99713-1066
