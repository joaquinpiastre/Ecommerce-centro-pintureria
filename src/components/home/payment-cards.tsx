'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate, motion, MotionConfig, useInView, useReducedMotion } from 'framer-motion';
import { PAYMENT } from '../../../config/site';

/**
 * Tarjeta de medios de pago que se superpone a la portada:
 * arriba la animación de "6 cuotas sin interés" y abajo el carrusel de tarjetas.
 */
export function PaymentCards() {
  return (
    <section aria-label="Medios de pago" className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* reducedMotion="user": si la persona pidió menos movimiento, framer no anima desplazamientos ni escalas. */}
      <MotionConfig reducedMotion="user">
        <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-xl shadow-black/10">
          <InstallmentsBanner />
          <CardsMarquee />
        </div>
      </MotionConfig>
    </section>
  );
}

/** "6 cuotas sin interés": el número cuenta hasta 6 al aparecer en pantalla y después late suave. */
function InstallmentsBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const total: number = PAYMENT.installments;
  const [count, setCount] = useState<number>(total);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(1, total, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, total]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 px-5 pb-4 pt-7 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28">
        {/* Anillos que se expanden y desaparecen, como un "latido" (ocultos por CSS si se pidió menos movimiento,
            así el HTML del servidor y del navegador es el mismo). */}
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-primary motion-reduce:hidden"
            initial={{ scale: 1, opacity: 0 }}
            animate={inView ? { scale: [1, 1.45], opacity: [0.55, 0] } : undefined}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: 1.2 + i * 1.1,
              ease: 'easeOut',
            }}
          />
        ))}
        <motion.span
          className="relative flex h-full w-full items-center justify-center rounded-full bg-primary font-heading text-6xl font-extrabold text-primary-foreground shadow-lg shadow-primary/30 sm:text-7xl"
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
          animate={inView ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          {/* El lector de pantalla siempre lee el número final. */}
          <span aria-hidden>{count}</span>
          <span className="sr-only">{total}</span>
        </motion.span>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, delay: 0.25 }}>
        <p className="font-heading text-3xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-4xl">
          cuotas <span className="shimmer-text">sin interés</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Con {PAYMENT.cardsLabel}. También {PAYMENT.cashDiscountPct}% OFF en efectivo y {PAYMENT.transferDiscountPct}% OFF por transferencia.
        </p>
      </motion.div>
    </div>
  );
}

/** Carrusel infinito de tarjetas. Se pausa al pasar el mouse y queda quieto si el usuario pidió menos movimiento. */
function CardsMarquee() {
  const cards = PAYMENT.cards;
  // Cada mitad del carril repite la lista lo suficiente para cubrir pantallas anchas;
  // el carril se desplaza exactamente media longitud, así el loop no tiene saltos.
  const half = [...cards, ...cards];

  return (
    <div className="group relative border-t border-border bg-muted/40 py-5">
      <p className="sr-only">Tarjetas aceptadas: {cards.map((c) => c.name).join(', ')}.</p>
      <div className="marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max gap-4 group-hover:[animation-play-state:paused]">
          {[...half, ...half].map((card, i) => (
            <CardTile key={i} name={card.name} logo={card.logo} duplicate={i >= cards.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardTile({ name, logo, duplicate }: { name: string; logo: string; duplicate: boolean }) {
  return (
    <div
      aria-hidden
      className={`${duplicate ? 'marquee-dup ' : ''}relative flex h-[86px] w-[136px] shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-white to-zinc-50 px-4 shadow-sm sm:h-[100px] sm:w-[158px]`}
    >
      {/* Chip de la tarjeta, para que se lea como una tarjeta y no como un logo suelto. */}
      <span className="absolute left-3 top-3 h-3.5 w-5 rounded-[3px] bg-gradient-to-br from-amber-200 to-amber-400 opacity-80" />
      {/* Caja fija para todos los logos: los anchos (Visa) y los cuadrados (Amex) se ven de tamaño parecido. */}
      <span className="relative mt-2 h-[52%] w-[80%]">
        <Image src={logo} alt={name} fill sizes="130px" className="object-contain" />
      </span>
    </div>
  );
}
