import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/lib/types';

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  lastAddedKey: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  removeItem: (codigo: string) => void;
  setQuantity: (codigo: string, quantity: number) => void;
  clear: () => void;
}

function lineKey(codigo: string) {
  return codigo;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedKey: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => lineKey(i.codigo) === lineKey(item.codigo));
        if (existing) {
          set({
            items: items.map((i) =>
              lineKey(i.codigo) === lineKey(item.codigo) ? { ...i, quantity: i.quantity + quantity } : i
            ),
            lastAddedKey: item.codigo,
          });
        } else {
          set({ items: [...items, { ...item, quantity }], lastAddedKey: item.codigo });
        }
      },
      removeItem: (codigo) => set({ items: get().items.filter((i) => i.codigo !== codigo) }),
      setQuantity: (codigo, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.codigo !== codigo) });
          return;
        }
        set({ items: get().items.map((i) => (i.codigo === codigo ? { ...i, quantity } : i)) });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'pdc-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCartCount() {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}
