export interface ProductVariant {
  codigo: string;
  sizeLabel: string | null;
  price: number;
  priceDisplay: string;
  hasPrice: boolean;
  /** Color, número de pincel, grano de lija, etc. dentro de un mismo producto. */
  option?: string | null;
  /** Foto propia de esta variante (ej. el color elegido). */
  image?: string | null;
  /** Precio de lista antes del descuento, solo si el producto está en oferta (price ya es el precio con descuento). */
  originalPrice?: number | null;
}

export interface Product {
  id: string;
  codigo: string;
  allCodigos: string[];
  name: string;
  slug: string;
  brand: string | null;
  brandSlug: string | null;
  category: string;
  categorySlug: string;
  subcategory: string | null;
  isOffer: boolean;
  variants: ProductVariant[];
  priceMin: number;
  priceMax: number;
  hasAnyPrice: boolean;
  image: string | null;
  /** % de descuento de la oferta (solo aplica si isOffer). */
  offerPct?: number | null;
  /** Descripción del producto que se muestra en la ficha. */
  description?: string | null;
  /** "Color", "Número", "Grano"… (singular) cuando el producto tiene variedades. */
  optionLabel?: string | null;
  /** "colores", "números", "granos"… (plural). */
  optionLabelPlural?: string | null;
}

export interface CategorySub {
  label: string;
  slug: string;
  count: number;
}

export interface CategoryBrand {
  slug: string;
  label: string;
  count: number;
}

export interface Category {
  slug: string;
  label: string;
  accent: string;
  icon: string;
  count: number;
  subcategories: CategorySub[];
  brands: CategoryBrand[];
  priceMin: number;
  priceMax: number;
}

export interface CategoriesFile {
  categories: Category[];
  totalProducts: number;
  offerCount: number;
}

export interface CartLine {
  productId: string;
  codigo: string;
  name: string;
  brand: string | null;
  sizeLabel: string | null;
  price: number;
  priceDisplay: string;
  quantity: number;
  image: string | null;
  categorySlug: string;
}
