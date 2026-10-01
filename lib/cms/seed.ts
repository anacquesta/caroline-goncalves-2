import { posts, projects, photos, albums, testimonials } from "@/data/content";
import type { RecordItem } from "@/components/admin/text-editor";
export type Store = Record<string, RecordItem[]>;
export const seed: Store = {
  Textos: posts.map((p, i) => ({
    id: i + 1,
    ...p,
    date: "2026-10-01",
    status: "Publicado",
    placeholder: true,
    body: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae ipsum vel nisi consectetur faucibus.</p><h2>Conteúdo de exemplo</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Este artigo é um placeholder para testar a experiência de leitura.</p>",
  })),
  Projetos: projects.map((p, i) => ({
    id: i + 1,
    ...p,
    date: "2026-10-01",
    status: "Publicado",
    placeholder: true,
  })),
  Fotografias: photos.map((p) => ({
    id: p.id,
    title: p.title,
    slug: "foto-" + p.id,
    category: p.category,
    date: "2026-10-01",
    status: "Publicado",
    image: p.src,
    album: p.album,
    alt: p.title,
    placeholder: true,
  })),
  Álbuns: albums.map((a, i) => ({
    id: i + 1,
    title: a.name,
    ...a,
    slug: a.slug,
    date: "2026-10-01",
    status: "Publicado",
    image: photos[i].src,
    placeholder: true,
  })),
  Depoimentos: testimonials.map((t) => ({
    id: t.id,
    title: t.name,
    slug: "depoimento-" + t.id,
    category: "Depoimento",
    status: "Rascunho",
    date: "2026-10-01",
    role: t.role,
    company: t.company,
    description: "[CONTEÚDO A DEFINIR — depoimento real aguardando aprovação]",
    featured: t.featured,
    order: t.id,
    placeholder: true,
  })),
};
export function visible(r: RecordItem) {
  return (
    r.status === "Publicado" ||
    (r.status === "Agendado" &&
      Boolean(r.scheduledAt) &&
      new Date(String(r.scheduledAt)).getTime() <= Date.now())
  );
}
