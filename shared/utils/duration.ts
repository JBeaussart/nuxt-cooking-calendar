// Formatage des durees de recette, partage entre la liste des recettes et la
// page de detail (les deux affichaient auparavant "X min" quelle que soit la
// duree, ce qui donnait "90 min" au lieu de "1h30").

/**
 * Formatte une duree en minutes pour l'affichage :
 *   45   -> "45 min"
 *   60   -> "1h"
 *   70   -> "1h10"
 *   125  -> "2h05"
 * Retourne "" pour une duree absente ou nulle, afin que l'appelant puisse
 * simplement masquer le bloc.
 *
 * Les minutes sont completees a deux chiffres ("1h05") : sans cela "1h5" se
 * lit mal et peut se confondre avec "1h50".
 */
export function formatDuration(minutes: unknown): string {
  const n = Math.round(Number(minutes));
  if (!Number.isFinite(n) || n <= 0) return "";

  if (n < 60) return `${n} min`;

  const hours = Math.floor(n / 60);
  const rest = n % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}
