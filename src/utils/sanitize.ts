/**
 * Sanitizes user input by removing potentially dangerous XSS patterns.
 *
 * Removes:
 * - `<script>` tags and their contents
 * - `javascript:` protocol handlers
 * - Inline event handlers (`onerror=`, `onclick=`, etc.)
 *
 * @param input - The raw user input string to sanitize.
 * @returns A cleaned string safe for rendering or further processing.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove potential XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Sanitizes and normalizes a URL string for safe use in links or redirects.
 *
 * Performs the following steps:
 * 1. Runs the URL through {@link sanitizeInput} to remove XSS vectors.
 * 2. Strips dangerous protocols (`javascript:`, `data:`).
 * 3. Prepends `https://` if the URL lacks a valid protocol.
 *
 * @param url - The raw URL string to sanitize.
 * @returns A cleaned, normalized URL, or an empty string if the input is empty.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  const sanitized = sanitizeInput(url);

  // Basic URL validation and cleaning
  try {
    // Remove potentially dangerous protocols
    let cleanUrl = sanitized
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "");

    // If it doesn't start with http://, https://, or //, add https://
    if (!cleanUrl.match(/^https?:\/\//) && !cleanUrl.startsWith("//")) {
      cleanUrl = "https://" + cleanUrl;
    }

    return cleanUrl;
  } catch {
    return "";
  }
}
