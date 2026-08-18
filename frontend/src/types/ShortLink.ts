export type ShortCodeSource = 'Auto' | 'CustomAlias'

/** Keys match the backend's Platform enum names (PascalCase) — see Gulfy.Domain.Enums.Platform. */
export type PlatformKey = 'Ios' | 'Android'

export interface ShortLink {
  shortCode: string
  shortUrl: string
  originalUrl: string
  customAlias: string | null
  source: ShortCodeSource
  isDisabled: boolean
  clickCount: number
  createdAt: string
  lastAccessedAt: string | null
  platformDestinations: Partial<Record<PlatformKey, string>>
}

export interface CreateShortLinkRequest {
  originalUrl: string
  customAlias?: string
  platformDestinations?: {
    ios?: string
    android?: string
  }
}
