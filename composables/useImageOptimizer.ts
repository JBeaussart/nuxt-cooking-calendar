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

  return { getOptimizedImageUrl };
};
