import Image from 'next/image';
import { PAYMENT } from '../../../config/site';

/** Fila de logos de las tarjetas aceptadas (las mismas del carrusel de la home). */
export function CardLogos({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`} aria-label="Tarjetas aceptadas">
      {PAYMENT.cards.map((c) => (
        <li key={c.name} className="flex h-7 w-10 items-center justify-center rounded-md border border-border bg-white px-1">
          <span className="relative h-4 w-full">
            <Image src={c.logo} alt={c.name} fill sizes="40px" className="object-contain" />
          </span>
        </li>
      ))}
    </ul>
  );
}
