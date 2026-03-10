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
  const blog = (await import(`../messages/${locale}/blog.json`)).default;
  const pricing = (await import(`../messages/${locale}/pricing.json`)).default;
  const nano = (await import(`../messages/${locale}/nano.json`)).default;

  return {
    locale,
    messages: {
      ...common,
      ...home,
      ...pricing,
      ...blog,
      // Nested under "nano" so useTranslations("nano") resolves correctly.
      // Do NOT spread nano flat — its template IDs would collide with other
      // top-level keys and "nano" namespace would never exist.
      nano,
    },
  };
});