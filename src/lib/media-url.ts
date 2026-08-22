const CATALOG_IMAGE_VERSION = "20260822";

export function versionedMediaUrl(src: string) {
  if (!src.startsWith("/images/") || src.includes("?v=")) return src;

  return `${src}${src.includes("?") ? "&" : "?"}v=${CATALOG_IMAGE_VERSION}`;
}
