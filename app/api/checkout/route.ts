import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  const { credits } = await req.json();

  const priceIdMap: Record<number, string> = {
    50: "price_1RD0X1EcrTMt6NEqCAdSucba",
    100: "price_1RD0X1EcrTMt6NEqCAdSucba",
  };

  const priceId = priceIdMap[credits];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/charge?success=true`,
      cancel_url: `${req.nextUrl.origin}/charge?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Stripe checkout session failed." },
      { status: 500 }
    );
  }
}
