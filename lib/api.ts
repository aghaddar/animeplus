// lib/api.ts

// Re-export everything from anilist.ts for backward compatibility
export {
  // Types
  type AniListAnime,
  type NormalizedAnime,
  type PageInfo,
  type PaginatedResult,
  
  // Normalizer
  normalizeAniListAnime,
  
  // Home page
  getHomePageData,
  
  // Detail
  getAnimeInfo,
  
  // Search
  searchAnime,
  
  // Browse pages
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getSeasonalAnime,
  getAnimeByGenre,
  
  // Constants
  ANILIST_GENRES,
} from './anilist'

// ─── Legacy type aliases (for backward compatibility) ───────

import type { NormalizedAnime } from './anilist'

/**
 * @deprecated Use NormalizedAnime from anilist.ts instead
 */
export type AnimeResult = NormalizedAnime

/**
 * @deprecated Episode data is not provided by AniList API
 */
export interface Episode {
  id: string
  number: number
  title?: string
}

// ─── Legacy function aliases (for backward compatibility) ───

import { 
  getHomePageData,
  getTrendingAnime,
  getPopularAnime,
} from './anilist'

/**
 * @deprecated Use getHomePageData().featured from anilist.ts instead
 */
export async function getFeaturedAnime() {
  const data = await getHomePageData()
  return data.featured
}

/**
 * @deprecated Use getTrendingAnime() from anilist.ts instead
 */
export async function getTopAiringAnime() {
  const { media } = await getTrendingAnime(1, 24)
  return media
}

/**
 * @deprecated Use getPopularAnime() from anilist.ts instead
 */
export async function getMostFavoriteAnime() {
  const { media } = await getPopularAnime(1, 24)
  return media
}

/**
 * @deprecated Functionality not directly available in AniList.
 * Returns empty array as a safe fallback.
 */
export async function getLatestCompletedAnime() {
  console.warn('getLatestCompletedAnime is deprecated and returns empty array')
  return []
}

/**
 * @deprecated Functionality not directly available in AniList.
 * Returns empty array as a safe fallback.
 */
export async function getRecentAddedAnime() {
  console.warn('getRecentAddedAnime is deprecated and returns empty array')
  return []
}

/**
 * @deprecated Related anime is now included in getAnimeInfo() response.
 * Returns empty array as a safe fallback.
 */
export async function getRelatedAnime(genres: string[]) {
  console.warn('getRelatedAnime is deprecated. Use getAnimeInfo() which includes recommendations')
  return []
}