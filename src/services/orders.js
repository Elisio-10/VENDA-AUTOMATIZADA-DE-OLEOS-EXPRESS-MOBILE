import fs from 'fs/promises';
import path from 'path';

const ordersPath = path.join('data', 'orders.csv');

export async function recordOrder(order) {
  const header = 'timestamp,customer,items,total,currency,message\n';
  try {
    await fs.access(ordersPath);
  } catch {
    await fs.writeFile(ordersPath, header);
  }
  const itemsStr = order.items.map(i => `${i.name} x${i.qty}`).join('|');
  const line = [
    order.timestamp,
    escapeCsv(order.customer),
    escapeCsv(itemsStr),
    order.total,
    order.currency,
    escapeCsv(order.message)
  ].join(',') + '\n';

  await fs.appendFile(ordersPath, line);
}

function escapeCsv(val) {
  const s = String(val ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
