"use client";
import { Gallery, toGalleryPhoto } from "./gallery";
import { EditorialImage } from "./image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  profilePortrait,
  homeProfilePortrait,
  perspectives,
} from "@/data/content";
import { useSettings } from "@/data/settings";
import { contactLinks } from "@/data/links";
import { ContactForm } from "./contact";
import { useCollection } from "@/data/provider";
import { usePosts } from "@/data/use-posts";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
export function ProjectRows({
  filter,
  featured,
}: {
  filter?: string;
  featured?: string;
}) {
  const projects = useCollection("Projetos");
  const [list, setList] = useState(0);
  const filtered = filter
    ? projects.filter((p) => p.category === filter)
    : projects;
  const items = featured
    ? [...filtered].sort(
        (a, b) => Number(b.slug === featured) - Number(a.slug === featured),
      )
    : filtered;
  if (!items.length)
    return <p>Trabalhos selecionados serão publicados em breve.</p>;
  return (
    <div className="project-list" onMouseLeave={() => setList(0)}>
      <h2 className="sr-only">Projetos selecionados</h2>
      <div className="project-preview">
        <EditorialImage src={items[list]?.image} alt={items[list]?.title} />
        <span>EM PAUTA / {String(list + 1).padStart(2, "0")}</span>
      </div>
      <div>
        {items.map((p, i) => (
          <Link
            key={p.slug}
            className="project-row"
            href={"/projetos/" + p.slug}
            onMouseEnter={() => setList(i)}
            onFocus={() => setList(i)}
          >
            <small>0{i + 1}</small>
            <div>
              <h3>{p.title}</h3>
              <span>
                {p.category.toUpperCase()} · {String(p.year || "")}
              </span>
            </div>
            <b>↗</b>
            <EditorialImage src={p.image} alt="" />
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Footer() {
  const settings = useSettings();
  return (
    <footer className="site-footer">
      <Link href="/" className="footer-brand">
        {settings["ConfiguraçõesNome do site"] || (
          <>
            Carol <em>Gonzaga.</em>
          </>
        )}
      </Link>
      <p>
        Jornalismo · Comunicação · Fotografia
        <br />
        <span>Brasília, Brasil · © 2026</span>
      </p>
      <Link href="/privacidade">Privacidade</Link>
      <Link href="/admin">Painel privado ↗</Link>
    </footer>
  );
}
export function ContactEnd() {
  const settings = useSettings();
  return (
    <section className="contact-end">
      <span className="eyebrow">A PRÓXIMA PERSPECTIVA PODE SER A SUA.</span>
      <div>
        <h2>
          Tem uma
          <br />
          <em>história</em>
          <br />
          para contar?
        </h2>
        <aside>
          <p>Vamos conversar.</p>
          {contactLinks(settings).map(([n, url]) => (
            <a key={n} href={url}>
              {n} <span>↗</span>
            </a>
          ))}
          <Link href="/agendamento">
            Agendar conversa <span>↗</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}
export function HomeSections() {
  const settings = useSettings();
  const posts = usePosts();
  const archive = useCollection("Fotografias").map(toGalleryPhoto);
  const featured = useCollection("Depoimentos").filter((r) => r.featured);
  return (
    <>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">PROJETOS SELECIONADOS / 01 — 04</span>
          <Link className="text-link" href="/projetos">
            VER ARQUIVO <span>→</span>
          </Link>
        </div>
        <ProjectRows featured={settings["Página inicialProjeto em destaque"]} />
      </section>
      {posts[0] && (
        <section className="latest section">
          <div>
            <span className="eyebrow">
              {posts[0].placeholder
                ? "ARTIGO DE EXEMPLO / CONTEÚDO TEMPORÁRIO"
                : "ÚLTIMO ESCRITO / " + posts[0].date}
            </span>
            <h2>{posts[0].title}</h2>
            <p>{posts[0].excerpt}</p>
            <span className="eyebrow">
              {posts[0].category} · {posts[0].minutes} MIN DE LEITURA
            </span>
            <Link className="text-link" href={"/blog/" + posts[0].slug}>
              LER TEXTO <span>→</span>
            </Link>
          </div>
          <EditorialImage
            src={posts[0].image}
            alt="Caderno aberto com escrita e observações"
          />
        </section>
      )}
      <section className="photo-preview section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / UM ARQUIVO DE OLHARES</span>
            <h2>
              O que fica
              <br />
              <em>quando a gente olha.</em>
            </h2>
          </div>
          <Link className="text-link" href="/fotografia">
            VER ARQUIVO FOTOGRÁFICO <span>→</span>
          </Link>
        </div>
        <div className="photo-strip">
          {archive.slice(0, 4).map((p) => (
            <Link key={p.id} href="/fotografia">
              <EditorialImage src={p.src} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>
      {featured[0] && (
        <section className="home-quote section">
          <span className="eyebrow">NAS PALAVRAS DE QUEM CAMINHA JUNTO</span>
          <blockquote>{String(featured[0].description || "")}</blockquote>
          <p>
            {featured[0].title} / {String(featured[0].company || "")}
          </p>
          <Link className="text-link" href="/depoimentos">
            VER TODOS OS RELATOS →
          </Link>
        </section>
      )}
      <section className="profile-preview section">
        <EditorialImage
          src={homeProfilePortrait}
          alt="Caroline Gonçalves em retrato preto e branco com celular"
        />
        <div>
          <span className="eyebrow">PERFIL / CAROLINE GONÇALVES</span>
          <h2>
            Jornalismo como ponto de partida.
            <br />
            <em>Comunicação como estratégia.</em>
            <br />
            Imagem como linguagem.
          </h2>
          <p>
            Jornalista e comunicadora com experiência em produção editorial,
            comunicação institucional, marketing digital, entrevistas, cobertura
            de eventos e fotografia.
          </p>
          <Link className="text-link" href="/sobre">
            CONHEÇA MINHA TRAJETÓRIA <span>→</span>
          </Link>
        </div>
      </section>
      <ContactEnd />
    </>
  );
}
function PageHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
export function About() {
  const settings = useSettings();
  return (
    <>
      <PageHeading
        label="PERFIL / 01"
        title="Comunicação começa pela forma como observamos o mundo."
      />
      <section className="about-intro section">
        <EditorialImage
          src={profilePortrait}
          alt="Caroline Gonçalves fotografando com sua câmera"
        />
        <div>
          <span className="eyebrow">
            {(
              "SOBRE " + (settings["PerfilNome"] || "Caroline Gonçalves")
            ).toUpperCase()}
          </span>
          <h2>
            Curiosidade como
            <br />
            <em>ponto de partida.</em>
          </h2>
          <p>
            {settings["PerfilApresentação"] ||
              "Sou Caroline Gonçalves, jornalista e pós-graduada em Marketing Estratégico Digital. Meu trabalho passa pelas palavras, pela estratégia e pelas imagens — linguagens que se encontram na vontade de compreender e contar histórias."}
          </p>
          <p>Atualmente, sou Repórter de Redes Sociais no Metrópoles.</p>
          <p>
            Da entrevista à cobertura de eventos, da produção e edição de textos
            ao conteúdo digital, acredito na comunicação que começa com uma boa
            escuta.
          </p>
          <p>
            {settings["PerfilTrajetória"] ||
              "Minha experiência reúne assessoria de imprensa e comunicação, clipping, monitoramento de mídia, social media, SEO e fotografia."}
          </p>
        </div>
      </section>
      <section className="section">
        <span className="eyebrow">TRAJETÓRIA / UMA NARRATIVA EM MOVIMENTO</span>
        <p className="demo-caption">
          Experiências fornecidas no briefing. Períodos ainda a confirmar.
        </p>
        <div className="timeline">
          {[
            ["ATUAL", "Metrópoles", "Repórter de Redes Sociais."],
            [
              "TRAJETÓRIA",
              "Comunicação e imprensa",
              "Experiências com Casa de Ismael, Telebras, Embratur e Instituto Nacional de Tecnologia da Informação.",
            ],
            [
              "ATUAÇÃO",
              "Comunicação independente",
              "Conteúdo, planejamento editorial, comunicação estratégica e fotografia.",
            ],
          ].map(([y, t, d]) => (
            <article key={y}>
              <span>{y}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="formation section">
        <span className="eyebrow">FORMAÇÃO</span>
        <h2>Comunicação Social — Jornalismo</h2>
        <h2>
          <em>MBA — Marketing Estratégico Digital</em>
        </h2>
        <p>
          {settings["PerfilFormação"] ||
            "Estudos de inglês e formação em língua espanhola."}
        </p>
        <p className="demo-caption">
          Experiências com Metrópoles, Casa de Ismael, Evolução Auditoria e
          Planejamento Tributário, Data HUB, Let’s Go Marketing Estratégico,
          Smart Idiomas, Linear Comunicação, Telebras, Voe News, Anhanguera
          Educacional, Instituto Nacional de Tecnologia da Informação e
          Embratur, além de comunicação independente.
        </p>
      </section>
      <ContactEnd />
    </>
  );
}
export function PerspectivePage({ index }: { index: number }) {
  const p = perspectives[index];
  return (
    <>
      <PageHeading
        label={"0" + (index + 1) + " / " + p.name.toUpperCase()}
        title={
          index === 0
            ? "Histórias começam com boas perguntas."
            : "Informação ganha força quando encontra a estratégia certa."
        }
        description={
          index === 0
            ? "Escutar, investigar e dar contexto. O jornalismo como caminho para aproximar pessoas e ampliar perspectivas."
            : "Uma comunicação relevante nasce do encontro entre propósito, planejamento e atenção às pessoas."
        }
      />
      <section className="section area-section">
        <span className="eyebrow">ÁREAS DE ATUAÇÃO</span>
        <div>
          {p.areas.map((a, i) => (
            <span key={a}>
              <small>0{i + 1}</small>
              {a}
            </span>
          ))}
        </div>
      </section>
      <section className="section">
        <span className="eyebrow">PERSPECTIVAS NA PRÁTICA</span>
        <ProjectRows filter={p.name} />
      </section>
      <section className="statement section">
        <h2>
          {index === 0
            ? "Uma boa história não começa pela resposta."
            : "Estratégia é encontrar a melhor forma de fazer sentido."}
        </h2>
        <p>
          {index === 0
            ? "Começa com disponibilidade para olhar de novo, perguntar melhor e compreender o contexto."
            : "Planejamento, conteúdo e presença digital conectados por uma mesma narrativa. Cada projeto começa pela escuta e se desenvolve com intenção."}
        </p>
      </section>
      <ContactEnd />
    </>
  );
}
export function ProjectsPage() {
  const projects = useCollection("Projetos");
  return (
    <>
      <PageHeading
        label="ARQUIVO / PROJETOS"
        title="Histórias que ganharam forma."
        description="Jornalismo, comunicação e imagem em projetos que se encontram na mesma vontade de contar."
      />
      <section className="section">
        {projects.some((p) => p.placeholder) && (
          <p className="demo-caption">
            Projetos conceituais demonstrativos para apresentação do portfólio.
          </p>
        )}
        <ProjectRows />
      </section>
      <ContactEnd />
    </>
  );
}
export function ProjectDetail({ slug }: { slug: string }) {
  const projects = useCollection("Projetos");
  const p = projects.find((p) => p.slug === slug);
  if (!p) return <Missing />;
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return (
    <>
      <PageHeading
        label={
          p.category.toUpperCase() + (p.year ? " / " + String(p.year) : "")
        }
        title={p.title}
        description={String(p.description || "")}
      />
      <figure className="wide-cover">
        <EditorialImage src={p.image} alt={p.title} />
        <figcaption>
          {p.placeholder
            ? "Imagem ilustrativa / projeto demonstrativo"
            : "Imagem do projeto"}
        </figcaption>
      </figure>
      <section className="project-story section">
        <aside>
          <span className="eyebrow">FICHA DO PROJETO</span>
          <p>{String(p.client || "")}</p>
          <span className="eyebrow">PARTICIPAÇÃO</span>
          <p>{String(p.participation || "[PARTICIPAÇÃO A DEFINIR]")}</p>
          <span className="eyebrow">ANO / {String(p.year || "")}</span>
        </aside>
        <article>
          <h2>Sobre o projeto</h2>
          <p>{String(p.description || "")}</p>
          {["context", "contribution", "deliveries", "skills"]
            .filter((k) => p[k])
            .map((k) => (
              <section key={k}>
                <h2>
                  {
                    {
                      context: "Contexto",
                      contribution: "Atuação",
                      deliveries: "Entregas",
                      skills: "Competências",
                    }[k]
                  }
                </h2>
                <p>{String(p[k])}</p>
              </section>
            ))}
          {p.body && <div dangerouslySetInnerHTML={{ __html: p.body }} />}
        </article>
      </section>
      <section className="section next-story">
        <span className="eyebrow">PRÓXIMO PROJETO</span>
        <Link href={"/projetos/" + next.slug}>
          {next.title} <span>→</span>
        </Link>
      </section>
    </>
  );
}
export function Photography() {
  const photos = useCollection("Fotografias").map(toGalleryPhoto);
  const albums = useCollection("Álbuns").map((r) => ({
    ...r,
    name: r.title,
    place: String(r.place || ""),
    year: String(r.year || ""),
    description: String(r.description || ""),
  }));
  const [filter, setFilter] = useState("Todos");
  return (
    <>
      <PageHeading
        label="03 / FOTOGRAFIA"
        title="Algumas histórias não precisam de palavras."
        description="Um arquivo de presenças, encontros e lugares. O mundo observado com tempo e sensibilidade."
      />
      {photos.some((p) => p.placeholder) && (
        <p className="editorial-notice">
          Acervo ilustrativo / imagens de referência. As fotografias de autoria
          de Carol serão publicadas após seleção.
        </p>
      )}
      <section className="section photography-section">
        <div className="filter-tabs" aria-label="Filtrar fotografias">
          {[
            "Todos",
            "Eventos",
            "Retratos",
            "Editorial",
            "Cultura",
            "Projetos autorais",
          ].map((f) => (
            <button
              className={filter === f ? "selected" : ""}
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
        <Gallery
          photos={photos.filter(
            (p) => filter === "Todos" || p.category === filter,
          )}
        />
        <div className="album-index">
          <span className="eyebrow">ENSAIOS / 01 — 03</span>
          {albums.map((a) => (
            <Link key={a.slug} href={"/fotografia/" + a.slug}>
              {a.name}
              <small>
                {String(a.year || "")} / {a.place}
              </small>
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
export function Album({ slug }: { slug: string }) {
  const albums = useCollection("Álbuns").map((r) => ({
    ...r,
    name: r.title,
    place: String(r.place || ""),
    year: String(r.year || ""),
    description: String(r.description || ""),
  }));
  const photos = useCollection("Fotografias").map(toGalleryPhoto);
  const a = albums.find((a) => a.slug === slug);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [touch, setTouch] = useState<number | null>(null);
  useDialogFocus(lightbox !== null);
  const list = photos.filter((p) => p.album === slug);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox((v) => (v === null ? null : (v + 1) % list.length));
      if (e.key === "ArrowLeft")
        setLightbox((v) =>
          v === null ? null : (v + list.length - 1) % list.length,
        );
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [list.length]);
  if (!a) return <Missing />;
  if (!list.length)
    return (
      <>
        <PageHeading label="ENSAIO" title={a.name} />
        <p className="section">Este ensaio ainda não tem imagens publicadas.</p>
      </>
    );
  return (
    <>
      <PageHeading
        label={"ENSAIO / " + a.year + " / " + a.place}
        title={a.name}
        description={String(a.description || "")}
      />
      <section className="section album-gallery">
        {list.map((p, i) => (
          <figure key={p.id}>
            <button
              onClick={() => setLightbox(i)}
              aria-label={"Ver imagem: " + p.title}
            >
              <EditorialImage src={p.src} alt={p.title} />
            </button>
            <figcaption>
              {String(i + 1).padStart(2, "0")} / {p.title}
            </figcaption>
          </figure>
        ))}
        <Link className="text-link" href="/fotografia">
          VOLTAR AO ARQUIVO <span>→</span>
        </Link>
      </section>
      {lightbox !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar fotografia"
          onTouchStart={(e) => setTouch(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch !== null) {
              const distance = e.changedTouches[0].clientX - touch;
              if (Math.abs(distance) > 50)
                setLightbox(
                  (lightbox + (distance < 0 ? 1 : list.length - 1)) %
                    list.length,
                );
              setTouch(null);
            }
          }}
          onClick={() => setLightbox(null)}
        >
          <button
            autoFocus
            className="lightbox-close"
            onClick={() => setLightbox(null)}
          >
            Fechar ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + list.length - 1) % list.length);
            }}
            aria-label="Imagem anterior"
          >
            ←
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <EditorialImage
              src={list[lightbox].src}
              alt={list[lightbox].title}
            />
            <figcaption>
              {list[lightbox].title} / {lightbox + 1} de {list.length}
            </figcaption>
          </figure>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % list.length);
            }}
            aria-label="Próxima imagem"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
export function Blog() {
  const posts = usePosts();
  const [limit, setLimit] = useState(6);
  const [filter, setFilter] = useState("Todos");
  return (
    <>
      <PageHeading
        label="TEXTOS / CADERNO DE OBSERVAÇÕES"
        title="Ideias, histórias e o mundo ao redor."
        description="Sobre comunicação, cultura e o exercício de observar. Um espaço para pensar além da próxima publicação."
      />
      {posts.some((p) => p.placeholder) && (
        <p className="editorial-notice">
          Artigos de exemplo / placeholders. Os textos definitivos serão
          publicados por Carol.
        </p>
      )}
      <section className="section blog-feature">
        {posts[0] ? (
          <>
            <Link href={"/blog/" + posts[0].slug}>
              <EditorialImage src={posts[0].image} alt="Caderno e escrita" />
            </Link>
            <article>
              <span className="eyebrow">DESTAQUE / {posts[0].category}</span>
              <h2>
                <Link href={"/blog/" + posts[0].slug}>{posts[0].title}</Link>
              </h2>
              <p>{posts[0].excerpt}</p>
              <span className="eyebrow">
                {posts[0].date} · {posts[0].minutes} MIN
              </span>
              <Link className="text-link" href={"/blog/" + posts[0].slug}>
                LER TEXTO <span>→</span>
              </Link>
            </article>
          </>
        ) : (
          <p>A próxima história está em preparação.</p>
        )}
      </section>
      <section className="section">
        <span className="eyebrow">MAIS RECENTES</span>
        <div className="filter-tabs">
          {[
            "Todos",
            "Jornalismo",
            "Comunicação",
            "Cultura",
            "Fotografia",
            "Opinião",
          ].map((c) => (
            <button
              className={filter === c ? "selected" : ""}
              key={c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {!posts.filter((p) => filter === "Todos" || p.category === filter)
          .length && <p>Nenhum texto publicado nesta editoria.</p>}
        <div className="post-list">
          {posts
            .filter((p) => filter === "Todos" || p.category === filter)
            .slice(0, limit)
            .map((p) => (
              <Link href={"/blog/" + p.slug} key={p.slug}>
                <small>
                  {p.date}
                  <br />
                  {p.category} · {p.minutes} MIN
                </small>
                <div>
                  <h2>{p.title}</h2>
                  <p>{p.excerpt}</p>
                </div>
                <EditorialImage src={p.image} alt="" />
                <span>↗</span>
              </Link>
            ))}
        </div>
        {posts.filter((p) => filter === "Todos" || p.category === filter)
          .length > limit && (
          <button className="text-link" onClick={() => setLimit(limit + 6)}>
            CARREGAR MAIS TEXTOS →
          </button>
        )}
      </section>
    </>
  );
}
export function Article({ slug }: { slug: string }) {
  const posts = usePosts();
  const p = posts.find((p) => p.slug === slug);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () =>
      setProgress(
        (window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          )) *
          100,
      );
    update();
    addEventListener("scroll", update);
    return () => removeEventListener("scroll", update);
  }, []);
  if (!p) return <Missing />;
  const i = posts.indexOf(p);
  return (
    <>
      <div className="reading-progress" style={{ width: progress + "%" }} />
      {p.placeholder && (
        <p className="editorial-notice">
          EXEMPLO / PLACEHOLDER — este conteúdo temporário não é um artigo de
          autoria de Carol.
        </p>
      )}
      <header className="article-header">
        <Link className="eyebrow" href="/blog">
          TEXTOS / {p.category.toUpperCase()}
        </Link>
        <h1>{p.title}</h1>
        <p>{p.excerpt}</p>
        <div>
          Por Carol Gonzaga{" "}
          <span>
            {p.date} / {p.minutes} min de leitura
          </span>
        </div>
      </header>
      <figure className="wide-cover">
        <EditorialImage src={p.image} alt={p.title} />
        <figcaption>
          {p.placeholder
            ? "Fotografia ilustrativa / Unsplash"
            : p.credit || "Imagem de capa"}
        </figcaption>
      </figure>
      {p.body ? (
        <article
          className="reading-body"
          dangerouslySetInnerHTML={{ __html: p.body }}
        />
      ) : (
        <article className="reading-body">
          <p>O conteúdo deste artigo está em preparação.</p>
        </article>
      )}
      <section className="article-pagination section">
        <Link
          href={"/blog/" + posts[(i + posts.length - 1) % posts.length].slug}
        >
          <small>TEXTO ANTERIOR</small>
          {posts[(i + posts.length - 1) % posts.length].title}
        </Link>
        <Link href={"/blog/" + posts[(i + 1) % posts.length].slug}>
          <small>PRÓXIMO TEXTO</small>
          {posts[(i + 1) % posts.length].title}
        </Link>
        <Link className="text-link" href="/blog">
          MAIS TEXTOS <span>→</span>
        </Link>
      </section>
    </>
  );
}
export function Testimonials() {
  const items = useCollection("Depoimentos");
  return (
    <>
      <PageHeading
        label="DEPOIMENTOS / VOZES QUE SE ENCONTRAM"
        title="O trabalho também se conta em parceria."
        description="Perspectivas de quem compartilha caminhos, projetos e histórias."
      />
      <section className="testimonials section">
        {!items.length && (
          <p>Este espaço aguarda os depoimentos reais aprovados.</p>
        )}
        {items.map((t, i) => (
          <article key={t.id} className={i % 3 === 0 ? "big" : ""}>
            <span className="quote-mark">“</span>
            <blockquote>{String(t.description || "")}</blockquote>
            <b>{t.title}</b>
            <p>
              {String(t.role || "")}
              <br />
              {String(t.company || "")}
            </p>
          </article>
        ))}
        <p className="demo-caption">
          Os depoimentos reais serão publicados após aprovação das pessoas
          citadas.
        </p>
      </section>
    </>
  );
}
export function Contact() {
  return (
    <>
      <PageHeading
        label="CONTATO / A PRÓXIMA HISTÓRIA"
        title="Vamos conversar sobre a próxima história."
      />
      <ContactForm />
    </>
  );
}
export function Missing() {
  return (
    <section className="page-heading">
      <span className="eyebrow">404 / FORA DE PAUTA</span>
      <h1>Esta história ainda não está no arquivo.</h1>
      <Link className="text-link" href="/">
        VOLTAR AO INÍCIO <span>→</span>
      </Link>
    </section>
  );
}
