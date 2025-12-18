export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\[\]{}()<>|"':;,?*#&@!$%^+=~`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  return `${Date.now()}-${sanitized}`;
}

export function generateRandomFilename(extension: string): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
}

