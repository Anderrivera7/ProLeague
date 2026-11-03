import { Header } from "@/components/layout/header";

const POSTERS = [
  {
    src: "/records/mejor-final.png",
    alt: "La mejor final, el derby",
    featured: true,
  },
  { src: "/records/tridente.png", alt: "El mejor tridente" },
  { src: "/records/goleada-final.png", alt: "Mayor goleada en una final" },
  { src: "/records/subcampeonatos.png", alt: "Más subcampeonatos" },
  { src: "/records/primer-descendido.png", alt: "Primer descendido a la B" },
] as const;

export default function RecordsPage() {
  return (
    <>
      <Header title="Records" subtitle="Sala de records" />
      <div className="px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sala de records
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Los momentos que quedaron en la liga
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {POSTERS.map((poster) => (
            <figure
              key={poster.src}
              className={
                "featured" in poster && poster.featured ? "col-span-2" : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.src}
                alt={poster.alt}
                className="h-auto w-full rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              />
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
