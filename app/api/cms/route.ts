import { NextResponse } from "next/server";
import sanitize from "sanitize-html";
import { z } from "zod";
import {
  configured,
  readStore,
  session,
  supabase,
  sameOrigin,
} from "@/lib/cms/server";
const record = z
  .object({
    id: z.number().int().positive(),
    title: z.string().min(1).max(300),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum([
      "Rascunho",
      "Publicado",
      "Pausado",
      "Agendado",
      "Arquivado",
      "Oculto",
    ]),
    category: z.string().max(100),
    date: z.string().max(30),
    body: z.string().max(200000).optional(),
    placeholder: z.boolean().optional(),
    canonical: z
      .string()
      .refine((v) => !v || /^https?:\/\//.test(v), "Canonical inválido")
      .optional(),
  })
  .passthrough();
const storeSchema = z.object({
  Textos: z.array(record),
  Projetos: z.array(record),
  Fotografias: z.array(record),
  Álbuns: z.array(record),
  Depoimentos: z.array(record),
});
export async function GET() {
  try {
    const token = await session();
    return NextResponse.json({ store: await readStore(token) });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Falha ao carregar",
        configured,
      },
      { status: 401 },
    );
  }
}
export async function PUT(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  try {
    const token = await session();
    const text = await request.text();
    if (text.length > 2_000_000)
      return NextResponse.json(
        { error: "Envie as imagens pelo upload antes de salvar." },
        { status: 413 },
      );
    const store = storeSchema.parse(JSON.parse(text));
    for (const [section, records] of Object.entries(store)) {
      const slugs = new Set<string>();
      for (const r of records) {
        if (
          section === "Textos" &&
          ["Publicado", "Agendado"].includes(r.status) &&
          (!r.body || r.body.replace(/<[^>]*>/g, "").trim().length < 10)
        )
          throw new Error("Escreva o conteúdo do artigo antes de publicar.");
        r.updatedAt = new Date().toISOString();
        r.createdAt = r.createdAt || r.updatedAt;
        if (slugs.has(r.slug))
          throw new Error("Cada registro precisa de um slug único.");
        slugs.add(r.slug);
        if (
          r.status === "Agendado" &&
          (!r.scheduledAt ||
            !Number.isFinite(Date.parse(String(r.scheduledAt))))
        )
          throw new Error("Informe data e horário do agendamento.");
        if (typeof r.body === "string")
          r.body = sanitize(r.body, {
            allowedTags: [
              ...sanitize.defaults.allowedTags,
              "img",
              "figure",
              "figcaption",
              "h1",
              "h2",
              "h3",
              "h4",
              "iframe",
              "div",
            ],
            allowedAttributes: {
              ...sanitize.defaults.allowedAttributes,
              img: [
                "src",
                "alt",
                "width",
                "height",
                "data-alignment",
                "data-caption",
                "data-credit",
                "srcset",
                "sizes",
              ],
              a: ["href", "target", "rel"],
              p: ["style"],
              h1: ["style"],
              h2: ["style"],
              h3: ["style"],
              h4: ["style"],
              iframe: ["src", "width", "height", "allowfullscreen"],
              div: ["data-youtube-video"],
            },
            allowedSchemes: ["http", "https", "mailto"],
            allowedIframeHostnames: ["www.youtube-nocookie.com"],
            allowedStyles: {
              "*": { "text-align": [/^left$/, /^center$/, /^right$/] },
            },
            transformTags: {
              img: (tagName, attribs) => {
                const src = attribs.src || "";
                if (/\/editorial\/[a-f0-9-]+-1600\.webp$/.test(src)) {
                  const base = src.replace("-1600.webp", "");
                  attribs.srcset = [480, 960, 1600]
                    .map((w) => `${base}-${w}.webp ${w}w`)
                    .join(", ");
                  attribs.sizes = "(max-width: 767px) 100vw, 760px";
                }
                return { tagName, attribs };
              },
              a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
            },
          });
      }
    }
    await supabase(
      "/rest/v1/rpc/replace_content",
      { method: "POST", body: JSON.stringify({ document: store }) },
      token,
    );
    return NextResponse.json({ saved: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? "Confira título, slug e status de cada registro."
            : e instanceof Error
              ? e.message
              : "Falha ao salvar.",
      },
      { status: 400 },
    );
  }
}
