const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;

export const normalizeSiteUrl = (siteUrl: string): string => {
  return (siteUrl || '').trim().replace(/\/+$/, '');
};

export const isAbsoluteOrRootUrl = (value: string): boolean => {
  const trimmed = (value || '').trim();
  return ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('/');
};

export const buildSiteRelativeUrl = (siteUrl: string, relativePath: string): string => {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const normalizedPath = (relativePath || '').trim().replace(/^\/+/, '');

  if (!normalizedPath) {
    return normalizedSiteUrl;
  }

  if (!normalizedSiteUrl) {
    return `/${normalizedPath}`;
  }

  return `${normalizedSiteUrl}/${normalizedPath}`;
};

export const resolveSiteUrlValue = (
  siteUrl: string,
  configuredValue: string,
  fallbackRelativePath?: string
): string => {
  const trimmed = (configuredValue || '').trim();

  if (trimmed) {
    return isAbsoluteOrRootUrl(trimmed)
      ? trimmed
      : buildSiteRelativeUrl(siteUrl, trimmed);
  }

  if (fallbackRelativePath) {
    return buildSiteRelativeUrl(siteUrl, fallbackRelativePath);
  }

  return '';
};
