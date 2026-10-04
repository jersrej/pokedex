export const API_BASE_URL = 'https://pokeapi.co/api/v2';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, path: string) {
    super(`PokéAPI responded ${status} for ${path}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path}`, { signal });
  if (!response.ok) throw new ApiError(response.status, path);
  return (await response.json()) as T;
}
