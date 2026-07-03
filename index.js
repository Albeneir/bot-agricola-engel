const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE || '3F587F35ABBE32E61E1B8699EC5A47CF';
const ZAPI_TOKEN    = process.env.ZAPI_TOKEN    || 'A1C1A398753B1F702AFB1B2D';
const PORT          = process.env.PORT          || 3000;
const ZAPI_URL      = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const SETORES = [
  { num: '1', emoji: '🔩', nome: 'Venda de Peças',   responsavel: 'Douglas',  contato: '55 99977-8929' },
  { num: '2', emoji: '🤝', nome: 'Pós-venda',        responsavel: 'Eduardo',  contato: '55 99973-1468' },
  { num: '3', emoji: '🛒', nome: 'Compras',          responsavel: 'Luciano',  contato: '55 99606-8531' },
  { num: '4', emoji: '💰', nome: 'Financeiro',       responsavel: 'Fernando', contato: '55 99963-4082' },
  { num: '5', emoji: '📋', nome: 'Fiscal',           responsavel: 'Leandro',  contato: '55 99682-6497' },
  { num: '6', emoji: '🚜', nome: 'Máquinas',         responsavel: 'Diego',    contato: '55 98138-6515' },
  { num: '7', emoji: '🏢', nome: 'Administrativo',   responsavel: 'Cesar',    contato: '55 99713-1066' },
];

const BOAS_VINDAS = `Olá!! 👋🌱\n\nSeja muito bem-vindo à *Agrícola Engel*! 🚜✨\n\nEstamos felizes em atendê-lo! Por favor, escolha o setor com o qual deseja falar:\n\n${SETORES.map(s => `*${s.num}*. ${s.emoji} ${s.nome}`).join('\n')}\n\n_Digite o número da opção desejada._`;

const OPCAO_INVALIDA = `⚠️ Opção inválida. Por favor, digite apenas o *número*:\n\n${SETORES.map(s => `*${s.num}*. ${s.emoji} ${s.nome}`).join('\n')}`;

const estados = {};

async function enviarMensagem(para, texto) {
  try {
    await axios.post(`${ZAPI_URL}/send-text`, { phone: para, message: texto });
    console.log(`✅ Mensagem enviada para ${para}`);
  } catch (erro) {
    console.error('❌ Erro:', erro.response?.data || erro.message);
  }
}

async function processarMensagem(de, texto) {
  const input = texto.trim();
  const estado = estados[de] || 'inicio';
  console.log(`📩 [${de}] Estado: ${estado} | Mensagem: "${input}"`);

  if (estado === 'inicio') {
    estados[de] = 'aguardando_escolha';
    await enviarMensagem(de, BOAS_VINDAS);
    return;
  }

  if (estado === 'aguardando_escolha') {
    const setor = SETORES.find(s => s.num === input);
    if (setor) {
      await enviarMensagem(de, `Perfeito! 😊 Vou te direcionar para o setor de *${setor.nome}*.\n\n👤 Responsável: *${setor.responsavel}*\n📱 Contato: ${setor.contato}\n\nEm instantes você será atendido(a). Obrigado pela sua paciência! 🙏`);
      setTimeout(async () => {
        await enviarMensagem(de, `✅ Transferindo para *${setor.responsavel}*...\n\nCaso o atendimento estiver demorado por conta da demanda, você pode entrar em contato diretamente:\n📞 ${setor.contato}`);
        setTimeout(() => { delete estados[de]; }, 30000);
      }, 2000);
    } else {
      await enviarMensagem(de, OPCAO_INVALIDA);
    }
  }
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  if (body.fromMe || body.isGroupMsg) return;
  const de    = body.phone;
  const texto = body.text?.message || body.body;
  if (!de || !texto) return;
  await processarMensagem(de, texto);
});

app.get('/', (req, res) => res.send('<h2>🌱 Bot Agrícola Engel — Z-API ✅</h2>'));

app.listen(PORT, () => {
  console.log(`🌱 Bot Agrícola Engel Z-API rodando na porta ${PORT}`);
});
