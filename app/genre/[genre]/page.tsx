import React from "react";
import AnimeCard from "@/components/AnimeCard";

export default async function GenrePage({ params }: { params: { genre: string } }) {
  const genre = decodeURIComponent(params.genre);
  let animeList = [];
  let error = null;

  try {
    const res = await fetch(`https://api-consumet-nu.vercel.app/anime/zoro/genre/${encodeURIComponent(genre)}`);
    if (!res.ok) throw new Error("Failed to fetch anime for this genre.");
    const data = await res.json();
    animeList = data.results || [];
  } catch (err: any) {
    error = err.message || "Unknown error";
  }

  return (
    <div className="min-h-screen bg-transparent flex items-start sm:items-center py-12">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  <div className="bg-gradient-to-tr from-white/3 to-white/6 rounded-3xl shadow-2xl backdrop-blur-md p-6 sm:p-8">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 capitalize">{genre} Anime</h1>
            {error ? (
              <div className="text-red-400 mt-2">{error}</div>
            ) : (
              <p className="text-sm text-gray-300">Browse curated anime titles in the <span className="font-semibold">{genre}</span> genre.</p>
            )}
          </header>

          {!error && animeList.length === 0 ? (
            <div className="text-gray-400">No anime found for this genre.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {animeList.map((anime: any) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title?.userPreferred || anime.title || "Untitled"}
                  image={anime.image}
                  type={anime.type}
                  releaseDate={anime.releaseDate}
                  rating={anime.rating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 