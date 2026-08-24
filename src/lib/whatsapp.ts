import { SITE, whatsappOrderLink } from '../../config/site';
import type { CartLine } from './types';
import { formatPriceARS } from './format';

function lineLabel(item: CartLine): string {
  const parts = [item.name];
  if (item.sizeLabel) parts.push(item.sizeLabel);
  if (item.brand) parts.push(item.brand);
  return parts.join(' - ');
}

export function buildOrderMessage(items: CartLine[]): string {
  const lines: string[] = [];
  lines.push(`¡Hola ${SITE.name}! 👋`);
  lines.push('Quiero hacer el siguiente pedido:');
  lines.push('');
  lines.push('🛒 *Mi pedido*');

  let total = 0;
  items.forEach((item, i) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    lines.push(`${i + 1}) ${lineLabel(item)}`);
    lines.push(`   Cantidad: ${item.quantity} × ${formatPriceARS(item.price)} = ${formatPriceARS(subtotal)}`);
  });

  lines.push('');
  lines.push(`💰 *Total estimado: ${formatPriceARS(total)}*`);
  lines.push('');
  lines.push('Retiro en el local. ¿Me confirman disponibilidad y precio final? ¡Gracias!');

  return lines.join('\n');
}

export function buildOrderWhatsappUrl(items: CartLine[]): string {
  return whatsappOrderLink(buildOrderMessage(items));
}

export function cartTotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
