import React from "react";
import Image from "next/image";
import Link from "next/link";

interface AnimeSectionProps {
  id: string | number;
  title: string;
  image?: string;
  totalEpisodes?: number;
  genres?: string[];
}

const AnimeSection: React.FC<AnimeSectionProps> = ({ id, title, image, totalEpisodes, genres }) => {
  return (
    <Link href={`/anime/${id}`} className="group block bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-lg transition">
      <div className="relative aspect-[2/3] w-full h-48 sm:h-60 md:h-72 overflow-hidden rounded-t-2xl">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>
      <div className="p-3">
        <h2 className="text-base font-semibold text-white line-clamp-2 mb-1">
          {title}
        </h2>
        {totalEpisodes !== undefined && (
          <div className="text-xs text-gray-400">Episodes: {totalEpisodes}</div>
        )}
        {genres && genres.length > 0 && (
          <div className="text-xs text-gray-400">Genres: {genres.join(", ")}</div>
        )}
      </div>
    </Link>
  );
};

export default AnimeSection; 