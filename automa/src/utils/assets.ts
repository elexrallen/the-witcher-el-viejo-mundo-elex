/** Resuelve rutas de assets públicos relativas al base URL de Vite (./). */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}
