import { NextResponse } from "next/server";
import { session, supabase } from "@/lib/cms/server";
export async function GET() {
  try {
    const token = await session();
    return NextResponse.json({
      messages: await supabase(
        "/rest/v1/contact_messages?select=*&order=created_at.desc&limit=100",
        {},
        token,
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as mensagens." },
      { status: 401 },
    );
  }
}
