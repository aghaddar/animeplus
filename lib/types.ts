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
  return anime.totalEpisodes ?? undefined
}

// Update WatchlistAnimeResult to include all needed properties
// lib/types.ts
export interface WatchlistAnimeResult {
  id: string
  watchlistId?: number
  title: string
  image?: string
  type?: string
  releaseDate?: string
  description?: string
  watchStatus?: "Watching" | "Completed" | "On Hold" | "Dropped"
  priority?: "High" | "Medium" | "Low"
  lastWatchedEpisode?: string
  progressPercentage?: number
}
