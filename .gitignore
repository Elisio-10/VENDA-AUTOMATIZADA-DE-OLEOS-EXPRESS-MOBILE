import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import dotenv from 'dotenv';
import { handleMessage } from './handlers/messageHandler.js';
import { logInfo, logError } from './utils/logger.js';

dotenv.config();

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        await handleMessage(sock, msg);
      } catch (err) {
        logError('Erro ao processar mensagem', err);
      }
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') logInfo('Conectado ao WhatsApp.');
    if (connection === 'close') logError('Conexão fechada', lastDisconnect?.error);
  });
}

start().catch((e) => logError('Falha ao iniciar bot', e));
