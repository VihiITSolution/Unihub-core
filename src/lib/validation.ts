export const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value.trim());
}

/** Rejects numeric-only input (e.g. "11111") - requires at least one letter. */
export function hasLetters(value: string): boolean {
  return /[a-zA-Z]/.test(value);
}

/** Person/shop name: letters, spaces, hyphens, apostrophes, periods; 2-50 chars. */
export function isNameLike(value: string): boolean {
  return /^[a-zA-Z\s'.-]{2,50}$/.test(value.trim());
}
