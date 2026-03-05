const DEFAULT_REDIRECT_PATH = "/dashboard";

export function resolveSafeRedirectPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT_PATH
): string {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;

  return trimmed;
}

export function withRedirectParam(path: string, redirectTo: string): string {
  const safeRedirect = resolveSafeRedirectPath(redirectTo);
  if (safeRedirect === DEFAULT_REDIRECT_PATH) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}redirect=${encodeURIComponent(safeRedirect)}`;
}
