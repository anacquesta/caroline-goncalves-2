import { NextResponse } from "next/server";
import { session, sameOrigin } from "@/lib/cms/server";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  try {
    const token = await session();
    if (Number(request.headers.get("content-length")) > 36_000_000)
      throw new Error("O arquivo excede o tamanho permitido.");
    const form = await request.formData();
    const group = crypto.randomUUID();
    const url = process.env.SUPABASE_URL!;
    const uploaded: string[] = [];
    try {
      for (const width of [480, 960, 1600]) {
        const file = form.get("image-" + width);
        if (
          !(file instanceof File) ||
          file.size > 12_000_000 ||
          file.type !== "image/webp"
        )
          throw new Error("Envie as três versões WebP da imagem.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (
          new TextDecoder().decode(bytes.slice(0, 4)) !== "RIFF" ||
          new TextDecoder().decode(bytes.slice(8, 12)) !== "WEBP"
        )
          throw new Error("Arquivo de imagem inválido.");
        const filename = `${group}-${width}.webp`;
        const response = await fetch(
          `${url}/storage/v1/object/editorial/${filename}`,
          {
            method: "POST",
            headers: {
              apikey: process.env.SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${token}`,
              "Content-Type": "image/webp",
            },
            body: bytes,
          },
        );
        if (!response.ok) throw new Error("Não foi possível enviar a imagem.");
        uploaded.push(filename);
      }
    } catch (e) {
      if (uploaded.length)
        await fetch(`${url}/storage/v1/object/editorial`, {
          method: "DELETE",
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes: uploaded }),
        });
      throw e;
    }
    return NextResponse.json({
      url: `${url}/storage/v1/object/public/editorial/${group}-1600.webp`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha no upload." },
      { status: 400 },
    );
  }
}
