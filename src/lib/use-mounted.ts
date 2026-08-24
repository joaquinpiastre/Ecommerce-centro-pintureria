'use client';

import { useEffect, useState } from 'react';

/**
 * Evita mismatches de hidratación al leer estado persistido en localStorage (carrito).
 * El efecto sincroniza con la realidad externa "ya hidratamos en el browser", no deriva
 * de props/estado de React, por eso el setState directo en el efecto es intencional.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- flag post-hidratación, no derivable de render
  useEffect(() => setMounted(true), []);
  return mounted;
}
