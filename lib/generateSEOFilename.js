/**
 * Generate SEO-friendly filenames for uploaded images
 * Format: {context}-{imageType}-{timestamp}.{ext}
 * Example: "building-ecommerce-platform-cover-1704067200000.jpg"
 */

export function generateSEOFilename(originalFilename, options = {}) {
  const {
    contextTitle = "",
    imageType = "image", // 'cover', 'gallery', 'og', etc.
    index = 0,
  } = options;

  // Extract file extension
  const ext = originalFilename.split(".").pop().toLowerCase();

  // Sanitize context title: lowercase, remove special chars, replace spaces with hyphens
  const sanitized = (contextTitle || "image")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/gi, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple consecutive hyphens
    .substring(0, 50); // Limit length

  // Build filename
  const timestamp = Date.now();
  const suffix = index > 0 ? `-${index}` : "";
  const filename = `${sanitized}-${imageType}${suffix}-${timestamp}.${ext}`;

  return filename;
}

/**
 * Extract useful image type from common conventions:
 * "cover-image", "cover image", "main-image", "gallery-1", etc.
 */
export function inferImageType(contextType = "") {
  const normalized = (contextType || "").toLowerCase().trim();

  if (normalized.includes("cover")) return "cover";
  if (normalized.includes("og") || normalized.includes("open-graph")) return "og";
  if (normalized.includes("gallery")) return "gallery";
  if (normalized.includes("thumbnail") || normalized.includes("thumb")) return "thumbnail";
  if (normalized.includes("hero")) return "hero";
  if (normalized.includes("feature")) return "feature";

  return "image";
}
