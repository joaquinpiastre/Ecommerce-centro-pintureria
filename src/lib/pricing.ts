import { PAYMENT } from '../../config/site';

export interface PriceBreakdown {
  /** Precio de lista (el de la lista de precios). */
  list: number;
  /** Pagando en efectivo (descuento sobre el precio de lista). */
  cash: number;
  /** Pagando por transferencia (descuento sobre el precio de lista). */
  transfer: number;
  /** Valor de cada cuota sin interés (precio de lista dividido en cuotas). */
  installment: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function priceBreakdown(list: number): PriceBreakdown {
  return {
    list: round2(list),
    cash: round2(list * (1 - PAYMENT.cashDiscountPct / 100)),
    transfer: round2(list * (1 - PAYMENT.transferDiscountPct / 100)),
    installment: round2(list / PAYMENT.installments),
  };
}
