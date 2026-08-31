import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type ClerkWebhookEvent = {
  type: string;
  data: { id?: string };
};

export async function POST(req: NextRequest) {
  const webhookSecret =
    process.env.CLERK_WEBHOOK_SECRET ?? process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET non configuré");
    return NextResponse.json({ error: "Webhook secret non configuré" }, { status: 400 });
  }

  // En-têtes Svix envoyés par Clerk
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "En-têtes Svix manquants" }, { status: 400 });
  }

  // La signature porte sur le corps brut : ne pas parser avant vérification
  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const userId = event.data?.id;

    if (!userId) {
      console.error("user.created reçu sans identifiant utilisateur");
      return NextResponse.json({ error: "Identifiant utilisateur manquant" }, { status: 400 });
    }

    // ignoreDuplicates : un webhook peut être redélivré. On ne veut jamais
    // écraser le plan d'un utilisateur déjà enregistré (et payant) par "free".
    const { error } = await supabaseAdmin.from("user_plans").upsert(
      {
        user_id: userId,
        plan: "free",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

    if (error) {
      console.error("Supabase insert error (user.created):", error);
      // 500 → Clerk réessaiera la livraison
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    console.log("Plan free créé pour l'utilisateur:", userId);
  }

  return NextResponse.json({ received: true });
}
