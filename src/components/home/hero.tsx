'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { SITE } from '../../../config/site';

// Círculos suaves en blanco sobre el verde de marca, solo para dar profundidad.
const BLOBS = [
  { top: '8%', left: '6%', size: 340 },
  { top: '55%', left: '2%', size: 260 },
  { top: '5%', left: '78%', size: 300 },
  { top: '60%', left: '82%', size: 320 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="pointer-events-none absolute inset-0">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 blur-3xl"
            style={{ top: b.top, left: b.left, width: b.size, height: b.size }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Image
            src="/logo-del-centro.jpg"
            alt="Del Centro Pinturerías"
            width={320}
            height={320}
            priority
            className="-mb-6 -mt-12 h-56 w-56 sm:h-64 sm:w-64"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <MapPin className="h-3.5 w-3.5" /> San Rafael, Mendoza · +40 años
          </span>
          <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
            El color de San Rafael, desde hace más de 40 años.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            Pinturas, herramientas, revestimientos y construcción en seco. Armá tu pedido online y coordinalo por WhatsApp — retiro en local.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/categoria/pinturas"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-ink shadow-lg shadow-black/10 transition-transform hover:scale-105"
            >
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {SITE.address.split(',')[0]}
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="relative h-10 bg-gradient-to-b from-transparent to-background sm:h-16" />
    </section>
  );
}
