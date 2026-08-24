import {
  PaintBucket,
  Car,
  Wrench,
  Droplets,
  TreeDeciduous,
  Layers,
  SprayCan,
  FlaskConical,
  Droplet,
  Building2,
  Package,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PaintBucket,
  Car,
  Wrench,
  Droplets,
  TreeDeciduous,
  Layers,
  SprayCan,
  FlaskConical,
  Droplet,
  Building2,
  Package,
};

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Package;
}
