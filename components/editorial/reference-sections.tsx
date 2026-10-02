"use client";
import Link from "next/link";
import { EditorialImage } from "./image";
import { homeProfilePortrait, profilePortrait } from "@/data/content";
import { useSettings } from "@/data/settings";
import { useCollection } from "@/data/provider";
import { usePosts } from "@/data/use-posts";
import { contactLinks } from "@/data/links";
function Meta({ number, label }: { number: string; label: string }) {
  return <div className="folio-meta"><span>CAROLINE GONÇALVES</span><span>{label}</span><span>PORTFÓLIO / {number}</span></div>;
}
export function ReferenceSections() {
  const settings = useSettings();
  const posts = usePosts().filter(p => !p.placeholder);
  const photos = useCollection("Fotografias").filter(p => !p.placeholder);
  const whatsapp = contactLinks(settings).find(([name]) => name === "WhatsApp")?.[1];
  return <div className="folio-sections">
    <section className="folio-panel" id="perfil" aria-labelledby="profile-title">
      <Meta number="02" label="POR TRÁS DAS HISTÓRIAS" />
      <div className="folio-about-grid">
        <div className="folio-about-copy"><span className="folio-label">01 / SOBRE MIM</span><h2 id="profile-title">BOA ESCUTA.<br />UM NOVO<br />OLHAR<span>.</span></h2><div className="folio-rule-copy"><h3>Prazer, Caroline.</h3><p>{settings["PerfilApresentação"] || "Sou jornalista e pós-graduada em Marketing Estratégico Digital. Meu trabalho acontece entre as palavras e as imagens: na reportagem, na comunicação e na fotografia."}</p></div><div className="folio-rule-copy"><h3>O que me move</h3><p>Observar com atenção, fazer boas perguntas e encontrar o que torna cada história única. De Brasília, compartilho pessoas, ideias e outras perspectivas.</p></div><Link className="folio-link" href="/sobre">CONHEÇA MINHA TRAJETÓRIA <span>↗</span></Link></div>
        <figure className="folio-about-photo"><EditorialImage src={homeProfilePortrait} alt="Retrato em preto e branco de Caroline Gonçalves, de óculos e cabelos cacheados" /><figcaption>CAROLINE GONÇALVES / BRASÍLIA, DF</figcaption></figure>
        <nav className="folio-index" aria-label="Índice do portfólio"><span className="folio-label">ÍNDICE / EXPLORE</span><h3>MEU<br />UNIVERSO</h3>{[["01","Perfil","/sobre"],["02","Fotografia","/fotografia"],["03","Textos & ideias","/blog"],["04","Trabalhos","/trabalhos"],["05","Vamos conversar","/contato"]].map(([n,label,href]) => <Link key={href} href={href}><span>{label}</span><small>{n}</small><b>↗</b></Link>)}<span className="folio-index-bottom">DIFERENTES LINGUAGENS.<br />A MESMA CURIOSIDADE.</span></nav>
      </div>
    </section>
    <section className="folio-panel" id="fotografia" aria-labelledby="photo-title">
      <Meta number="03" label="UM ARQUIVO DE OLHARES" />
      <div className="folio-section-title"><h2 id="photo-title">FOTOGRAFIA<span>.</span></h2><p>Pessoas, encontros e os detalhes<br />que contam uma história.</p><Link className="folio-link" href="/fotografia">EXPLORAR FOTOGRAFIAS <span>↗</span></Link></div>
      {photos.length ? <div className="folio-photo-grid">{photos.slice(0,3).map(p => <Link href={p.album ? `/fotografia/${p.album}` : '/fotografia'} key={p.id}><EditorialImage src={p.image} alt={String(p.alt || p.title)} /><span>{p.title} ↗</span></Link>)}</div> : <div className="folio-photo-feature"><figure><EditorialImage src={profilePortrait} alt="Caroline Gonçalves atrás da câmera, fotografando" /><figcaption>O OLHAR POR TRÁS DA CÂMERA / RETRATO FORNECIDO</figcaption></figure><div><span className="folio-label">ENTRE UM INSTANTE E UMA HISTÓRIA</span><h3>O MUNDO<br />PEDE UM<br />OLHAR ATENTO.</h3><p>A fotografia faz parte da minha experiência em comunicação e cobertura de eventos. Aqui, esse olhar ganha um espaço próprio.</p><p className="folio-coming">Novos ensaios e registros serão publicados em breve.</p><Link className="folio-link" href="/fotografia">VISITE O ARQUIVO <span>↗</span></Link></div></div>}
    </section>
    <section className="folio-panel" id="textos" aria-labelledby="writing-title">
      <Meta number="04" label="PALAVRAS COM PERSPECTIVA" />
      <div className="folio-writing-grid"><div><span className="folio-label">03 / BLOG</span><h2 id="writing-title">TEXTOS<br />& IDEIAS<span>.</span></h2><p>Um espaço para escrever com tempo.<br />E para conversar além da manchete.</p><Link className="folio-link" href="/blog">ABRIR O BLOG <span>↗</span></Link></div><div className="folio-writing-list">{posts.length ? posts.slice(0,3).map((p,i) => <Link href={`/blog/${p.slug}`} key={p.slug}><small>0{i+1} / {p.category}</small><h3>{p.title}</h3><p>{p.excerpt}</p><span>LER TEXTO ↗</span></Link>) : <><div className="folio-writing-empty"><span className="folio-label">AS PRIMEIRAS HISTÓRIAS ESTÃO A CAMINHO</span><h3>Há muito para observar.<br />E ainda mais para contar.</h3><p>Artigos, reflexões e bastidores do meu olhar sobre a comunicação. Os primeiros textos serão publicados em breve.</p></div><div className="folio-topics"><span>JORNALISMO</span><span>COMUNICAÇÃO</span><span>FOTOGRAFIA</span></div><a className="folio-link" href="https://linktr.ee/caroline.goncalves" target="_blank" rel="noopener noreferrer">OUTRAS PUBLICAÇÕES <span>↗</span></a></>}</div></div>
    </section>
    <section className="folio-panel" aria-labelledby="journey-title"><Meta number="05" label="EXPERIÊNCIA & FORMAÇÃO" /><div className="folio-section-title"><h2 id="journey-title">TRAJETÓRIA<span>.</span></h2><p>Jornalismo como base.<br />Comunicação como caminho.</p><Link className="folio-link" href="/sobre">VER PERFIL COMPLETO <span>↗</span></Link></div><div className="folio-timeline">{[["2016–2019","Os primeiros passos","Experiência em assessoria de comunicação na Embratur, no ITI e na Telebras, além de jornalismo e monitoramento de mídia."],["2020–2025","Comunicação em movimento","Atuação autônoma com produção de conteúdo, revisão textual, redes sociais, fotografia, áudio e vídeo."],["2021–2022","Estratégia digital","MBA em Marketing Estratégico Digital pela Descomplica, ampliando a formação em Jornalismo."],["DESDE 2025*","Reportagem nas redes","Repórter de Redes Sociais no Metrópoles, conforme o perfil profissional enviado."]].map(([date,title,body]) => <article key={date}><span className="folio-label">{date}</span><div className="folio-timeline-dot" /><h3>{title}</h3><p>{body}</p></article>)}</div><small className="folio-source">*Informações de trajetória baseadas no perfil profissional fornecido.</small></section>
    <section className="folio-panel folio-contact" id="contato" aria-labelledby="contact-title"><Meta number="06" label="A PRÓXIMA HISTÓRIA" /><span className="folio-label">PAUTAS, PROJETOS & ENCONTROS</span><h2 id="contact-title">VAMOS<br />CONVERSAR<span>?</span></h2><p>Uma boa história começa com uma conversa.</p><div className="folio-contact-actions"><a className="folio-button" href={whatsapp} target="_blank" rel="noopener noreferrer">FALAR NO WHATSAPP <span>↗</span></a><Link className="folio-link" href="/agendamento">AGENDAR UMA CONVERSA <span>↗</span></Link></div><a className="folio-email" href="mailto:jornalistacarolinegoncalves@gmail.com">jornalistacarolinegoncalves@gmail.com</a></section>
  </div>;
}
