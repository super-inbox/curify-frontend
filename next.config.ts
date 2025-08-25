import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // 换成真实的后记得删掉
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
