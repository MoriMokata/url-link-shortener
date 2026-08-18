/** Thrown for any non-2xx API response; `message` is the backend's ProblemDetails "detail". */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ProblemDetails {
  title?: string
  detail?: string
}

/** Thin fetch wrapper: JSON in/out, `/api` prefix (proxied to the backend in dev — see vite.config.ts). */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const problem: ProblemDetails | null = await response.json().catch(() => null)
    throw new ApiError(response.status, problem?.detail ?? `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
