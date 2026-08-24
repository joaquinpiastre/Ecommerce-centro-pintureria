import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { FloatingWhatsapp } from '@/components/layout/floating-whatsapp';
import { getCategories } from '@/lib/data';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const categories = getCategories();
  return (
    <>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <FloatingWhatsapp />
    </>
  );
}
