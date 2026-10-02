import { SiteShell } from "@/components/site-shell";
import {
  publicStore,
  configured,
  supabase,
  readSettings,
} from "@/lib/cms/server";
import type { Metadata } from "next";
import { siteUrl, structuredData } from "@/lib/cms/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSettings();
  return {
    title:
      settings["SEOTítulo do site"] ||
      "Caroline Gonçalves — Jornalismo, comunicação e fotografia",
    description:
      settings["SEODescrição SEO"] ||
      "Caroline Gonçalves (Caroline Gonçalves), jornalista em Brasília. Reportagem, comunicação estratégica, conteúdo e fotografia.",
    openGraph: {
      images: ["/images/caroline-principal.png"],
      locale: "pt_BR",
      type: "website",
      url: siteUrl(),
      title:
        settings["SEOOpenGraph título"] ||
        "Caroline Gonçalves — Jornalismo, comunicação e fotografia",
      description:
        settings["SEOOpenGraph descrição"] ||
        "Jornalismo, comunicação e fotografia em Brasília",
    },
  };
}
export default async function Home() {
  const store = await publicStore();
  const rows = configured
    ? await supabase<{ key: string; value: string }[]>(
        "/rest/v1/site_settings?select=key,value",
      )
    : [];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData({
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": siteUrl() + "/#person",
            name: "Caroline Gonçalves",
            alternateName: "Caroline Gonçalves",
            jobTitle: "Jornalista",
            url: siteUrl(),
            address: {
              "@type": "PostalAddress",
              addressLocality: "Brasília",
              addressRegion: "DF",
              addressCountry: "BR",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Caroline Gonçalves",
            url: siteUrl(),
            inLanguage: "pt-BR",
            publisher: { "@id": siteUrl() + "/#person" },
          }),
        }}
      />
      <SiteShell
        store={store}
        settings={Object.fromEntries(rows.map((r) => [r.key, r.value]))}
      />
    </>
  );
}
