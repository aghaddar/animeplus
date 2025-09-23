import type { AnimeResult } from "./api"

export interface User {
  userID: number
  username: string
  email: string
  avatarURL?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// Define the Episode interface
export interface Episode {
  id: string | number
  number: number
  title?: string
  url?: string
}

// Helper function to safely get episode count
export function getEpisodeCount(anime: AnimeResult): number | undefined {
  if (typeof anime.episodes === "number") {
    return anime.episodes
  } else if (Array.isArray(anime.episodes)) {
    return anime.episodes.length
  } else if (anime.totalEpisodes) {
    return anime.totalEpisodes
  }
  return undefined
}

// Update WatchlistAnimeResult to include all needed properties
export interface WatchlistAnimeResult extends AnimeResult {
  watchlistId?: number
  status?: string
  priority?: string
  lastWatchedEpisode?: string
  progressPercentage?: number
}
