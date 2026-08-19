import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/simulations?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("simulations")
    .select("id, name, data, saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ simulations: data });
}

// POST /api/simulations  { userId, name, data, savedAt }
export async function POST(req: NextRequest) {
  const { userId, name, data, savedAt } = await req.json();
  if (!userId || !name) return NextResponse.json({ error: "userId et name requis" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("simulations")
    .upsert({ user_id: userId, name, data, saved_at: savedAt ?? Date.now() }, { onConflict: "user_id,name" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/simulations  { userId, id?, name? }
export async function DELETE(req: NextRequest) {
  const { userId, id, name } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  let query = supabaseAdmin.from("simulations").delete().eq("user_id", userId);
  if (id) {
    query = query.eq("id", id);
  } else if (name) {
    query = query.eq("name", name);
  } else {
    return NextResponse.json({ error: "id ou name requis" }, { status: 400 });
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
