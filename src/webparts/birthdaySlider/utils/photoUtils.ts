/**
 * Builds the URL for a user's SharePoint profile photo.
 *
 * Uses /_layouts/15/userphoto.aspx which is available in SharePoint Online
 * and pulls photos from Azure AD / Exchange.
 *
 * Size options:
 *   'S' → 48×48 px
 *   'M' → 72×72 px
 *   'L' → 200×200 px
 *
 * NOTE: If the user has no photo, SharePoint returns a default silhouette.
 * No additional fallback logic is needed at the URL level.
 */
export function getProfilePhotoUrl(
  email: string,
  siteUrl: string,
  size: 'S' | 'M' | 'L' = 'L'
): string {
  const origin = extractOrigin(siteUrl);
  return `${origin}/_layouts/15/userphoto.aspx?size=${size}&username=${encodeURIComponent(email)}`;
}

/**
 * Returns a safe fallback avatar URL using SharePoint's built-in
 * anonymous person placeholder image.
 */
export function getFallbackPhotoUrl(siteUrl: string): string {
  const origin = extractOrigin(siteUrl);
  return `${origin}/_layouts/15/images/PersonPlaceholder.96x96x32.png`;
}

function extractOrigin(siteUrl: string): string {
  try {
    return new URL(siteUrl.replace(/\/$/, '')).origin;
  } catch {
    // siteUrl may be relative in local workbench; return empty string as safe fallback
    return '';
  }
}
