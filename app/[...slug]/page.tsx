import { SiteShell } from "@/components/site-shell";
import { publicStore, configured, supabase } from "@/lib/cms/server";
import { siteUrl, labels, structuredData } from "@/lib/cms/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ slug: string[] }> };
async function resolve(slug: string[]) {
  const store = await publicStore();
  const [section, id] = slug;
  const collection =
    section === "blog"
      ? "Textos"
      : section === "projetos" || section === "trabalhos"
        ? "Projetos"
        : section === "fotografia"
          ? "Álbuns"
          : null;
  const record =
    id && collection ? store[collection].find((r) => r.slug === id) : undefined;
  if (!labels[section] || slug.length > 2 || (id && !record)) notFound();
  return { store, record };
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (slug[0] === "admin")
    return {
      title: "Painel privado — Caroline Gonçalves",
      robots: { index: false, follow: false },
    };
  const { record } = await resolve(slug);
  const title = String(record?.seoTitle || record?.title || labels[slug[0]]);
  const description = String(
    record?.seoDescription ||
      record?.excerpt ||
      record?.description ||
      "Jornalismo, comunicação estratégica e fotografia em Brasília por Caroline Gonçalves.",
  );
  const url = siteUrl() + "/" + slug.join("/");
  return {
    title: title + " — Caroline Gonçalves",
    description,
    alternates: {
      canonical: record?.canonical ? String(record.canonical) : url,
    },
    openGraph: {
      title: String(record?.ogTitle || title),
      description: String(record?.ogDescription || description),
      url,
      type: slug[0] === "blog" && record ? "article" : "website",
      images:
        record?.socialImage || record?.image
          ? [String(record.socialImage || record.image)]
          : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: record?.placeholder ? { index: false, follow: true } : undefined,
  };
}
export default async function EditorialRoute({ params }: Params) {
  const { slug } = await params;
  if (slug[0] === "admin") {
    if (slug.length > 1) notFound();
    return <SiteShell />;
  }
  const { store, record } = await resolve(slug);
  const rows = configured
    ? await supabase<{ key: string; value: string }[]>(
        "/rest/v1/site_settings?select=key,value",
      )
    : [];
  const url = siteUrl() + "/" + slug.join("/");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: siteUrl(),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: labels[slug[0]],
                item: siteUrl() + "/" + slug[0],
              },
              ...(record
                ? [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: record.title,
                      item: url,
                    },
                  ]
                : []),
            ],
          }),
        }}
      />
      {record && slug[0] === "blog" && !record.placeholder && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredData({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: record.title,
              description: record.excerpt,
              author: {
                "@type": "Person",
                name: "Caroline Gonçalves",
                url: siteUrl() + "/sobre",
              },
              datePublished: record.date,
              dateModified: record.updatedAt || record.date,
              image: record.image,
              mainEntityOfPage: url,
            }),
          }}
        />
      )}
      {slug[0] === "fotografia" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredData({
              "@context": "https://schema.org",
              "@graph": store.Fotografias.filter(
                (r) => !r.placeholder && (!slug[1] || r.album === slug[1]),
              ).map((r) => ({
                "@type": "ImageObject",
                name: r.title,
                description: r.caption,
                contentUrl: new URL(String(r.image), siteUrl()).href,
                caption: r.caption,
                creditText: r.credit,
              })),
            }),
          }}
        />
      )}
      <SiteShell
        store={store}
        settings={Object.fromEntries(rows.map((r) => [r.key, r.value]))}
      />
    </>
  );
}
