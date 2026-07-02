const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// ─── CONFIGURAÇÕES ──────────────────────────────────────────
const VERIFY_TOKEN   = process.env.VERIFY_TOKEN   || 'engel_agricola_2024';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

// ─── SETORES DA AGRÍCOLA ENGEL ──────────────────────────────
const SETORES = [
  { num: '1', emoji: '🔩', nome: 'Venda de Peças',   responsavel: 'Douglas',  contato: '55 99977-8929' },
  { num: '2', emoji: '🤝', nome: 'Pós-venda',        responsavel: 'Eduardo',  contato: '55 99973-1468' },
  { num: '3', emoji: '🛒', nome: 'Compras',          responsavel: 'Luciano',  contato: '55 99606-8531' },
  { num: '4', emoji: '💰', nome: 'Financeiro',       responsavel: 'Fernando', contato: '55 99963-4082' },
  { num: '5', emoji: '📋', nome: 'Fiscal',           responsavel: 'Leandro',  contato: '55 99682-6497' },
  { num: '6', emoji: '🚜', nome: 'Máquinas',         responsavel: 'Diego',    contato: '55 98138-6515' },
  { num: '7', emoji: '🏢', nome: 'Administrativo',   responsavel: 'Cesar',    contato: '55 99713-1066' },
];

// ─── MENSAGENS ───────────────────────────────────────────────
const BOAS_VINDAS = `Olá!! 👋🌱

Seja muito bem-vindo à *Agrícola Engel*! 🚜✨

Estamos felizes em atendê-lo! Por favor, escolha o setor com o qual deseja falar:

${SETORES.map(s => `*${s.num}*. ${s.emoji} ${s.nome}`).join('\n')}

_Digite o número da opção desejada._`;

const OPCAO_INVALIDA = `⚠️ Opção inválida. Por favor, digite apenas o *número* correspondente ao setor:

${SETORES.map(s => `*${s.num}*. ${s.emoji} ${s.nome}`).join('\n')}`;

// ─── CONTROLE DE ESTADO POR USUÁRIO ─────────────────────────
const estados = {};

// ─── FUNÇÃO: ENVIAR MENSAGEM ─────────────────────────────────
async function enviarMensagem(para, texto) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: para,
        type: 'text',
        text: { body: texto }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Mensagem enviada para ${para}`);
  } catch (erro) {
    console.error('❌ Erro ao enviar mensagem:', erro.response?.data || erro.message);
  }
}

// ─── FUNÇÃO: PROCESSAR MENSAGEM ──────────────────────────────
async function processarMensagem(de, texto) {
  const input = texto.trim();
  const estado = estados[de] || 'inicio';

  console.log(`📩 [${de}] Estado: ${estado} | Mensagem: "${input}"`);

  // Estado inicial — envia boas-vindas
  if (estado === 'inicio') {
    estados[de] = 'aguardando_escolha';
    await enviarMensagem(de, BOAS_VINDAS);
    return;
  }

  // Aguardando escolha do setor
  if (estado === 'aguardando_escolha') {
    const setor = SETORES.find(s => s.num === input);

    if (setor) {
      // Mensagem de redirecionamento
      const msgRedirecionar = `Perfeito! 😊 Vou te direcionar para o setor de *${setor.nome}*.

👤 Responsável: *${setor.responsavel}*
📱 Contato: ${setor.contato}

Em instantes você será atendido(a). Obrigado pela sua paciência! 🙏`;

      await enviarMensagem(de, msgRedirecionar);

      // Mensagem final com contato direto
      setTimeout(async () => {
        const msgFinal = `✅ Transferindo para *${setor.responsavel}*...

Caso o atendimento estiver demorado por conta da demanda, você pode entrar em contato diretamente:
📞 ${setor.contato}`;

        await enviarMensagem(de, msgFinal);

        // Reseta o estado após 30 segundos
        setTimeout(() => {
          delete estados[de];
          console.log(`🔄 Estado de ${de} resetado.`);
        }, 30000);

      }, 2000);

    } else {
      // Opção inválida — pede para digitar novamente
      await enviarMensagem(de, OPCAO_INVALIDA);
    }
    return;
  }
}

// ─── WEBHOOK: VERIFICAÇÃO (GET) ──────────────────────────────
app.get('/webhook', (req, res) => {
  const modo      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (modo === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Falha na verificação do webhook — token incorreto');
    res.sendStatus(403);
  }
});

// ─── WEBHOOK: RECEBER MENSAGENS (POST) ───────────────────────
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // responde imediatamente à Meta

  const body = req.body;
  if (body.object !== 'whatsapp_business_account') return;

  const mensagens = body.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!mensagens || mensagens.length === 0) return;

  const mensagem = mensagens[0];
  const de    = mensagem.from;
  const texto = mensagem.text?.body;

  if (!texto) return; // ignora mensagens sem texto (áudios, imagens, etc)

  await processarMensagem(de, texto);
});

// ─── ROTA DE SAÚDE ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <h2>🌱 Bot Agrícola Engel</h2>
    <p>✅ Servidor funcionando!</p>
    <p>📱 WhatsApp Bot ativo com ${SETORES.length} setores configurados.</p>
  `);
});

// ─── INICIAR SERVIDOR ────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🌱 ================================');
  console.log('   BOT AGRÍCOLA ENGEL INICIADO!   ');
  console.log('🌱 ================================');
  console.log(`🚀 Porta: ${PORT}`);
  console.log(`🔐 Verify Token: ${VERIFY_TOKEN}`);
  console.log(`📱 Setores configurados: ${SETORES.length}`);
  console.log('');
});
