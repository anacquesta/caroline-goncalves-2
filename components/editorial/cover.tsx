"use client";
import Link from "next/link";
import { EditorialImage } from "./image";
import { useSettings } from "@/data/settings";
import { portrait } from "@/data/content";
export function Cover() {
  const settings = useSettings();
  return (
    <section className="folio-cover" aria-labelledby="cover-title">
      <div className="folio-meta"><span>PORTFÓLIO PROFISSIONAL</span><span>JORNALISMO & FOTOGRAFIA</span><span>BRASÍLIA, BRASIL · 2026</span></div>
      <div className="folio-title-row">
        <h1 id="cover-title">CAROLINE<br />GONÇALVES<span>.</span></h1>
        <div className="folio-intro"><span className="folio-label">PALAVRA. IMAGEM. PRESENÇA.</span><p>{settings["Página inicialManifesto"] || "Histórias que merecem ser contadas. Olhares que merecem ficar."}</p><Link href="/blog">Explore meus textos <span>↗</span></Link></div>
      </div>
      <figure className="folio-cover-photo">
        <span className="folio-photo-note">UM OLHAR CURIOSO<br />SOBRE O MUNDO.</span>
        <EditorialImage src={portrait} alt="Caroline Gonçalves sorrindo com sua câmera Canon" loading="eager" fetchPriority="high" sizes="(max-width: 767px) 100vw, 70vw" />
        <figcaption><span>01 / CAROLINE EM CAMPO</span><Link href="/fotografia">FOTOGRAFIA <span>↗</span></Link></figcaption>
      </figure>
      <div className="folio-cover-bottom"><span>JORNALISTA · COMUNICADORA · FOTÓGRAFA</span><a href="#perfil">CONHEÇA MEU UNIVERSO <span>↓</span></a></div>
    </section>
  );
}
