import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PLAN_BY_PRICE: Record<string, string> = {
  price_1U6XS4DnqWNMNvvGfORZx3Hq: "starter",
  price_1U6XSKDnqWNMNvvGkGPD3JED: "pro",
  price_1U6XSaDnqWNMNvvGoANB6CSq: "pro_plus",
  price_1U6XRgDnqWNMNvvGDs7dODoN: "rapport",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook secret non configuré" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const raw = event.data.object as Stripe.Checkout.Session;

    // Expand line_items — not included by default in webhook payload
    const session = await stripe.checkout.sessions.retrieve(raw.id, {
      expand: ["line_items"],
    });

    const userId = session.metadata?.userId;
    const priceId = session.line_items?.data?.[0]?.price?.id;

    if (userId && priceId) {
      const plan = PLAN_BY_PRICE[priceId];
      if (plan) {
        const { error } = await supabaseAdmin.from("user_plans").upsert({
          user_id: userId,
          plan,
          stripe_customer_id: session.customer as string ?? null,
          stripe_subscription_id: session.subscription as string ?? null,
          updated_at: new Date().toISOString(),
        });
        if (error) {
          console.error("Supabase upsert error:", error);
        }
      }
    }

    console.log("Paiement complété:", {
      sessionId: session.id,
      userId,
      amount: session.amount_total,
      mode: session.mode,
    });
  }

  return NextResponse.json({ received: true });
}
