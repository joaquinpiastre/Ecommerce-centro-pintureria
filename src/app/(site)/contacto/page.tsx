import type { Metadata } from 'next';
import type { ComponentType, ReactNode } from 'react';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { SITE, whatsappOrderLink } from '../../../../config/site';
import { InstagramIcon } from '@/components/icons/instagram-icon';

export const metadata: Metadata = {
  title: 'Contacto y ubicación',
  description: `Visitá ${SITE.name} en ${SITE.address}. Horarios, teléfono y WhatsApp para coordinar tu pedido.`,
};

// Dinámico para que el header/footer (categorías y conteos) no queden con datos
// de build viejos frente a ediciones desde /admin.
export const dynamic = 'force-dynamic';

export default function ContactoPage() {
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold sm:text-4xl">Contacto y ubicación</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Te esperamos en el local para asesorarte, o coordinamos tu pedido por WhatsApp. No hacemos envíos: el retiro es siempre en el local.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <InfoCard icon={MapPin} title="Dirección">
            {SITE.address}
          </InfoCard>
          <InfoCard icon={Clock} title="Horarios">
            {SITE.hours.map((h) => (
              <span key={h.days} className="block">
                {h.days}: {h.time}
              </span>
            ))}
          </InfoCard>
          <InfoCard icon={Phone} title="Teléfono">
            {SITE.phone}
          </InfoCard>
          <InfoCard icon={InstagramIcon} title="Instagram">
            <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="hover:underline">
              {SITE.instagram}
            </a>
          </InfoCard>

          <a
            href={whatsappOrderLink('¡Hola! Quería consultar por un producto.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4.5 w-4.5" /> Escribirnos por WhatsApp
          </a>
        </div>

        <div className="min-h-[360px] overflow-hidden rounded-2xl border border-border shadow-sm">
          <iframe
            src={mapsSrc}
            className="h-full min-h-[360px] w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Ubicación de ${SITE.name}`}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: ComponentType<{ className?: string }>; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-brand-ink">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
