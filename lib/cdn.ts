export function cdn(path?: string): string {
  if (!path) return ""; // or return path ?? "";

  const cdnHost = process.env.NEXT_PUBLIC_CDN_URL;

  // If no CDN or path is external, return as-is
  if (!cdnHost) return path;

  const clean = path.startsWith("/") ? path : `/${path}`;

  if (
    clean.startsWith("/images/") ||
    clean.startsWith("/video/") ||
    clean.startsWith("/audio/")
  ) {
    return `${cdnHost}${clean}`;
  }

  return clean;
}