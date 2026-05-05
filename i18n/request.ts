import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../messages/${locale}/common.json`)).default;
  const home = (await import(`../messages/${locale}/home.json`)).default;
  const pricing = (await import(`../messages/${locale}/pricing.json`)).default;
  const nano = (await import(`../messages/${locale}/nano.json`)).default;
  const blog = (await import(`../messages/${locale}/blog.json`)).default;

  let nanoPromptsTags: Record<string, unknown>;
  try {
    nanoPromptsTags = (await import(`../messages/${locale}/nanoPromptsTags.json`)).default;
  } catch {
    nanoPromptsTags = (await import(`../messages/en/nanoPromptsTags.json`)).default;
  }

  return {
    locale,
    messages: {
      ...common,
      ...home,
      ...pricing,
      ...blog,
      // Nested under "nano" so useTranslations("nano") resolves correctly.
      nano,
      nanoPromptsTags,
    },
  };
});
