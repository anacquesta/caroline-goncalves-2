"use client";
import { useCollection } from "./provider";
import { posts } from "./content";
export type PublicPost = (typeof posts)[number] & {
  body?: string;
  placeholder?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  credit?: string;
};
export function usePosts(): PublicPost[] {
  return useCollection("Textos").map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.date.includes("-") ? r.date.split("-").reverse().join(".") : r.date,
    minutes: Number(r.minutes) || 4,
    image: r.image || "/images/editorial.jpg",
    excerpt: String(r.subtitle || r.excerpt || ""),
    body: r.body,
    credit: String(r.coverCredit || ""),
    placeholder: Boolean(r.placeholder),
    seoTitle: String(r.seoTitle || ""),
    seoDescription: String(r.seoDescription || ""),
  }));
}
