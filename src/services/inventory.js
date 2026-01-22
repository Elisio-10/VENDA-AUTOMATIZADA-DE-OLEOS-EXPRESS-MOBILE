import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const inventoryPath = path.join('data', 'inventory.json');

// Carrega estoque local; opcionalmente sincroniza com GitHub
export async function getInventory() {
  const raw = await fs.readFile(inventoryPath, 'utf-8');
  return JSON.parse(raw);
}

// Reserva itens se houver estoque suficiente
export function reserveItems(inv, requestedItems) {
  const unavailable = [];
  const reserved = [];
  let total = 0;

  for (const req of requestedItems) {
    const item = inv.items.find(i => i.name.toLowerCase() === req.name.toLowerCase());
    if (!item) {
      unavailable.push({ name: req.name, requested: req.qty, available: 0 });
      continue;
    }
    if (item.stock < req.qty) {
      unavailable.push({ name: item.name, requested: req.qty, available: item.stock });
      continue;
    }
    item.stock -= req.qty;
    reserved.push({ name: item.name, qty: req.qty, price: item.price });
    total += item.price * req.qty;
  }

  return { ok: unavailable.length === 0, unavailable, total, reserved };
}

// Commit local; pode ser estendido para PR no GitHub
export async function commitInventoryChange(inv) {
  await fs.writeFile(inventoryPath, JSON.stringify(inv, null, 2));
  // Opcional: criar commit via GitHub API
  if (process.env.GITHUB_TOKEN) {
    // Exemplo simples: enviar conteúdo atualizado (pode evoluir para PR)
    // Dica: use a API de "Contents" do GitHub para PUT com sha atual.
  }
}
