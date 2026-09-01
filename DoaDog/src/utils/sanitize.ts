const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value: string, maxLength = 180) {
  return value.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function cleanMultiline(value: string, maxLength = 900) {
  return value
    .replace(CONTROL_CHARS, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

export function cleanContact(value: string, maxLength = 140) {
  return cleanText(value, maxLength);
}

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
