import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bank, Money, Tag } from '@/components/icons';
import { HOME_COVER } from '@/lib/covers';
import { PAYMENT } from '../../../config/site';

/**
 * Portada de la home: foto a todo el ancho con el mensaje principal encima.
 * Debajo se superpone la tarjeta de medios de pago (6 cuotas + carrusel de tarjetas).
 */
export function Hero({ hasOffers }: { hasOffers: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-ink text-white">
      <Image
        src={HOME_COVER}
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[72%_30%] sm:object-[60%_30%]"
      />
      {/* Oscurece la mitad izquierda (donde va el texto) y deja ver la foto a la derecha. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="mx-auto flex min-h-[440px] max-w-7xl flex-col justify-center px-4 pb-28 pt-12 sm:min-h-[500px] sm:px-6 lg:min-h-[560px] lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/85">Centro Pinturería · San Rafael</p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold leading-[1.05] drop-shadow-sm sm:text-5xl lg:text-[3.5rem]">
          Aprovechá las mejores condiciones de pago
        </h1>
        <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
          Elegí tu producto, sumalo al carrito y coordiná el pedido por WhatsApp. Retiro en el local.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
            <Money weight="duotone" className="h-5 w-5" /> {PAYMENT.cashDiscountPct}% OFF en efectivo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
            <Bank weight="duotone" className="h-5 w-5" /> {PAYMENT.transferDiscountPct}% OFF por transferencia
          </span>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/categoria/pinturas"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-black/20 transition-transform hover:scale-105"
          >
            Ver catálogo <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
          {hasOffers && (
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-offer shadow-lg shadow-black/20 transition-transform hover:scale-105"
            >
              <Tag weight="fill" className="h-4 w-4" /> Ver ofertas
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
