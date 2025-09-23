import React from "react";
import AnimeCard from "@/components/AnimeCard";

export default async function LatestCompletedPage() {
  let animeList = [];
  let error = null;

  try {
    const res = await fetch("https://api-consumet-nu.vercel.app/anime/zoro/latest-completed");
    if (!res.ok) throw new Error("Failed to fetch latest completed anime.");
    const data = await res.json();
    animeList = data.results || [];
  } catch (err: any) {
    error = err.message || "Unknown error";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-8 text-white">Latest Completed Anime</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!error && animeList.length === 0 && (
          <div className="text-gray-400">No latest completed anime found.</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {animeList.map((anime: any) => (
            <AnimeCard
              key={anime.id}
              id={anime.id}
              title={anime.title || "Untitled"}
              image={anime.image}
              type={anime.type}
              releaseDate={anime.releaseDate || anime.year}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 