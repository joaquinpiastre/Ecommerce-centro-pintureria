'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { SITE } from '../../../config/site';
import { BRAND_PALETTE_ORDER } from '@/lib/brand-palette';

const BLOBS = [
  { color: BRAND_PALETTE_ORDER[0], top: '8%', left: '6%', size: 340 },
  { color: BRAND_PALETTE_ORDER[2], top: '55%', left: '2%', size: 260 },
  { color: BRAND_PALETTE_ORDER[4], top: '5%', left: '78%', size: 300 },
  { color: BRAND_PALETTE_ORDER[6], top: '60%', left: '82%', size: 320 },
  { color: BRAND_PALETTE_ORDER[8], top: '30%', left: '45%', size: 260 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1a1a1a]">
      <div className="pointer-events-none absolute inset-0">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 blur-3xl"
            style={{ background: b.color, top: b.top, left: b.left, width: b.size, height: b.size }}
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
            src="/logo-icon.png"
            alt=""
            width={96}
            height={96}
            priority
            className="mb-5 h-16 w-16 rounded-2xl shadow-2xl sm:h-20 sm:w-20"
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
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-accent to-[#00B388] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
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
