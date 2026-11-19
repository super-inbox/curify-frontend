/** Stable, non-personal IDs shared by portfolio, contact payloads and analytics. */
export const BUSINESS_CASE_SERVICES = {
  'hotel-room': 'photo-retouching',
  'zeelum-backpack': 'product-video',
  fabric: 'product-story-video',
  kyoto: 'souvenir-video',
} as const;
export type BusinessCaseId = keyof typeof BUSINESS_CASE_SERVICES;
export function businessCaseContext(id: string | null | undefined) {
  if (!id || !Object.prototype.hasOwnProperty.call(BUSINESS_CASE_SERVICES, id)) return undefined;
  const caseId = id as BusinessCaseId;
  return { caseId, service: BUSINESS_CASE_SERVICES[caseId] };
}
