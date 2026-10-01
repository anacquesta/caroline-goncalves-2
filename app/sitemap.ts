import type { MetadataRoute } from "next";
import { publicStore } from "@/lib/cms/server";
import { siteUrl } from "@/lib/cms/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const store = await publicStore();
  const routes = [
    "",
    "sobre",
    "jornalismo",
    "comunicacao",
    "trabalhos",
    "fotografia",
    "blog",
    "depoimentos",
    "contato",
    "agendamento",
    "privacidade",
  ];
  for (const [section, prefix] of [
    ["Textos", "blog"],
    ["Projetos", "projetos"],
    ["Álbuns", "fotografia"],
  ])
    for (const item of store[section])
      if (!item.placeholder) routes.push(prefix + "/" + item.slug);
  return routes.map((route) => ({ url: base + "/" + route }));
}
