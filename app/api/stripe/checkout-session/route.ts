import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode, userId } = await req.json();

    if (!priceId || !mode) {
      return NextResponse.json({ error: "priceId et mode sont requis" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "https://toutlmnp.fr";

    const session = await stripe.checkout.sessions.create({
      mode: mode as "payment" | "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tarifs`,
      ...(userId ? { client_reference_id: userId } : {}),
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Erreur lors de la création de la session de paiement" }, { status: 500 });
  }
}
