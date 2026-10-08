export const SITE = {
  name: 'Centro Pinturería',
  shortName: 'Centro',
  tagline: 'Más de 40 años transformando espacios en San Rafael',
  description:
    'Catálogo de pinturas, herramientas, revestimientos y construcción en seco en San Rafael, Mendoza. Armá tu pedido y coordinalo por WhatsApp — retiro en local.',
  url: 'https://centropintureria.com.ar',
  address: 'Av. Hipólito Yrigoyen 621, San Rafael, Mendoza',
  mapsQuery: 'Av. Hipólito Yrigoyen 621, San Rafael, Mendoza',
  phone: '(0260) 463-8122',
  whatsappNumber: '5492604638122',
  instagram: '@centropintureria.central',
  instagramUrl: 'https://www.instagram.com/centropintureria.central/',
  hours: [
    { days: 'Lunes a Viernes', time: '8:30 – 13:00 y 16:00 – 20:30' },
    { days: 'Sábados', time: '8:30 – 13:00' },
  ],
  differentiators: [
    'Asesoramiento personalizado',
    'Amplio stock permanente',
    '6 cuotas sin interés',
    'Retiro en local',
  ],
  priceDisclaimer: 'Precios sujetos a confirmación. Coordiná el pedido final por WhatsApp.',
} as const;

/** Condiciones de pago: el precio de lista es el que figura en la lista de precios; los demás se calculan a partir de él. */
export const PAYMENT = {
  installments: 6,
  cashDiscountPct: 10,
  transferDiscountPct: 5,
  cardsLabel: 'todas las tarjetas bancarizadas',
} as const;

export function whatsappOrderLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
