import "server-only";
import { cookies } from "next/headers";
import { seed, type Store, visible } from "./seed";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export async function supabase<T = unknown>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  if (!url || !key)
    throw new Error(
      "CMS não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.",
    );
  const response = await fetch(`${url}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${token || key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok)
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Sessão inválida ou acesso não autorizado."
        : "O serviço de conteúdo não está disponível. Tente novamente.",
    );
  return (response.status === 204 ? null : await response.json()) as T;
}
export async function session() {
  const jar = await cookies();
  let token = jar.get("cg-access")?.value;
  if (!token) {
    const refresh = jar.get("cg-refresh")?.value;
    if (!refresh) throw new Error("Entre no painel para continuar.");
    const renewed = await supabase<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    });
    token = renewed.access_token;
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };
    jar.set("cg-access", token, { ...options, maxAge: renewed.expires_in });
    jar.set("cg-refresh", renewed.refresh_token, {
      ...options,
      maxAge: 604800,
    });
  }
  const user = await supabase<{ id: string }>("/auth/v1/user", {}, token);
  const admins = await supabase<{ user_id: string }[]>(
    `/rest/v1/cms_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`,
    {},
    token,
  );
  if (!admins.length) throw new Error("Este usuário não tem acesso ao painel.");
  return token;
}
export async function readStore(token?: string): Promise<Store> {
  if (!configured) return seed;
  const rows = await supabase<
    { section: string; payload: Store[string][number] }[]
  >(
    "/rest/v1/content_records?select=section,payload&order=position.asc",
    {},
    token,
  );
  const store: Store = {
    Textos: [],
    Projetos: [],
    Fotografias: [],
    Álbuns: [],
    Depoimentos: [],
  };
  for (const row of rows)
    if (store[row.section]) store[row.section].push(row.payload);
  return store;
}
export async function publicStore(): Promise<Store> {
  const store = await readStore();
  return Object.fromEntries(
    Object.entries(store).map(([k, v]) => [k, v.filter(visible)]),
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export async function readSettings(): Promise<Record<string, string>> {
  if (!configured) return {};
  const rows = await supabase<{ key: string; value: string }[]>(
    "/rest/v1/site_settings?select=key,value",
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
