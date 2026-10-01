import { NextResponse } from "next/server";
import { session, supabase, sameOrigin, configured } from "@/lib/cms/server";
export async function GET() {
  if (!configured) return NextResponse.json({ settings: {} });
  try {
    const rows = await supabase<{ key: string; value: string }[]>(
      "/rest/v1/site_settings?select=key,value",
    );
    return NextResponse.json({
      settings: Object.fromEntries(
        rows.map((r: { key: string; value: string }) => [r.key, r.value]),
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Configurações indisponíveis." },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  try {
    const token = await session();
    const data = await request.json();
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      Object.entries(data).some(
        ([k, v]) => k.length > 100 || typeof v !== "string" || v.length > 10000,
      )
    )
      throw new Error("Configurações inválidas.");
    for (const [k, v] of Object.entries(data)) {
      if (
        k === "ContatoE-mail" &&
        v &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))
      )
        throw new Error("Informe um e-mail válido.");
      if (
        k === "ContatoWhatsApp" &&
        v &&
        !/^\+?[0-9 ()-]{10,20}$/.test(String(v))
      )
        throw new Error("Informe WhatsApp com código do país e DDD.");
      if (
        [
          "ContatoInstagram",
          "ContatoLinkedIn",
          "ContatoLink de agendamento",
        ].includes(k) &&
        v &&
        !/^https:\/\//.test(String(v))
      )
        throw new Error("Informe um endereço HTTPS válido.");
    }
    await supabase(
      "/rest/v1/site_settings",
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify(
          Object.entries(data).map(([key, value]) => ({ key, value })),
        ),
      },
      token,
    );
    return NextResponse.json({ saved: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao salvar." },
      { status: 400 },
    );
  }
}
