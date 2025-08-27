// next-intl.config.js
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'es', 'fr'],
  defaultLocale: 'en'
});

function getRequestConfig() {
  return {
    locale: 'en',
    timeZone: 'UTC',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      }
    }
  };
}

export default getRequestConfig;