import React from "react";
import AnimeCard from "@/components/AnimeCard";
import { getMostFavoritedAnime } from "@/lib/anilist";

export const revalidate = 600;

export default async function MostFavoritePage() {
  const { media: animeList } = await getMostFavoritedAnime(1, 30);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Top Favorite Anime
        </h1>

        {animeList.length === 0 ? (
          <div className="text-gray-400">
            No top favorite anime found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {animeList.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
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
  );
}