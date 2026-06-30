// lib/anilist.ts

const ANILIST_URL = "https://graphql.anilist.co"

// ─── Types ──────────────────────────────────────────────────

export interface AniListAnime {
  id: number
  title: {
    romaji: string
    english: string | null
    native: string
  }
  description: string | null
  coverImage: {
    large: string
    extraLarge: string
  }
  bannerImage: string | null
  genres: string[]
  averageScore: number | null
  popularity: number
  status: string
  episodes: number | null
  format: string
  season: string | null
  seasonYear: number | null
  startDate: { year: number | null }
  externalLinks: {
    url: string
    site: string
    color: string | null
    icon: string | null
  }[]
  recommendations: {
    nodes: {
      mediaRecommendation: {
        id: number
        title: { romaji: string; english: string | null }
        coverImage: { large: string }
        format: string
        averageScore: number | null
        genres: string[]
      } | null
    }[]
  }
}

export interface NormalizedAnime {
  id: string
  title: string
  image: string
  bannerImage: string | null
  description: string | undefined
  genres: string[]
  rating: number | null
  type: string
  status: string
  totalEpisodes: number | null
  releaseDate: string | undefined
  season: string | null
  externalLinks: {
    url: string
    site: string
    color: string | null
    icon: string | null
  }[]
  recommendations: {
    id: string
    title: string
    image: string
    type: string
    rating: number | null
    genres: string[]
  }[]
}

export interface PageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
}

export interface PaginatedResult {
  media: NormalizedAnime[]
  pageInfo: PageInfo
}

// ─── Cache ──────────────────────────────────────────────────

type CacheEntry<T> = { data: T; timestamp: number }
const cache = new Map<string, CacheEntry<unknown>>()

async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T
  }
  const data = await fn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// ─── Core fetch ─────────────────────────────────────────────

async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "AniList GraphQL error")
  }

  return json.data as T
}

// ─── Normalizer ─────────────────────────────────────────────

export function normalizeAniListAnime(media: AniListAnime): NormalizedAnime {
  return {
    id: media.id.toString(),
    title: media.title.english || media.title.romaji,
    image: media.coverImage.extraLarge || media.coverImage.large,
    bannerImage: media.bannerImage ?? null,
    description: media.description
      ? media.description
          .replace(/<[^>]*>/g, "")
          .replace(/&[^;]+;/g, " ")
          .trim()
      :  undefined,
    genres: media.genres ?? [],
    rating: media.averageScore
      ? parseFloat((media.averageScore / 10).toFixed(1))
      : null,
    type: media.format ?? "TV",
    status: media.status ?? "UNKNOWN",
    totalEpisodes: media.episodes ?? null,
    releaseDate:
      media.seasonYear?.toString() ??
      media.startDate?.year?.toString() ??
      undefined,
    season: media.season ?? null,
    externalLinks: media.externalLinks ?? [],
    recommendations:
      media.recommendations?.nodes
        .filter((n) => n.mediaRecommendation !== null)
        .map((n) => ({
          id: n.mediaRecommendation!.id.toString(),
          title:
            n.mediaRecommendation!.title.english ||
            n.mediaRecommendation!.title.romaji,
          image: n.mediaRecommendation!.coverImage.large,
          type: n.mediaRecommendation!.format,
          rating: n.mediaRecommendation!.averageScore
            ? parseFloat(
                (n.mediaRecommendation!.averageScore / 10).toFixed(1)
              )
            : null,
          genres: n.mediaRecommendation!.genres ?? [],
        })) ?? [],
  }
}

// ─── Shared fields ───────────────────────────────────────────

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge }
  bannerImage
  genres
  averageScore
  popularity
  status
  episodes
  format
  season
  seasonYear
  startDate { year }
  externalLinks { url site color icon }
`

const MEDIA_FIELDS_WITH_RECS = `
  ${MEDIA_FIELDS}
  recommendations(perPage: 12, sort: RATING_DESC) {
    nodes {
      mediaRecommendation {
        id
        title { romaji english }
        coverImage { large }
        format
        averageScore
        genres
      }
    }
  }
