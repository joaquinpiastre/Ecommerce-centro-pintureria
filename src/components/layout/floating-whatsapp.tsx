'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { whatsappOrderLink } from '../../../config/site';

const GREETING = '¡Hola! Quería hacer una consulta sobre un producto.';

export function FloatingWhatsapp() {
  const pathname = usePathname();
  // En /carrito ya hay un botón de WhatsApp bien visible con el pedido armado;
  // mostrar el flotante ahí encima sería redundante.
  if (pathname === '/carrito') return null;

  return (
    <motion.a
      href={whatsappOrderLink(GREETING)}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-75" style={{ animationDuration: '2.5s' }} />
      <WhatsappIcon className="h-7 w-7" />
    </motion.a>
  );
}
