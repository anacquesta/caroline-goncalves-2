"use client";
import { EditorialImage } from "./image";
import Link from "next/link";
import { useSettings } from "@/data/settings";
import { portrait } from "@/data/content";
export function Cover() {
  const settings = useSettings();
  return (
    <section className="editorial-cover" aria-labelledby="cover-title">
      <div className="cover-meta">
        <span>PORTFÓLIO / EDIÇÃO 01</span>
        <span>BRASÍLIA — BR · 2026</span>
      </div>
      <div className="cover-grid">
        <div className="cover-copy">
          <span className="cover-kicker">
            {settings["Página inicialAssinatura"] ||
              "JORNALISTA. COMUNICADORA. UM OLHAR CURIOSO."}
          </span>
          <h1 id="cover-title">
            Carol
            <br />
            <em>Gonzaga</em>
            <span className="cover-period">.</span>
          </h1>
          <p className="cover-deck">
            {settings["Página inicialManifesto"] || (
              <>
                Histórias, pessoas
                <br />e outras perspectivas.
              </>
            )}
          </p>
          <div className="cover-intro">
            <span>01 / APRESENTAÇÃO</span>
            <p>
              {settings["Página inicialTexto de abertura"] ||
                "Sou Caroline Gonçalves. Entre a reportagem, a comunicação e a fotografia, meu trabalho começa com uma boa escuta."}
            </p>
          </div>
          <div className="cover-links">
            <Link href="/trabalhos">
              Conheça meu trabalho <span>↗</span>
            </Link>
            <Link href="/contato">
              Vamos conversar <span>→</span>
            </Link>
          </div>
        </div>
        <figure className="cover-portrait">
          <div className="cover-photo-label">EM CAMPO / CAROL GONZAGA</div>
          <picture>
            <source
              type="image/avif"
              srcSet="/images/caroline-principal-480.avif 480w, /images/caroline-principal-960.avif 960w, /images/caroline-principal-1600.avif 1600w"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
            <EditorialImage
              src={portrait}
              alt="Carol Gonzaga sorrindo enquanto fotografa com uma câmera Canon"
              fetchPriority="high"
              loading="eager"
            />
          </picture>
          <figcaption>
            <span>JORNALISMO · COMUNICAÇÃO · FOTOGRAFIA</span>
            <span>15°47′S / 47°52′W</span>
          </figcaption>
        </figure>
      </div>
      <div className="cover-index">
        <span>
          TRÊS LINGUAGENS.
          <br />A MESMA CURIOSIDADE.
        </span>
        {[
          ["01", "Jornalismo", "/jornalismo"],
          ["02", "Comunicação", "/comunicacao"],
          ["03", "Fotografia", "/fotografia"],
        ].map(([n, t, u]) => (
          <Link key={u} href={u}>
            <small>{n}</small>
            <b>{t}</b>
            <span>↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
