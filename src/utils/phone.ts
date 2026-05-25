// Nigerian phone number validation/normalization
// Accepts formats: 08012345678, +2348012345678, 2348012345678, 0801 234 5678, etc.

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  // +234XXXXXXXXXX
  if (digits.length === 13 && digits.startsWith("234")) {
    return "+" + digits;
  }
  // 234XXXXXXXXXX
  if (digits.length === 13 && digits.startsWith("234")) {
    return "+" + digits;
  }
  // 08012345678 -> +234...
  if (digits.length === 11 && digits.startsWith("0")) {
    return "+234" + digits.slice(1);
  }
  // 8012345678 -> +234...
  if (digits.length === 10) {
    return "+234" + digits;
  }
  // Already +234XXXXXXXXXX as full
  if (digits.length === 13) {
    return "+" + digits;
  }

  return "";
}

export function isValidNigerianPhone(e164: string): boolean {
  // Nigerian numbers are +234 followed by 7, 8, or 9, then 9 more digits
  return /^\+234[789]\d{9}$/.test(e164);
}

export function formatPhoneForDisplay(e164: string): string {
  // +2348012345678 -> 0801 234 5678
  if (!e164.startsWith("+234")) return e164;
  const local = "0" + e164.slice(4);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function smsSegmentCount(length: number): number {
  if (length <= 0) return 0;
  // After 160, each additional part uses 153 chars due to UDH overhead
  if (length <= 160) return 1;
  return Math.ceil(length / 153);
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
