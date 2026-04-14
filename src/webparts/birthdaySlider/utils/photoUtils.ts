export function getProfilePhotoUrl(
  email: string,
  siteUrl: string,
  size: 'S' | 'M' | 'L' = 'L'
): string {
  const origin = extractOrigin(siteUrl);
  return `${origin}/_layouts/15/userphoto.aspx?size=${size}&username=${encodeURIComponent(email)}`;
}

export function getFallbackPhotoUrl(siteUrl: string): string {
  const origin = extractOrigin(siteUrl);
  return `${origin}/_layouts/15/images/PersonPlaceholder.96x96x32.png`;
}

function extractOrigin(siteUrl: string): string {
  try {
    return new URL(siteUrl.replace(/\/$/, '')).origin;
  } catch {
    return '';
  }
}
