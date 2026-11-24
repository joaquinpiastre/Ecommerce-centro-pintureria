import { PAYMENT, SITE, whatsappOrderLink } from '../../config/site';
import { priceBreakdown } from './pricing';
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
    lines.push(`${i + 1}) ${lineLabel(item)}`);
    if (item.price > 0) {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      lines.push(`   Cantidad: ${item.quantity} × ${formatPriceARS(item.price)} = ${formatPriceARS(subtotal)}`);
    } else {
      // Artículo sin precio publicado: se pide igual y el local pasa el precio.
      lines.push(`   Cantidad: ${item.quantity} — precio a consultar`);
    }
  });

  const unpriced = unpricedCount(items);
  if (total > 0) {
    lines.push('');
    const t = priceBreakdown(total);
    lines.push(`💵 *Efectivo (${PAYMENT.cashDiscountPct}% OFF): ${formatPriceARS(t.cash)}*`);
    lines.push(`🏦 Transferencia (${PAYMENT.transferDiscountPct}% OFF): ${formatPriceARS(t.transfer)}`);
    lines.push(`🏷️ Precio de lista: ${formatPriceARS(t.list)}`);
    lines.push(`💳 ${PAYMENT.installments} cuotas sin interés de ${formatPriceARS(t.installment)}`);
  }
  if (unpriced > 0) {
    lines.push('');
    lines.push(
      total > 0
        ? `ℹ️ El total no incluye ${unpriced === 1 ? '1 producto' : `${unpriced} productos`} con precio a consultar. ¿Me lo pasan?`
        : '¿Me pasan el precio de estos productos?'
    );
  }
  lines.push('');
  lines.push('Retiro en el local. ¿Me confirman disponibilidad y precio final? Te aviso cómo voy a pagar. ¡Gracias!');

  return lines.join('\n');
}

export function buildOrderWhatsappUrl(items: CartLine[]): string {
  return whatsappOrderLink(buildOrderMessage(items));
}

/** Total de los artículos que tienen precio publicado. */
export function cartTotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + (item.price > 0 ? item.price * item.quantity : 0), 0);
}

/** Cuántos artículos del carrito no tienen precio publicado ("Consultar precio"). */
export function unpricedCount(items: CartLine[]): number {
  return items.filter((item) => !(item.price > 0)).length;
}
