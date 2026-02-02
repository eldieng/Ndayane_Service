// Configuration de l'API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '${API_URL}';

// Helper pour construire les URLs d'API
export function getApiUrl(path: string): string {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
