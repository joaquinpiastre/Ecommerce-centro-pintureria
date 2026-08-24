import Link from 'next/link';
import { PaintBucket, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <PaintBucket className="h-11 w-11 rotate-[-18deg] text-primary" />
        <span className="absolute -bottom-1 -right-1 h-5 w-8 rounded-full bg-accent/70 blur-[2px]" />
      </div>
      <h1 className="font-heading text-4xl font-bold">Se nos derramó la pintura</h1>
      <p className="mt-3 text-muted-foreground">
        No encontramos la página que buscás. Puede que el producto haya cambiado de nombre o ya no esté disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Home className="h-4 w-4" /> Volver al inicio
        </Link>
        <Link
          href="/categoria/pinturas"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          <Search className="h-4 w-4" /> Ver catálogo
        </Link>
      </div>
    </div>
  );
}
