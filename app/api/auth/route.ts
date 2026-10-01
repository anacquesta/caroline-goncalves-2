import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, session, configured, sameOrigin } from "@/lib/cms/server";
export async function GET() {
  try {
    await session();
    return NextResponse.json({ authenticated: true, configured });
  } catch {
    return NextResponse.json({ authenticated: false, configured });
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  try {
    const { email, password } = (await request.json()) as {
      email: unknown;
      password: unknown;
    };
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 320 ||
      password.length > 1024
    )
      throw new Error("Informe e-mail e senha.");
    const result = await supabase<{
      user: { id: string };
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const admins = await supabase<{ user_id: string }[]>(
      `/rest/v1/cms_admins?user_id=eq.${encodeURIComponent(result.user.id)}&select=user_id`,
      {},
      result.access_token,
    );
    if (!admins.length)
      throw new Error("Este usuário não tem acesso ao painel.");
    const jar = await cookies();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };
    jar.set("cg-access", result.access_token, {
      ...options,
      maxAge: result.expires_in,
    });
    jar.set("cg-refresh", result.refresh_token, { ...options, maxAge: 604800 });
    return NextResponse.json({ authenticated: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao entrar." },
      { status: 401 },
    );
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  const jar = await cookies();
  const token = jar.get("cg-access")?.value;
  if (token)
    try {
      await supabase("/auth/v1/logout", { method: "POST" }, token);
    } catch {}
  jar.delete("cg-access");
  jar.delete("cg-refresh");
  return NextResponse.json({ authenticated: false });
}
