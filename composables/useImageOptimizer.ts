// Optimise les images via le proxy wsrv.nl (WebP, resize, cache CDN)
export const useImageOptimizer = () => {
  const getOptimizedImageUrl = (
    originalUrl: string | null | undefined,
    width = 400,
    quality = 75
  ): string => {
    if (
      !originalUrl ||
      originalUrl.startsWith("/") ||
      originalUrl.startsWith("./")
    ) {
      return originalUrl || "/images/default-recipe.jpg";
    }
    const params = new URLSearchParams({
      url: originalUrl,
      w: width.toString(),
      h: Math.round(width * 0.75).toString(),
      fit: "cover",
      q: quality.toString(),
      output: "webp",
    });
    return `https://wsrv.nl/?${params.toString()}`;
  };

  // Génère un srcset pour laisser le navigateur choisir la taille adaptée
  // à l'écran au lieu de toujours charger la plus grande variante.
  const getOptimizedImageSrcset = (
    originalUrl: string | null | undefined,
    widths: number[],
    quality = 75
  ): string | undefined => {
    if (
      !originalUrl ||
      originalUrl.startsWith("/") ||
      originalUrl.startsWith("./")
    ) {
      return undefined;
    }
    return widths
      .map((w) => `${getOptimizedImageUrl(originalUrl, w, quality)} ${w}w`)
      .join(", ");
  };

  return { getOptimizedImageUrl, getOptimizedImageSrcset };
};
