import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe failed to load");

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
};
