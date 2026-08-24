import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdminProductById } from '@/lib/data';
import { ProductEditForm } from '@/components/admin/product-edit-form';

export const dynamic = 'force-dynamic';

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getAdminProductById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/productos" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <ProductEditForm product={product} />
    </div>
  );
}
