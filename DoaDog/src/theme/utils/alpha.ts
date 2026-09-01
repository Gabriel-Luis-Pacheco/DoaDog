export function alpha(hex: string, opacity: number) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;

  const value = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${normalized}${value}`;
}

