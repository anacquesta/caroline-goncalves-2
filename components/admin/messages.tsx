"use client";
import { readResult } from "@/lib/cms/result";

import { useEffect, useState } from "react";
type Message = {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  created_at: string;
};
export function Messages() {
  const [items, setItems] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/messages")
      .then(async (r) => {
        const result = await readResult(r);
        if (!r.ok) throw new Error(result.error);
        setItems(result.messages);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section>
      <h1>Mensagens</h1>
      {loading && <p role="status">Carregando…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !items.length && <p>Nenhuma mensagem recebida.</p>}
      {items.map((m) => (
        <article className="admin-panel" key={m.id}>
          <small>
            {new Date(m.created_at).toLocaleString("pt-BR")} / {m.subject}
          </small>
          <h2>{m.name}</h2>
          <a href={"mailto:" + m.email}>{m.email} ↗</a>
          <p>{m.company}</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
        </article>
      ))}
    </section>
  );
}
