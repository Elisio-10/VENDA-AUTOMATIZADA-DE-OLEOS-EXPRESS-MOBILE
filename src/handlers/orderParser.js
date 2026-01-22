// Extrai "2x Óleo 5W30" e "1x Filtro ABC" de texto livre.
// Usa regex simples + normalização; pode evoluir para NLP.
export function parseOrder(text) {
  if (!text) return null;
  const normalized = text
    .toLowerCase()
    .replace(/quero|comprar|pedido|por favor|pls|please/gi, '')
    .trim();

  const pattern = /(\d+)\s*x?\s*([a-z0-9\s\-]+)(?=$|,|e|;)/gi;
  const items = [];
  let match;
  while ((match = pattern.exec(normalized)) !== null) {
    const qty = parseInt(match[1], 10);
    const name = match[2].trim().replace(/\s{2,}/g, ' ');
    items.push({ name, qty });
  }
  return { items };
}