`

// ─── Home page batched query ─────────────────────────────────

const HOME_PAGE_QUERY = `
  query ($season: MediaSeason, $seasonYear: Int) {
    trending: Page(page: 1, perPage: 15) {
      media(
        type: ANIME
        sort: TRENDING_DESC
        status_not: NOT_YET_RELEASED
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
    popular: Page(page: 1, perPage: 15) {
      media(
        type: ANIME
        sort: POPULARITY_DESC
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
    topRated: Page(page: 1, perPage: 15) {
      media(
        type: ANIME
        sort: SCORE_DESC
        averageScore_greater: 70
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
    seasonal: Page(page: 1, perPage: 15) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
    featured: Page(page: 1, perPage: 8) {
      media(
        type: ANIME
        sort: TRENDING_DESC
        status: RELEASING
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

function getCurrentSeason(): { season: string; seasonYear: number } {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const season =
    month <= 3 ? "WINTER" :
    month <= 6 ? "SPRING" :
    month <= 9 ? "SUMMER" : "FALL"
  return { season, seasonYear: year }
}

export async function getHomePageData() {
  return withCache(
    "homepage",
    async () => {
      const { season, seasonYear } = getCurrentSeason()

      const data = await anilistQuery<{
        trending:  { media: AniListAnime[] }
        popular:   { media: AniListAnime[] }
        topRated:  { media: AniListAnime[] }
        seasonal:  { media: AniListAnime[] }
        featured:  { media: AniListAnime[] }
      }>(HOME_PAGE_QUERY, { season, seasonYear })

      return {
        trending: data.trending.media.map(normalizeAniListAnime),
        popular:  data.popular.media.map(normalizeAniListAnime),
        topRated: data.topRated.media.map(normalizeAniListAnime),
        seasonal: data.seasonal.media.map(normalizeAniListAnime),
        featured: data.featured.media
          .filter((m) => m.bannerImage)
          .map(normalizeAniListAnime)
          .slice(0, 6),
      }
    },
    10 * 60 * 1000
  )
}

// ─── Anime detail ────────────────────────────────────────────

const ANIME_INFO_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS_WITH_RECS}
    }
  }
`

export async function getAnimeInfo(id: string): Promise<NormalizedAnime | null> {
  return withCache(
    `anime:${id}`,
    async () => {
      const numericId = parseInt(id, 10)
      if (isNaN(numericId)) return null

      const data = await anilistQuery<{ Media: AniListAnime }>(
        ANIME_INFO_QUERY,
        { id: numericId }
      )
      return normalizeAniListAnime(data.Media)
    },
    30 * 60 * 1000
  )
}

// ─── Search ──────────────────────────────────────────────────

const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        search: $search
        type: ANIME
        sort: SEARCH_MATCH
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

export async function searchAnime(
  query: string,
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  if (!query.trim()) {
    return {
      media: [],
      pageInfo: {
        total: 0,
        currentPage: 1,
        lastPage: 1,
        hasNextPage: false,
      },
    }
  }

  const data = await anilistQuery<{
    Page: { media: AniListAnime[]; pageInfo: PageInfo }
  }>(SEARCH_QUERY, { search: query.trim(), page, perPage })

  return {
    media: data.Page.media.map(normalizeAniListAnime),
    pageInfo: data.Page.pageInfo,
  }
}

// ─── Browse pages ────────────────────────────────────────────

const TRENDING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        type: ANIME
        sort: TRENDING_DESC
        status_not: NOT_YET_RELEASED
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

const POPULAR_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        type: ANIME
        sort: POPULARITY_DESC
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

const TOP_RATED_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        type: ANIME
        sort: SCORE_DESC
        averageScore_greater: 70
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

const SEASONAL_QUERY = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`

const GENRE_QUERY = `
  query ($genre: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        type: ANIME
        genre: $genre
        sort: POPULARITY_DESC
        isAdult: false
      ) { ${MEDIA_FIELDS} }
    }
  }
`
const RECENTLY_ADDED_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(
      type: ANIME
      sort: ID_DESC
      isAdult: false
    ) {
      ${MEDIA_FIELDS}
    }
  }
}
`

const CURRENTLY_AIRING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: ANIME
        status: RELEASING
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`
export async function getCurrentlyAiringAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`airing:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(CURRENTLY_AIRING_QUERY, { page, perPage })

    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}
export async function getRecentlyAddedAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`recent:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(RECENTLY_ADDED_QUERY, { page, perPage })

    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  })
}

export async function getTrendingAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`trending:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(TRENDING_QUERY, { page, perPage })
    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}

export async function getPopularAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`popular:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(POPULAR_QUERY, { page, perPage })
    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}

export async function getTopRatedAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`top-rated:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(TOP_RATED_QUERY, { page, perPage })
    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}

export async function getSeasonalAnime(
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`seasonal:${page}`, async () => {
    const { season, seasonYear } = getCurrentSeason()
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(SEASONAL_QUERY, { page, perPage, season, seasonYear })
    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}

export async function getAnimeByGenre(
  genre: string,
  page = 1,
  perPage = 24
): Promise<PaginatedResult> {
  return withCache(`genre:${genre}:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(GENRE_QUERY, { genre, page, perPage })
    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 15 * 60 * 1000)
}

// ─── Genres list ─────────────────────────────────────────────

export const ANILIST_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
]

const TOP_AIRING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: ANIME
        status: RELEASING
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`

export async function getTopAiringAnime(
  page = 1,
  perPage = 30
): Promise<PaginatedResult> {
  return withCache(`top-airing:${page}`, async () => {
    const data = await anilistQuery<{
      Page: { media: AniListAnime[]; pageInfo: PageInfo }
    }>(TOP_AIRING_QUERY, { page, perPage })

    return {
      media: data.Page.media.map(normalizeAniListAnime),
      pageInfo: data.Page.pageInfo,
    }
  }, 10 * 60 * 1000)
}