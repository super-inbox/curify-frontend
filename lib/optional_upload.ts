// Templates that OFFER an optional own-photo upload on their detail page: the
// visitor can generate from parameters alone (text→image) OR upload their own
// product photo to apply the template to it (image→image). Scoped to product /
// e-commerce / photography / fashion-collection templates where "put my product
// in this" is the natural use (2026-08-19, per the vintage-collage report).
//
// Templates that REQUIRE an upload (try-on, fashion-ecommerce, product-poster)
// are handled by `requires_image_upload` and are intentionally NOT here.
//
// Pure / client-safe: a single regex, no data imports.
const OPTIONAL_UPLOAD_RE =
  /photograph|photo-grid|product-lifestyle|lifestyle-moodboard|scene-photography|-ecommerce\b|ecommerce-product|ecommerce-store|product-scene|packshot|fashion-collection|\bproduct\b|product-|mockup|packaging|product-label|\bmerch\b|merchandise|magnet|promotional|commercial-ad|product-ad|perfume-cosmetic|gift-box|giftbox|presentation-board/i;

/** True when the template should offer (but not require) an own-photo upload. */
export function allowsOptionalImageUpload(templateId: string | undefined | null): boolean {
  if (!templateId) return false;
  return OPTIONAL_UPLOAD_RE.test(templateId);
}
