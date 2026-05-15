/**
 * Infer how many set rows to show from a coach-style prescription string, e.g. "4 × 6–8", "3 × 10".
 * Falls back to 3 when parsing fails.
 */
export function setCountFromPrescription(setsLabel: string): number {
  const s = setsLabel.trim();
  const m = s.match(/^(\d+)\s*[×x]\s*/i);
  if (m?.[1]) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n >= 1 && n <= 12) return n;
  }
  const trailing = s.match(/(\d+)\s*×\s*$/i);
  if (trailing?.[1]) {
    const n = Number(trailing[1]);
    if (Number.isFinite(n) && n >= 1 && n <= 12) return n;
  }
  return 3;
}
