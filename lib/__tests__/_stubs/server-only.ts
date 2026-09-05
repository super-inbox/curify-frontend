// `server-only` throws on import outside an RSC server module. Node-environment
// unit tests are neither client nor server components, so the guard is a false
// positive here — it is aliased to this no-op in vitest.unit.config.ts so that
// server-side data builders (lib/nano_page_data.ts) can be unit-tested.
export {};
