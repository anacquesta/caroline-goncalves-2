"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ReferenceSections } from "./editorial/reference-sections";
import { Cover } from "./editorial/cover";
import { Scheduling, Privacy } from "./editorial/contact";
import { SettingsContext } from "@/data/settings";
import { ContentContext } from "@/data/provider";
import { seed, type Store } from "@/lib/cms/seed";
import {
  Footer,
  About,
  PerspectivePage,
  ProjectsPage,
  ProjectDetail,
  Photography,
  Album,
  Blog,
  Article,
  Testimonials,
  Contact,
  Missing,
} from "./editorial/pages";
const Admin = dynamic(() =>
  import("./admin/access").then((m) => m.AdminAccess),
);
const navigation = [
  ["Início", "/"],
  ["Perfil", "/sobre"],
  ["Trabalhos", "/trabalhos"],
  ["Fotografia", "/fotografia"],
  ["Textos", "/blog"],
  ["Depoimentos", "/depoimentos"],
  ["Contato", "/contato"],
];
export function SiteShell({
  store = seed,
  settings = {},
}: {
  store?: Store;
  settings?: Record<string, string>;
}) {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", close);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".section").forEach((el) => observer.observe(el));
    return () => {
      removeEventListener("keydown", close);
      observer.disconnect();
    };
  }, [path]);
  const [section, slug] = path.slice(1).split("/");
  if (section === "admin") {
    if (process.env.NEXT_PUBLIC_STATIC_SITE === "true") return <main className="page-heading"><Link href="/">← VOLTAR AO PORTFÓLIO</Link><h1>Publicação de conteúdo.</h1><p>Esta versão é hospedada no GitHub Pages. O conteúdo pode ser atualizado pelo repositório; o painel online exige uma hospedagem com servidor.</p></main>;
    return <Admin />;
  }
  let content;
  if (!section)
    content = (
      <>
        <Cover />
        <ReferenceSections />
      </>
    );
  else if (section === "sobre") content = <About />;
  else if (section === "jornalismo" || section === "comunicacao")
    content = <PerspectivePage index={section === "jornalismo" ? 0 : 1} />;
  else if (section === "projetos" || section === "trabalhos")
    content = slug ? <ProjectDetail slug={slug} /> : <ProjectsPage />;
  else if (section === "fotografia")
    content = slug ? <Album slug={slug} /> : <Photography />;
  else if (section === "blog")
    content = slug ? <Article slug={slug} /> : <Blog />;
  else if (section === "depoimentos") content = <Testimonials />;
  else if (section === "agendamento") content = <Scheduling />;
  else if (section === "privacidade" || section === "cookies")
    content = <Privacy />;
  else if (section === "contato") content = <Contact />;
  else content = <Missing />;
  return (
    <SettingsContext.Provider value={settings}>
      <ContentContext.Provider value={store}>
        <>
          <a className="skip" href="#main">
            Ir para o conteúdo
          </a>
          <header className="folio-header"><Link href="/" className="folio-brand" aria-label="Caroline Gonçalves — início">CG<span>.</span></Link><nav aria-label="Menu do portfólio">{[["Perfil","/sobre"],["Fotografia","/fotografia"],["Textos","/blog"],["Trabalhos","/trabalhos"]].map(([label,href]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>)}</nav><Link className="folio-header-contact" href="/contato">VAMOS CONVERSAR <span>↗</span></Link></header>
          <aside className={"sidebar " + (open ? "expanded" : "")}>
            <Link
              className="monogram"
              href="/"
              aria-label="Caroline Gonçalves — início"
            >
              C<span>.</span>
            </Link>
            <button
              className="rail-toggle"
              aria-label="Expandir navegação"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
            <nav aria-label="Navegação principal">
              {navigation.map(([label, url], i) => (
                <Link
                  className={
                    path === url || (url !== "/" && path.startsWith(url))
                      ? "active"
                      : ""
                  }
                  aria-current={path === url ? "page" : undefined}
                  key={url}
                  href={url}
                  onClick={() => setOpen(false)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{label}</b>
                </Link>
              ))}
            </nav>
            <div className="rail-social">
              <a
                href="https://www.instagram.com/carolquecomunica/"
                aria-label="Instagram"
              >
                Ig <b>Instagram ↗</b>
              </a>
              <a
                href="https://www.linkedin.com/in/comunicologacaroline/"
                aria-label="LinkedIn"
              >
                In <b>LinkedIn ↗</b>
              </a>
            </div>
            <span className="rail-bottom">© 2026</span>
          </aside>
          <header className="mobile-header">
            <Link href="/">
              C. <small>Caroline Gonçalves</small>
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Abrir menu"
            >
              {open ? "Fechar ×" : "Menu +"}
            </button>
          </header>
          {open && (
            <div className="mobile-menu">
              <nav>
                {navigation.map(([label, url], i) => (
                  <Link key={url} href={url} onClick={() => setOpen(false)}>
                    <small>0{i + 1}</small>
                    {label}
                    <span>↗</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
          <main id="main" className="public-main" key={path}>
            {section && (
              <nav
                className="editorial-breadcrumbs"
                aria-label="Caminho de navegação"
              >
                <Link href="/">Início</Link>
                <span aria-hidden="true">/</span>
                <Link href={"/" + section}>
                  {navigation.find((item) => item[1] === "/" + section)?.[0] ||
                    section}
                </Link>
                {slug && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{slug.replace(/-/g, " ")}</span>
                  </>
                )}
              </nav>
            )}
            {content}
            <Footer />
          </main>
        </>
      </ContentContext.Provider>
    </SettingsContext.Provider>
  );
}
