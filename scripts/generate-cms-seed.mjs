import fs from "node:fs";
import ts from "typescript";
const content = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(fs.readFileSync("data/content.ts", "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext },
      }).outputText,
    ).toString("base64")
);
const { posts, projects, photos, albums, testimonials } = content;
const document = {
  Textos: posts.map((p, i) => ({
    id: i + 1,
    ...p,
    status: "Publicado",
    date: "2026-10-01",
    placeholder: true,
    seoTitle: p.title,
    seoDescription: p.excerpt,
    body: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><h2>Conteúdo de exemplo</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Este conteúdo é um placeholder.</p>",
  })),
  Projetos: projects.map((p, i) => ({
    id: i + 1,
    ...p,
    status: "Publicado",
    date: "2026-10-01",
    placeholder: true,
  })),
  Fotografias: photos.map((p) => ({
    id: p.id,
    title: p.title,
    slug: "foto-" + p.id,
    image: p.src,
    category: p.category,
    album: p.album,
    alt: p.title,
    status: "Publicado",
    date: "2026-10-01",
    placeholder: true,
  })),
  Álbuns: albums.map((a, i) => ({
    id: i + 1,
    ...a,
    title: a.name,
    status: "Publicado",
    image: photos[i].src,
    date: "2026-10-01",
    placeholder: true,
  })),
  Depoimentos: testimonials.map((t) => ({
    id: t.id,
    title: t.name,
    slug: "depoimento-" + t.id,
    status: "Rascunho",
    date: "2026-10-01",
    category: "Depoimento",
    description: t.text,
    role: t.role,
    company: t.company,
    featured: t.featured,
    placeholder: true,
  })),
};
fs.writeFileSync(
  "supabase/seed.sql",
  `-- SEED OPCIONAL: apenas exemplos explicitamente identificados. Não substitui conteúdo real.\n-- Execute depois de schema.sql, somente em um banco vazio.\ninsert into public.content_records(section,id,payload,position)\nselect section,(item->>'id')::bigint,item,(ordinality-1)::integer\nfrom jsonb_each($cms_seed_2026$${JSON.stringify(document)}$cms_seed_2026$::jsonb) as collections(section,items)\ncross join lateral jsonb_array_elements(items) with ordinality as records(item,ordinality)\non conflict do nothing;\n`,
);
console.log("Seed opcional gerado.");
