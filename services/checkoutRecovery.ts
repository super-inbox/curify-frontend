import { creditsService, type CheckoutStatus } from "./credits";
import { projectService } from "./projects";

// Share an in-flight resume across StrictMode effect restarts. A failed POST is
// not automatically repeated: its response may have been lost after dispatch.
const resumes = new Map<string, Promise<unknown>>();
export async function resumeFulfilledCheckout(sessionId: string, checkout: CheckoutStatus): Promise<string | null> {
  if (checkout.fulfilled !== true || checkout.resume_after_payment !== true || !checkout.project_id) return null;
  let resume = resumes.get(sessionId);
  if (!resume) {
    resume = projectService.resumeProject(checkout.project_id);
    resumes.set(sessionId, resume);
  }
  await resume;
  return checkout.project_id;
}

export async function waitForCheckout(
  sessionId: string,
  cancelled: () => boolean,
  options: { intervalMs?: number; maxMs?: number } = {},
): Promise<CheckoutStatus | null> {
  if (!sessionId.trim()) return null;
  const deadline = Date.now() + (options.maxMs ?? 40_000);
  while (!cancelled() && Date.now() < deadline) {
    try {
      const checkout = await creditsService.getCheckoutStatus(sessionId);
      if (cancelled()) return null;
      if (checkout.fulfilled === true) return checkout;
    } catch { /* Webhook or network may still be pending. */ }
    if (!cancelled()) await new Promise(r => setTimeout(r, options.intervalMs ?? 2000));
  }
  return null;
}
