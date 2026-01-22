import dotenv from 'dotenv';
dotenv.config();

export function paymentMessage(items, total) {
  const lines = items.map(i => `• ${i.name} x${i.qty}`);
  return [
    'Pedido confirmado ✅',
    'Itens:',
    ...lines,
    `Total: ${total} ${process.env.CURRENCY}`,
    '',
    `Pagamento: ${process.env.PAYMENT_INSTRUCTIONS}`,
    'Após o pagamento, responda "Pago" com o comprovativo.',
  ].join('\n');
}
