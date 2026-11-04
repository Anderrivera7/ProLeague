import { Header } from "@/components/layout/header";
import { RecordsGallery } from "@/features/records/components/records-gallery";

const POSTERS = [
  { src: "/records/clubes-dt.png", alt: "Clubes más usados por los DT", span: "full" as const },
  { src: "/records/mejor-final.png", alt: "La mejor final, el derby", span: "full" as const },
  { src: "/records/goleada-partido.png", alt: "Mayor goleada en un partido, 11-0", span: "pair" as const },
  { src: "/records/mas-tarjetas.png", alt: "Partido con más tarjetas", span: "pair" as const },
  { src: "/records/primer-campeon-quito.png", alt: "Primer campeón con 1 punto, Liga de Quito", span: "tile" as const },
  { src: "/records/cambios-arquero.png", alt: "Más cambios de arquero en un torneo", span: "tile" as const },
  { src: "/records/goles-picada.png", alt: "Más goles de picada, Facundo Castro", span: "tile" as const },
  { src: "/records/el-clasico.png", alt: "El clásico, DT Yosef vs DT Jeje", span: "tile" as const },
  { src: "/records/maximo-goleador.png", alt: "Máximo goleador, Mbappé", span: "pair" as const },
  { src: "/records/mejor-arquero.png", alt: "Mejor arquero, Courtois", span: "pair" as const },
  { src: "/records/tetracampeon.png", alt: "Primer tetracampeón, DT Chura", span: "pair" as const },
  { src: "/records/tridente.png", alt: "El mejor tridente", span: "pair" as const },
  { src: "/records/goleada-final.png", alt: "Mayor goleada en una final", span: "pair" as const },
  { src: "/records/el-mas-remontado.png", alt: "El más remontado, DT Yosef", span: "pair" as const },
  { src: "/records/subcampeonatos.png", alt: "Más subcampeonatos", span: "pair" as const },
  { src: "/records/primer-descendido.png", alt: "Primer descendido a la B", span: "pair" as const },
];

export default function RecordsPage() {
  return (
    <>
      <Header title="Records" subtitle="Toca un cartel para verlo en grande" />
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sala de records
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Toca un cartel para verlo en grande. Puedes pasar al siguiente con
            las flechas o deslizando.
          </p>
        </div>
        <RecordsGallery posters={POSTERS} />
      </div>
    </>
  );
}
