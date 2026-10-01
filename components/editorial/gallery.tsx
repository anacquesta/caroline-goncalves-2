"use client";
import type { RecordItem } from "@/components/admin/text-editor";
import { useEffect, useState } from "react";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { EditorialImage } from "./image";
export type GalleryPhoto = {
  id: number;
  title: string;
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  credit?: string;
  category: string;
};
export function toGalleryPhoto(r: RecordItem) {
  return {
    id: r.id,
    title: r.title,
    src: r.image || "",
    album: String(r.album || ""),
    alt: String(r.alt || r.title),
    caption: String(r.caption || ""),
    location: String(r.place || ""),
    credit: String(r.credit || ""),
    date: r.date,
    category: r.category,
    placeholder: Boolean(r.placeholder),
  };
}
export function PhotoLightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const [touch, setTouch] = useState<number | null>(null);
  useDialogFocus(true);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % photos.length);
      if (e.key === "ArrowLeft")
        onChange((index + photos.length - 1) % photos.length);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [index, photos.length, onChange, onClose]);
  const p = photos[index];
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={"Fotografia: " + p.title}
      onClick={onClose}
      onTouchStart={(e) => setTouch(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch !== null) {
          const d = e.changedTouches[0].clientX - touch;
          if (Math.abs(d) > 50)
            onChange((index + (d < 0 ? 1 : photos.length - 1)) % photos.length);
          setTouch(null);
        }
      }}
    >
      <button autoFocus className="lightbox-close" onClick={onClose}>
        Fechar ×
      </button>
      <button
        aria-label="Imagem anterior"
        onClick={(e) => {
          e.stopPropagation();
          onChange((index + photos.length - 1) % photos.length);
        }}
      >
        ←
      </button>
      <figure onClick={(e) => e.stopPropagation()}>
        <EditorialImage src={p.src} alt={p.alt} loading="eager" />
        <figcaption>
          <b>{p.title}</b>
          <p>{p.caption}</p>
          <small>
            {[p.location, p.date, p.credit].filter(Boolean).join(" · ")} /{" "}
            {index + 1} de {photos.length}
          </small>
        </figcaption>
      </figure>
      <button
        aria-label="Próxima imagem"
        onClick={(e) => {
          e.stopPropagation();
          onChange((index + 1) % photos.length);
        }}
      >
        →
      </button>
    </div>
  );
}
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <div className="masonry">
        {photos.map((p, i) => (
          <button
            key={p.id}
            aria-label={"Ver fotografia: " + p.title}
            onClick={() => setIndex(i)}
          >
            <EditorialImage src={p.src} alt={p.alt} />
            <span>AMPLIAR FOTOGRAFIA ↗</span>
            <small>
              {p.title} / {p.category}
            </small>
          </button>
        ))}
      </div>
      {!photos.length && <p>Nenhuma fotografia publicada nesta categoria.</p>}
      {index !== null && (
        <PhotoLightbox
          photos={photos}
          index={index}
          onChange={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
