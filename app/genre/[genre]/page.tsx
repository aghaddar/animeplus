import React from "react"
import AnimeCard from "@/components/AnimeCard"
import {
  getAnimeByGenre,
  type NormalizedAnime,
} from "@/lib/anilist"

interface GenrePageProps {
  params: Promise<{
    genre: string
  }>
}

export default async function GenrePage({
  params,
}: GenrePageProps) {
  const { genre } = await params

  let animeList: NormalizedAnime[] = []
  let error: string | null = null

  try {
    const result = await getAnimeByGenre(
      decodeURIComponent(genre),
      1,
      30
    )

    animeList = result.media
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to load anime"
  }



  return (
    <div className="min-h-screen bg-transparent flex items-start sm:items-center py-12">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-gradient-to-tr from-white/3 to-white/6 rounded-3xl shadow-2xl backdrop-blur-md p-6 sm:p-8">

          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 capitalize">
              {decodeURIComponent(genre)} Anime
            </h1>

            {error ? (
              <div className="text-red-400 mt-2">
                {error}
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                Browse anime in the{" "}
                <span className="font-semibold">
                  {decodeURIComponent(genre)}
                </span>{" "}
                genre.
              </p>
            )}
          </header>

          {!error && animeList.length === 0 ? (
            <div className="text-gray-400">
              No anime found for this genre.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {animeList.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
                image={anime.image ?? undefined}
                type={anime.type ?? undefined}
                releaseDate={anime.releaseDate ?? undefined}
                rating={anime.rating ?? undefined}
              />
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}