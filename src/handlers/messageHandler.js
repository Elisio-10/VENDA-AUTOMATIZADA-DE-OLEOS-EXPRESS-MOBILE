import { parseOrder } from './orderParser.js';
import { getInventory, reserveItems, commitInventoryChange } from '../services/inventory.js';
import { recordOrder } from '../services/orders.js';
import { paymentMessage } from './payment.js';
import dotenv from 'dotenv';

dotenv.config();

const GROUP_ID = process.env.GROUP_ID;

export async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from?.endsWith('@g.us');
  if (!isGroup || from !== GROUP_ID) return;

  const text = msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || '';

  // Comandos rápidos
  if (/^!ajuda/i.test(text)) {
    return sock.sendMessage(from, { text:
      'Comandos:\n' +
      '- !lista: ver produtos e preços\n' +
      '- !estoque: ver disponibilidade\n' +
      '- Pedido livre: ex. "Quero 2x Óleo 5W30 e 1x Filtro ABC"' });
  }

  if (/^!lista/i.test(text)) {
    const inv = await getInventory();
    const lines = inv.items.map(i => `• ${i.name} — ${i.price} ${process.env.CURRENCY}`);
    return sock.sendMessage(from, { text: 'Produtos:\n' + lines.join('\n') });
  }

  if (/^!estoque/i.test(text)) {
    const inv = await getInventory();
    const lines = inv.items.map(i => `• ${i.name}: ${i.stock} un.`);
    return sock.sendMessage(from, { text: 'Estoque:\n' + lines.join('\n') });
  }

  // Tentativa de pedido livre
  const order = parseOrder(text);
  if (!order || order.items.length === 0) return;

  const inv = await getInventory();
  const { ok, unavailable, total, reserved } = reserveItems(inv, order.items);

  if (!ok) {
    const msgUnavailable = unavailable.map(u => `• ${u.name} (pedido: ${u.requested}, disponível: ${u.available})`);
    return sock.sendMessage(from, { text:
      'Alguns itens estão indisponíveis:\n' + msgUnavailable.join('\n') +
      '\nAjuste o pedido ou use !estoque.' });
  }

  // Persistir pedido e estoque
  await recordOrder({
    customer: msg.pushName || 'Cliente',
    items: reserved,
    total,
    currency: process.env.CURRENCY,
    timestamp: new Date().toISOString(),
    message: text
  });

  await commitInventoryChange(inv);

  // Resposta com pagamento
  const payText = paymentMessage(reserved, total);
  return sock.sendMessage(from, { text: payText });
}
