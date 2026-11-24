'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  image: string | null;
  brandSlug: string | null;
  /** Se mantiene por compatibilidad con los llamadores; la imagen ya no depende de la categoría. */
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
 * 2) Logo de marca en /public/brands/{marca}.{svg|png|jpg|webp} sobre fondo claro
 * 3) Logo de Centro Pinturería y el nombre del producto, sobre fondo claro
 */
export function ProductImage({ image, brandSlug, name, className = '', sizes, priority }: ProductImageProps) {
  const [tier, setTier] = useState<0 | 1 | 2>(image ? 0 : brandSlug ? 1 : 2);
  const [logoExtIdx, setLogoExtIdx] = useState(0);
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
        // contain: la foto del producto se ve siempre entera (latas altas, aerosoles, pinceles), nunca recortada.
        className={`bg-white object-contain ${className}`}
        onError={() => setTier(brandSlug ? 1 : 2)}
      />
    );
  }

  if (tier === 1 && brandSlug) {
    return (
      <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-[12%] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={logoExtIdx}
          ref={imgRef}
          src={`/brands/${brandSlug}.${LOGO_EXTS[logoExtIdx]}`}
          alt={name}
          className="max-h-[45%] max-w-[80%] object-contain"
          onError={failLogo}
        />
      </div>
    );
  }

  return (
    // @container: en miniaturas chicas (carrito, buscador) se ve solo el logo, sin el nombre.
    <div
      className={`@container relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 p-[10%] text-center ${className}`}
    >
      <Image src="/logo-flor-transparente.png" alt="" width={64} height={64} className="h-auto w-1/3 max-w-16 opacity-80" />
      <span className="hidden text-xs font-medium leading-snug text-muted-foreground line-clamp-3 @[140px]:block">{name}</span>
    </div>
  );
}
