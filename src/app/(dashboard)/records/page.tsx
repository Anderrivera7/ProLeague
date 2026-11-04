import { Header } from "@/components/layout/header";

/** full: ancho completo. pair: comparte fila en pantallas grandes. */
const POSTERS = [
  { src: "/records/clubes-dt.png", alt: "Clubes más usados por los DT", span: "full" },
  { src: "/records/mejor-final.png", alt: "La mejor final, el derby", span: "full" },
  { src: "/records/goleada-partido.png", alt: "Mayor goleada en un partido, 11-0", span: "pair" },
  { src: "/records/mas-tarjetas.png", alt: "Partido con más tarjetas", span: "pair" },
  { src: "/records/primer-campeon-quito.png", alt: "Primer campeón con 1 punto, Liga de Quito", span: "tile" },
  { src: "/records/cambios-arquero.png", alt: "Más cambios de arquero en un torneo", span: "tile" },
  { src: "/records/goles-picada.png", alt: "Más goles de picada, Facundo Castro", span: "tile" },
  { src: "/records/el-clasico.png", alt: "El clásico, DT Yosef vs DT Jeje", span: "tile" },
  { src: "/records/maximo-goleador.png", alt: "Máximo goleador, Mbappé", span: "pair" },
  { src: "/records/mejor-arquero.png", alt: "Mejor arquero, Courtois", span: "pair" },
  { src: "/records/tetracampeon.png", alt: "Primer tetracampeón, DT Chura", span: "pair" },
  { src: "/records/tridente.png", alt: "El mejor tridente", span: "pair" },
  { src: "/records/goleada-final.png", alt: "Mayor goleada en una final", span: "pair" },
  { src: "/records/el-mas-remontado.png", alt: "El más remontado, DT Yosef", span: "pair" },
  { src: "/records/subcampeonatos.png", alt: "Más subcampeonatos", span: "pair" },
  { src: "/records/primer-descendido.png", alt: "Primer descendido a la B", span: "pair" },
] as const;

const spanClass = {
  full: "col-span-2",
  pair: "col-span-2 lg:col-span-1",
  tile: "col-span-1",
} as const;

export default function RecordsPage() {
  return (
    <>
      <Header title="Records" subtitle="Sala de records" />
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sala de records
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Los momentos que quedaron en la liga
          </p>
        </div>

        <div className="grid grid-cols-2 items-start gap-3 lg:gap-4">
          {POSTERS.map((poster) => (
            <figure key={poster.src} className={spanClass[poster.span]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.src}
                alt={poster.alt}
                className="h-auto w-full rounded-2xl border border-white/10 bg-black/40 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
              />
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
