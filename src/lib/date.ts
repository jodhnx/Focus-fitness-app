export function toDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(toDateKey(d));
  }
  return out;
}
