export function unlerp(a: number, b: number, t: number): number {
  return (t - a) / (b - a);
}
