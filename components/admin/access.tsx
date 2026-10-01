"use client";
import { readResult } from "@/lib/cms/result";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Admin } from "./admin";
export function AdminAccess() {
  const [state, setState] = useState<"loading" | "login" | "authenticated">(
    "loading",
  );
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => readResult(r))
      .then((r) => {
        setConfigured(r.configured);
        setState(r.authenticated ? "authenticated" : "login");
      })
      .catch(() => {
        setError("Não foi possível conectar ao CMS.");
        setState("login");
      });
  }, []);
  if (state === "loading")
    return (
      <main className="page-heading">
        <h1>Conectando ao painel…</h1>
      </main>
    );
  if (state === "authenticated")
    return (
      <>
        <button
          className="admin-logout"
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            setState("login");
          }}
        >
          Sair da conta
        </button>
        <Admin />
      </>
    );
  return (
    <main className="login-page">
      <Link href="/">CG / VOLTAR AO SITE ↗</Link>
      <span className="eyebrow">ACESSO PRIVADO / ARQUIVO EDITORIAL</span>
      <h1>
        Seu espaço
        <br />
        <em>de publicação.</em>
      </h1>
      <p>Entre com a conta administrativa autorizada.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(e.currentTarget);
          try {
            const response = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.get("email"),
                password: form.get("password"),
              }),
            });
            const result = await readResult(response);
            if (!response.ok) throw new Error(result.error);
            setState("authenticated");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao entrar");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          E-mail
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="ink-button" disabled={!configured || busy}>
          {busy ? "Entrando…" : "Entrar no painel →"}
        </button>
        {error && <p role="alert">{error}</p>}
        {!configured && (
          <p role="status">
            O CMS aguarda a configuração do Supabase. O acesso será liberado
            após conectar o banco e cadastrar a administradora.
          </p>
        )}
      </form>
    </main>
  );
}
