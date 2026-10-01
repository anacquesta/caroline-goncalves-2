import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase, configured, sameOrigin } from "@/lib/cms/server";
const schema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().email().max(320),
  company: z.string().max(200).default(""),
  subject: z.string().min(1).max(100),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).default(""),
  started: z.number(),
});
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  if (!configured)
    return NextResponse.json(
      {
        error:
          "O formulário ainda não está disponível. Use os canais de contato ao lado.",
      },
      { status: 503 },
    );
  try {
    const data = schema.parse(await request.json());
    if (data.website || Date.now() - data.started < 3000)
      return NextResponse.json(
        { error: "Não foi possível enviar a mensagem." },
        { status: 400 },
      );
    await supabase("/rest/v1/rpc/submit_contact", {
      method: "POST",
      body: JSON.stringify({
        sender_name: data.name,
        sender_email: data.email,
        sender_company: data.company,
        message_subject: data.subject,
        message_body: data.message,
      }),
    });
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Confira os campos. Se já enviou uma mensagem, aguarde alguns minutos antes de tentar novamente.",
      },
      { status: 400 },
    );
  }
}
