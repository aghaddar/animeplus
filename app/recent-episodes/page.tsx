import React from "react";
import AnimeCard from "@/components/AnimeCard";

export default async function RecentEpisodesPage() {
  let episodes = [];
  let error = null;

  try {
    const res = await fetch("https://api-consumet-nu.vercel.app/anime/zoro/recent-episodes");
    if (!res.ok) throw new Error("Failed to fetch recent episodes.");
    const data = await res.json();
    episodes = data.results || [];
  } catch (err: any) {
    error = err.message || "Unknown error";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-8 text-white">Recent Episodes</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!error && episodes.length === 0 && (
          <div className="text-gray-400">No recent episodes found.</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {episodes.map((ep: any) => (
            <AnimeCard
              key={ep.id}
              id={ep.id}
              title={ep.title || "Untitled"}
              image={ep.image}
              type={ep.type}
              releaseDate={ep.releaseDate || ep.year}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 