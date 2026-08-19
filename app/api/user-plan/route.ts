import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/user-plan?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ plan: null });

  const { data, error } = await supabaseAdmin
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ plan: null });
  return NextResponse.json({ plan: data?.plan ?? null });
}
