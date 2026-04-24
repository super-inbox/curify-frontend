const KEY = "_anon_copy_count";
const FREE_LIMIT = 2;

export function getAnonymousCopyCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEY) ?? "0", 10);
}

export function incrementAnonymousCopyCount(): void {
  if (typeof window === "undefined") return;
  const n = getAnonymousCopyCount();
  localStorage.setItem(KEY, String(n + 1));
}

export function canCopyAnonymously(): boolean {
  return getAnonymousCopyCount() < FREE_LIMIT;
}

export function resetAnonymousCopyCount(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
