// lib/creditUtils.ts

// Example mapping, you can expand this based on plan (Free, Pro, Enterprise)
export function creditsToDollars(credits, plan) {
  let rate = 0.1; // default: $0.10 per credit

  if (plan === "Pro") {
    rate = 0.08; // Pro plan discount
  } else if (plan === "Enterprise") {
    rate = 0.05; // Enterprise bulk discount
  }

  return credits * rate;
}
