export const MAX_SUMMARY_CHARS = 20_000;
export const MAX_FLASHCARDS = 12;
export const MAX_QUIZ_QUESTIONS = 8;

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

export function isAllowedAvatarType(
  contentType: string
): contentType is (typeof ALLOWED_AVATAR_TYPES)[number] {
  return (ALLOWED_AVATAR_TYPES as readonly string[]).includes(contentType);
}

const AVATAR_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export function getAvatarExtension(contentType: string) {
  return AVATAR_EXTENSION_BY_TYPE[contentType] ?? 'img';
}
