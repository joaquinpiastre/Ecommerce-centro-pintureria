'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getCategoryIcon } from '@/lib/icons';
import { getCategoryMeta } from '@/lib/categories-meta';

interface ProductImageProps {
  image: string | null;
  brandSlug: string | null;
  categorySlug: string;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const LOGO_EXTS = ['svg', 'png', 'jpg', 'webp'];

/**
 * Sistema de imagen en 3 niveles:
 * 1) Foto real en /public/products/{codigo}.*
 * 2) Logo de marca en /public/brands/{marca}.{svg|png|jpg|webp} sobre fondo con el acento de la categoría
 * 3) Placeholder generado con ícono de categoría + degradé de marca
 */
export function ProductImage({ image, brandSlug, categorySlug, name, className = '', sizes, priority }: ProductImageProps) {
  const [tier, setTier] = useState<0 | 1 | 2>(image ? 0 : brandSlug ? 1 : 2);
  const [logoExtIdx, setLogoExtIdx] = useState(0);
  const meta = getCategoryMeta(categorySlug);
  const Icon = getCategoryIcon(meta.icon);
  const imgRef = useRef<HTMLImageElement>(null);

  function failLogo() {
    setLogoExtIdx((i) => {
      if (i + 1 < LOGO_EXTS.length) return i + 1;
      setTier(2);
      return i;
    });
  }

  // El navegador puede pedir/fallar la imagen del HTML servido por SSR antes de que
  // React hidrate y llegue a enganchar el onError, así que al montar (y en cada
  // intento de extensión) chequeamos si ya falló, además de escuchar errores futuros.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- corrige un fallo de carga que el navegador ya resolvió antes de la hidratación, no deriva del render
      if (tier === 0) setTier(brandSlug ? 1 : 2);
      else if (tier === 1) failLogo();
    }
  }, [tier, logoExtIdx, brandSlug]);

  if (tier === 0 && image) {
    return (
      <Image
        ref={imgRef}
        src={image}
        alt={name}
        fill
        sizes={sizes ?? '(min-width: 1024px) 25vw, 50vw'}
        priority={priority}
        placeholder="empty"
        className={`object-cover ${className}`}
        onError={() => setTier(brandSlug ? 1 : 2)}
      />
    );
  }

  if (tier === 1 && brandSlug) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center p-8 ${className}`}
        style={{ background: `linear-gradient(155deg, ${meta.accent} 0%, color-mix(in oklch, ${meta.accent}, black 25%) 100%)` }}
      >
        <div className="flex max-h-[60%] max-w-[75%] items-center justify-center rounded-2xl bg-white/95 p-4 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={logoExtIdx}
            ref={imgRef}
            src={`/brands/${brandSlug}.${LOGO_EXTS[logoExtIdx]}`}
            alt={name}
            className="max-h-20 max-w-full object-contain"
            onError={failLogo}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center ${className}`}
      style={{ background: `linear-gradient(155deg, ${meta.accent} 0%, color-mix(in oklch, ${meta.accent}, black 30%) 100%)` }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-black/10" />
      {/* eslint-disable-next-line react-hooks/static-components -- Icon viene de un lookup estable en un Record de módulo */}
      <Icon className="h-10 w-10 shrink-0 text-white/90" strokeWidth={1.5} />
      <span className="line-clamp-3 text-xs font-medium leading-snug text-white/90">{name}</span>
    </div>
  );
}
