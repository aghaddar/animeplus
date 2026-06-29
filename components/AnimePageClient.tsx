"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NormalizedAnime } from "@/lib/anilist"
import WatchlistButton from "@/components/WatchlistButton"
import ExpandableText from "@/components/ExpandableText"
import StreamingLinks from "@/components/StreamingLinks"


interface AnimePageClientProps {
  animeInfo: NormalizedAnime
}

export default function AnimePageClient({ animeInfo }: AnimePageClientProps) {
  const [relatedPage, setRelatedPage] = useState(0)
  const recsPerPage = 12
  const totalRecPages = Math.ceil(
    (animeInfo.recommendations?.length ?? 0) / recsPerPage
  )
  const currentRecs = animeInfo.recommendations?.slice(
    relatedPage * recsPerPage,
    (relatedPage + 1) * recsPerPage
  )

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: animeInfo.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const statusColor: Record<string, string> = {
    RELEASING: "bg-green-500/20 text-green-400 border-green-500/30",
    FINISHED: "bg-gray-700/50 text-gray-300 border-gray-600",
    NOT_YET_RELEASED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const statusLabel: Record<string, string> = {
    RELEASING: "● Airing",
    FINISHED: "Finished",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Banner image */}
      {animeInfo.bannerImage && (
        <div className="relative w-full h-48 md:h-72 overflow-hidden">
          <Image
            src={animeInfo.bannerImage}
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b
                          from-transparent via-transparent to-[#0a0a0f]" />
        </div>
      )}

      <div className="container mx-auto px-4">

        {/* Header row */}
        <div className={`flex gap-4 md:gap-6 relative z-10 mb-8
                          ${animeInfo.bannerImage ? "-mt-20 md:-mt-32" : "mt-8"}`}>

          {/* Cover art */}
          <div className="flex-shrink-0 w-28 md:w-44">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden
                            ring-4 ring-[#0a0a0f] shadow-2xl">
              <Image
                src={animeInfo.image || "/placeholder.svg"}
                alt={animeInfo.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title + meta */}
          <div className="flex flex-col justify-end pb-1 min-w-0">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold
                            mb-3 leading-tight truncate">
              {animeInfo.title}
            </h1>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {animeInfo.rating && (
                <span className="flex items-center gap-1 bg-yellow-500/20
                                  text-yellow-400 border border-yellow-500/30
                                  px-3 py-1 rounded-full text-xs font-semibold">
                  ★ {animeInfo.rating}
                </span>
              )}
              {animeInfo.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                                  border ${statusColor[animeInfo.status]
                                    ?? "bg-gray-700 text-gray-300 border-gray-600"}`}>
                  {statusLabel[animeInfo.status] ?? animeInfo.status}
                </span>
              )}
              {animeInfo.type && (
                <span className="bg-purple-500/20 text-purple-300
                                  border border-purple-500/30
                                  px-3 py-1 rounded-full text-xs">
                  {animeInfo.type}
                </span>
              )}
              {animeInfo.totalEpisodes && (
                <span className="bg-gray-800 text-gray-300
                                  border border-gray-700
                                  px-3 py-1 rounded-full text-xs">
                  {animeInfo.totalEpisodes} eps
                </span>
              )}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5">
              {animeInfo.genres?.slice(0, 5).map((genre) => (
                <Link
                  key={genre}
                  href={`/genre/${encodeURIComponent(genre)}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-800/80
                              hover:bg-purple-600/30 hover:text-purple-300
                              border border-gray-700 hover:border-purple-500/50
                              transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Action buttons */}
            <div className="flex gap-3">
              <WatchlistButton
                animeId={animeInfo.id}
                title={animeInfo.title}
                imageUrl={animeInfo.image}
                className="rounded-full px-6"
              />
              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-full gap-2 border-gray-700
                            hover:border-purple-500 hover:bg-purple-600/10"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Synopsis */}
            {animeInfo.description && (
              <div className="bg-gray-900/50 rounded-2xl p-6
                              border border-gray-800">
                <h2 className="text-base font-semibold mb-3 text-gray-200">
                  Synopsis
                </h2>
                <ExpandableText text={animeInfo.description} />
              </div>
            )}

            {/* Where to watch */}
            {animeInfo.externalLinks && animeInfo.externalLinks.length > 0 && (
              <StreamingLinks links={animeInfo.externalLinks} />
            )}
          </div>

          {/* Right sidebar — info */}
          <div className="bg-gray-900/50 rounded-2xl p-6
                          border border-gray-800 h-fit">
            <h3 className="font-semibold mb-4 text-gray-300 text-sm uppercase
                            tracking-wider">
              Information
            </h3>
            <dl className="space-y-3">
              {[
                ["Format",   animeInfo.type],
                ["Episodes", animeInfo.totalEpisodes?.toString()],
                ["Status",   statusLabel[animeInfo.status ?? ""] ?? animeInfo.status],
                ["Season",   animeInfo.season && animeInfo.releaseDate
                               ? `${animeInfo.season} ${animeInfo.releaseDate}`
                               : animeInfo.releaseDate],
                ["Score",    animeInfo.rating ? `${animeInfo.rating} / 10` : null],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between
                                              text-sm gap-4">
                    <dt className="text-gray-500 flex-shrink-0">{label}</dt>
                    <dd className="text-white font-medium text-right">
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>

            {/* All genres */}
            {animeInfo.genres && animeInfo.genres.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-800">
                <p className="text-gray-500 text-sm mb-3 uppercase
                                tracking-wider">
                  Genres
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {animeInfo.genres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/genre/${encodeURIComponent(genre)}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-800
                                  hover:bg-purple-600/30 hover:text-purple-300
                                  border border-gray-700 transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {animeInfo.recommendations && animeInfo.recommendations.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">You Might Also Like</h2>

              {totalRecPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRelatedPage((p) => Math.max(0, p - 1))}
                    disabled={relatedPage === 0}
                    className="p-1.5 rounded-full bg-gray-800 hover:bg-purple-600
                                disabled:opacity-30 disabled:cursor-not-allowed
                                transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-gray-500 text-xs">
                    {relatedPage + 1} / {totalRecPages}
                  </span>
                  <button
                    onClick={() =>
                      setRelatedPage((p) =>
                        Math.min(totalRecPages - 1, p + 1)
                      )
                    }
                    disabled={relatedPage >= totalRecPages - 1}
                    className="p-1.5 rounded-full bg-gray-800 hover:bg-purple-600
                                disabled:opacity-30 disabled:cursor-not-allowed
                                transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5
                            lg:grid-cols-6 gap-3 md:gap-4">
              {currentRecs?.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/anime/${rec.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden
                                  mb-2 bg-gray-800">
                    <Image
                      src={rec.image || "/placeholder.svg"}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105
                                transition-transform duration-300"
                    />
                    {rec.rating && (
                      <div className="absolute top-1.5 right-1.5 bg-black/70
                                      backdrop-blur-sm text-yellow-400 text-xs
                                      px-1.5 py-0.5 rounded-full font-medium">
                        ★ {rec.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium line-clamp-2
                              group-hover:text-purple-400 transition-colors
                                leading-snug">
                    {rec.title}
                  </h3>
                  {rec.type && (
                    <p className="text-xs text-gray-600 mt-0.5">{rec.type}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}