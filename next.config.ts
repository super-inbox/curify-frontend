// next.config.js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.js");

export default withNextIntl({
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
});