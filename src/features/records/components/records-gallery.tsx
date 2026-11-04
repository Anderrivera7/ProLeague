"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type RecordPoster = {
  src: string;
  alt: string;
  span: "full" | "pair" | "tile";
};

const spanClass = {
  full: "col-span-2",
  pair: "col-span-2 lg:col-span-1",
  tile: "col-span-1",
} as const;

export function RecordsGallery({ posters }: { posters: RecordPoster[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef(0);
  const open = index != null;
  const current = open ? posters[index] : null;

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (step: number) => {
      setIndex((currentIndex) => {
        if (currentIndex == null) return currentIndex;
        const next = (currentIndex + step + posters.length) % posters.length;
        return next;
      });
    },
    [posters.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, go]);

  return (
    <>
      <div className="grid grid-cols-2 items-start gap-3 lg:gap-4">
        {posters.map((poster, posterIndex) => (
          <button
            key={poster.src}
            type="button"
            onClick={() => setIndex(posterIndex)}
            className={`${spanClass[poster.span]} group overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster.src}
              alt={poster.alt}
              className="h-auto w-full transition duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <figure
            className="flex max-h-full max-w-5xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchX.current = event.changedTouches[0]?.clientX ?? 0;
            }}
            onTouchEnd={(event) => {
              const endX = event.changedTouches[0]?.clientX ?? touchX.current;
              const delta = endX - touchX.current;
              if (delta > 48) go(-1);
              if (delta < -48) go(1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {current.alt}
              <span className="mt-1 block text-xs text-white/45">
                {(index ?? 0) + 1} / {posters.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
