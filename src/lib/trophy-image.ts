/** Trofeos PNG locales: evitar el optimizador de Next (fallos / alt gigante si rompe). */
export function trophyImgUnoptimized(url: string): boolean {
  return url.startsWith("/") || url.startsWith("http");
}
