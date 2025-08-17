// Interpolate between two colors
function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Generate N colors between red and green
export function generateGradient(n: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    const factor = i / (n - 1);
    colors.push(interpolateColor("#ff0000", "#00ff00", factor));
  }
  return colors;
}
