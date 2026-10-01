"use client";
import { readResult } from "@/lib/cms/result";

import Link from "next/link";
import { useState } from "react";
import { contactLinks } from "@/data/links";
import { useSettings } from "@/data/settings";
export function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [started] = useState(() => Date.now());
  const settings = useSettings();
  return (
    <section className="section contact-layout">
      <aside>
        <p>
          Para pautas, projetos, coberturas e conversas que merecem um olhar
          atento.
        </p>
        <div className="contact-social">
          {contactLinks(settings).map(([name, href]) => (
            <a href={href} key={name}>
              {name}
              <span>↗</span>
            </a>
          ))}
        </div>
        <Link className="text-link" href="/agendamento">
          AGENDAR UMA CONVERSA <span>→</span>
        </Link>
      </aside>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setBusy(true);
          setStatus("");
          const data = Object.fromEntries(new FormData(form));
          try {
            const response = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...data, started }),
            });
            const result = await readResult(response);
            if (!response.ok) throw new Error(result.error);
            setError(false);
            setStatus(
              "Mensagem recebida. Obrigada por compartilhar sua ideia!",
            );
            form.reset();
          } catch (e) {
            setError(true);
            setStatus(
              e instanceof Error
                ? e.message
                : "Não foi possível enviar. Tente novamente.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Nome
          <input
            name="name"
            required
            minLength={2}
            maxLength={150}
            autoComplete="name"
            placeholder="Como você se chama?"
          />
        </label>
        <label>
          E-mail
          <input
            name="email"
            required
            type="email"
            maxLength={320}
            autoComplete="email"
            placeholder="seu@email.com"
          />
        </label>
        <label>
          Empresa
          <input
            name="company"
            maxLength={200}
            placeholder="Empresa ou projeto"
          />
        </label>
        <label>
          Quero falar sobre
          <select name="subject">
            {[
              "Jornalismo",
              "Conteúdo",
              "Comunicação",
              "Fotografia",
              "Projeto",
              "Outro",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Mensagem
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            placeholder="Conte um pouco sobre sua ideia."
          />
        </label>
        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <button className="ink-button" disabled={busy}>
          {busy ? "ENVIANDO…" : "ENVIAR MENSAGEM →"}
        </button>
        <small className="demo-caption full">
          Seus dados serão usados para responder à sua mensagem.{" "}
          <Link href="/privacidade">Privacidade</Link>
        </small>
        {status && (
          <p className="full" role={error ? "alert" : "status"}>
            {status}
          </p>
        )}
      </form>
    </section>
  );
}
export function Scheduling() {
  const settings = useSettings();
  const link =
    settings["ContatoLink de agendamento"] ||
    process.env.NEXT_PUBLIC_SCHEDULING_URL ||
    "";
  const valid =
    /^https:\/\/(?:[a-z0-9-]+\.)?(?:calendly\.com|cal\.com|calendar\.google\.com)\//.test(
      link,
    );
  return (
    <section className="page-heading">
      <span className="eyebrow">AGENDAMENTO / VAMOS CONVERSAR</span>
      <h1>
        Um encontro.
        <br />
        <em>Novas possibilidades.</em>
      </h1>
      <p>Vamos conversar sobre sua pauta, projeto ou ideia.</p>
      {valid ? (
        <a
          className="text-link"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          ESCOLHER UM HORÁRIO ↗
        </a>
      ) : (
        <>
          <p>
            A agenda online ainda não foi configurada. Combine um horário
            diretamente pelos canais de contato.
          </p>
          <Link className="text-link" href="/contato">
            COMBINAR UMA CONVERSA →
          </Link>
        </>
      )}
    </section>
  );
}
export function Privacy() {
  return (
    <section className="page-heading">
      <span className="eyebrow">PRIVACIDADE / COOKIES</span>
      <h1>Cuidado com os seus dados.</h1>
      <p>
        O formulário coleta nome, e-mail, empresa, assunto e mensagem para
        responder a solicitações de contato. As informações ficam no banco do
        site e são acessíveis apenas à administração autorizada.
      </p>
      <p>
        O site não utiliza cookies de publicidade. Um cookie essencial de sessão
        protege o acesso ao painel administrativo. Fotografias enviadas e
        conteúdos publicados ficam disponíveis publicamente.
      </p>
      <p>
        Para solicitar acesso, correção ou exclusão de uma mensagem, use os
        canais da página de contato. Antes da publicação definitiva, a
        responsável deverá definir a política de retenção e confirmar os dados
        de contato.
      </p>
      <Link href="/contato" className="text-link">
        CONTATO →
      </Link>
    </section>
  );
}
